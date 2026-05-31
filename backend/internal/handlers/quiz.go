package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"kairos/internal/middleware"
	"kairos/internal/models"
)

type QuizHandler struct {
	db        *gorm.DB
	jwtSecret string
	adminPass string
}

func NewQuizHandler(db *gorm.DB, jwtSecret, adminPass string) *QuizHandler {
	return &QuizHandler{db: db, jwtSecret: jwtSecret, adminPass: adminPass}
}

// GET /api/quiz — retorna perguntas SEM as respostas
func (h *QuizHandler) GetQuestions(c echo.Context) error {
	var questions []models.QuizQuestion
	if err := h.db.Order("\"order\"").Find(&questions).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao buscar perguntas")
	}

	// Sanitize: nunca enviar o campo Answer
	type SafeQuestion struct {
		ID      string   `json:"id"`
		Order   int      `json:"order"`
		Text    string   `json:"text"`
		Options []string `json:"options"`
	}
	safe := make([]SafeQuestion, len(questions))
	for i, q := range questions {
		safe[i] = SafeQuestion{
			ID:      q.ID.String(),
			Order:   q.Order,
			Text:    q.Text,
			Options: q.Options,
		}
	}
	return c.JSON(http.StatusOK, safe)
}

// POST /api/quiz/validate — valida respostas e retorna JWT se correto
func (h *QuizHandler) ValidateAnswers(c echo.Context) error {
	type AnswerInput struct {
		QuestionID string `json:"question_id"`
		Answer     string `json:"answer"`
	}
	type Input struct {
		Answers []AnswerInput `json:"answers"`
	}

	var input Input
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "formato inválido")
	}

	var questions []models.QuizQuestion
	if err := h.db.Order("\"order\"").Find(&questions).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro interno")
	}

	answerMap := make(map[string]string)
	for _, a := range input.Answers {
		answerMap[a.QuestionID] = strings.TrimSpace(strings.ToLower(a.Answer))
	}

	for _, q := range questions {
		given, ok := answerMap[q.ID.String()]
		if !ok {
			return c.JSON(http.StatusOK, map[string]interface{}{"correct": false, "message": "resposta faltando"})
		}
		if given != strings.TrimSpace(strings.ToLower(q.Answer)) {
			return c.JSON(http.StatusOK, map[string]interface{}{"correct": false, "message": "resposta errada"})
		}
	}

	// Todas corretas → gera JWT válido por 30 dias
	claims := &middleware.JWTClaims{
		Authorized: true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao gerar token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"correct": true,
		"token":   signed,
	})
}

// POST /api/admin/quiz/bypass — emite JWT sem precisar responder o quiz (protegido por admin)
func (h *QuizHandler) Bypass(c echo.Context) error {
	claims := &middleware.JWTClaims{
		Authorized: true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao gerar token")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"token": signed})
}

// GET /api/admin/quiz — lista perguntas COM respostas (protegido por admin)
func (h *QuizHandler) AdminGetQuestions(c echo.Context) error {
	var questions []models.QuizQuestion
	h.db.Order("\"order\"").Find(&questions)
	return c.JSON(http.StatusOK, questions)
}

// PUT /api/admin/quiz — substitui todas as perguntas (protegido por admin)
func (h *QuizHandler) AdminUpdateQuestions(c echo.Context) error {
	var questions []models.QuizQuestion
	if err := c.Bind(&questions); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "formato inválido")
	}

	// Deleta todas e recria
	if err := h.db.Where("1=1").Delete(&models.QuizQuestion{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao deletar perguntas antigas")
	}
	for i := range questions {
		questions[i].ID = [16]byte{}
		questions[i].Order = i + 1
	}
	if err := h.db.Create(&questions).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao salvar perguntas")
	}
	return c.JSON(http.StatusOK, questions)
}
