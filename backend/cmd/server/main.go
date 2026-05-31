package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"kairos/internal/config"
	"kairos/internal/handlers"
	"kairos/internal/middleware"
	"kairos/internal/models"
)

func main() {
	godotenv.Load() // carrega .env se existir (ignora erro em produção)

	cfg := config.Load()

	// ── Banco de dados ───────────────────────────────────────────────────────
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("falha ao conectar no banco: %v", err)
	}

	// Auto-migrate
	if err := db.AutoMigrate(
		&models.QuizQuestion{},
		&models.Carta{},
		&models.Foto{},
		&models.Desejo{},
		&models.Meta{},
		&models.Lugar{},
		&models.Restaurante{},
		&models.TimelineItem{},
		&models.Filme{},
		&models.PlaylistItem{},
	); err != nil {
		log.Fatalf("falha na migration: %v", err)
	}

	// Seed das perguntas do quiz se ainda não existirem
	seedQuiz(db)

	// ── Cloudinary ───────────────────────────────────────────────────────────
	var cld *cloudinary.Cloudinary
	if cfg.CloudinaryURL != "" {
		cld, err = cloudinary.NewFromURL(cfg.CloudinaryURL)
		if err != nil {
			log.Printf("aviso: cloudinary não configurado: %v", err)
		}
	} else if cfg.CloudinaryCloud != "" {
		cld, err = cloudinary.NewFromParams(cfg.CloudinaryCloud, cfg.CloudinaryKey, cfg.CloudinarySecret)
		if err != nil {
			log.Printf("aviso: cloudinary não configurado: %v", err)
		}
	}

	// ── Echo ─────────────────────────────────────────────────────────────────
	e := echo.New()
	e.HideBanner = true

	origins := strings.Split(cfg.CORSOrigins, ",")
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins: origins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization, "X-Admin-Password"},
	}))
	e.Use(echomw.Logger())
	e.Use(echomw.Recover())

	// ── Rotas públicas ───────────────────────────────────────────────────────
	api := e.Group("/api")

	api.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok", "relationship_start": cfg.RelationshipStart})
	})

	quiz := handlers.NewQuizHandler(db, cfg.JWTSecret, cfg.AdminPassword)
	api.GET("/quiz", quiz.GetQuestions)
	api.POST("/quiz/validate", quiz.ValidateAnswers)

	// ── Rotas protegidas (requerem JWT) ──────────────────────────────────────
	auth := api.Group("", middleware.JWTAuth(cfg.JWTSecret))

	// Admin (requer senha extra via header X-Admin-Password)
	admin := api.Group("/admin", adminAuth(cfg.AdminPassword))
	admin.GET("/quiz", quiz.AdminGetQuestions)
	admin.PUT("/quiz", quiz.AdminUpdateQuestions)
	admin.POST("/quiz/bypass", quiz.Bypass)

	// Cartas
	carta := handlers.NewCartaHandler(db, cld)
	auth.GET("/cartas", carta.List)
	auth.POST("/cartas", carta.Create)
	auth.DELETE("/cartas/:id", carta.Delete)

	// Fotos
	foto := handlers.NewFotoHandler(db, cld)
	auth.GET("/fotos", foto.List)
	auth.POST("/fotos", foto.Create)
	auth.DELETE("/fotos/:id", foto.Delete)

	// Desejos
	desejo := handlers.NewDesejoHandler(db)
	auth.GET("/desejos", desejo.List)
	auth.POST("/desejos", desejo.Create)
	auth.PUT("/desejos/:id", desejo.Update)
	auth.DELETE("/desejos/:id", desejo.Delete)

	// Metas
	meta := handlers.NewMetaHandler(db)
	auth.GET("/metas", meta.List)
	auth.POST("/metas", meta.Create)
	auth.PUT("/metas/:id", meta.Update)
	auth.DELETE("/metas/:id", meta.Delete)

	// Lugares
	lugar := handlers.NewLugarHandler(db)
	auth.GET("/lugares", lugar.List)
	auth.POST("/lugares", lugar.Create)
	auth.PUT("/lugares/:id", lugar.Update)
	auth.DELETE("/lugares/:id", lugar.Delete)

	// Restaurantes
	restaurante := handlers.NewRestauranteHandler(db)
	auth.GET("/restaurantes", restaurante.List)
	auth.POST("/restaurantes", restaurante.Create)
	auth.PUT("/restaurantes/:id", restaurante.Update)
	auth.DELETE("/restaurantes/:id", restaurante.Delete)

	// Timeline
	timeline := handlers.NewTimelineHandler(db)
	auth.GET("/timeline", timeline.List)
	auth.POST("/timeline", timeline.Create)
	auth.PUT("/timeline/:id", timeline.Update)
	auth.DELETE("/timeline/:id", timeline.Delete)

	// Filmes
	filme := handlers.NewFilmeHandler(db)
	auth.GET("/filmes", filme.List)
	auth.POST("/filmes", filme.Create)
	auth.PUT("/filmes/:id", filme.Update)
	auth.DELETE("/filmes/:id", filme.Delete)

	// Playlist
	playlist := handlers.NewPlaylistHandler(db)
	auth.GET("/playlist", playlist.List)
	auth.POST("/playlist", playlist.Create)
	auth.PUT("/playlist/:id", playlist.Update)
	auth.DELETE("/playlist/:id", playlist.Delete)

	// ── Start ────────────────────────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🌿 Kairos backend rodando em %s", addr)
	if err := e.Start(addr); err != nil {
		log.Fatal(err)
	}
}

// adminAuth verifica o header X-Admin-Password
func adminAuth(password string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if c.Request().Header.Get("X-Admin-Password") != password {
				return echo.NewHTTPError(http.StatusForbidden, "senha de admin inválida")
			}
			return next(c)
		}
	}
}

func seedQuiz(db *gorm.DB) {
	var count int64
	db.Model(&models.QuizQuestion{}).Count(&count)
	if count > 0 {
		return
	}

	questions := []models.QuizQuestion{
		{
			Order:   1,
			Text:    "Em que data a gente começou a namorar?",
			Options: []string{"15 de janeiro", "29 de janeiro", "14 de fevereiro", "29 de dezembro"},
			Answer:  "29 de janeiro",
		},
		{
			Order:   2,
			Text:    "Qual é o apelido mais bobo que eu tenho pra você?",
			Options: []string{"Amor", "Yayas", "Minha flor", "Nenê"},
			Answer:  "Yayas",
		},
		{
			Order:   3,
			Text:    "Qual foi a primeira coisa que me chamou atenção em você?",
			Options: []string{"Seu jeito de rir", "Seus olhos", "Sua voz", "Sua forma de falar"},
			Answer:  "Seus olhos",
		},
		{
			Order:   4,
			Text:    "Qual é a nossa comida favorita pra pedir juntas?",
			Options: []string{"Pizza", "Hambúrguer", "Sushi", "Açaí"},
			Answer:  "Pizza",
		},
		{
			Order:   5,
			Text:    "O que eu faço toda vez que fico nervosa perto de você?",
			Options: []string{"Fico em silêncio", "Falo demais", "Rio sem parar", "Fico vermelha"},
			Answer:  "Falo demais",
		},
	}

	db.Create(&questions)
	log.Println("Quiz seed: perguntas padrão criadas. Lembre de atualizar via /api/admin/quiz!")
}
