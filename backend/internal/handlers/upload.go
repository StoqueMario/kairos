package handlers

import (
	"context"
	"mime/multipart"
	"net/http"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"kairos/internal/models"
)

// ─── Upload Helper ────────────────────────────────────────────────────────────

func uploadToCloudinary(cld *cloudinary.Cloudinary, file multipart.File, folder, publicID string) (url, pubID string, err error) {
	ctx := context.Background()
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:   folder,
		PublicID: publicID,
	})
	if err != nil {
		return "", "", err
	}
	return resp.SecureURL, resp.PublicID, nil
}

// ─── Cartas ───────────────────────────────────────────────────────────────────

type CartaHandler struct {
	db  *gorm.DB
	cld *cloudinary.Cloudinary
}

func NewCartaHandler(db *gorm.DB, cld *cloudinary.Cloudinary) *CartaHandler {
	return &CartaHandler{db: db, cld: cld}
}

func (h *CartaHandler) List(c echo.Context) error {
	var cartas []models.Carta
	h.db.Order("created_at desc").Find(&cartas)
	return c.JSON(http.StatusOK, cartas)
}

func (h *CartaHandler) Create(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "arquivo obrigatório")
	}
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao abrir arquivo")
	}
	defer src.Close()

	url, pubID, err := uploadToCloudinary(h.cld, src, "kairos/cartas", uuid.New().String())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro no upload")
	}

	fileType := "image"
	if file.Header.Get("Content-Type") == "application/pdf" {
		fileType = "pdf"
	}

	carta := models.Carta{
		Title:       c.FormValue("title"),
		Description: c.FormValue("description"),
		From:        c.FormValue("from"),
		Date:        c.FormValue("date"),
		FileURL:     url,
		PublicID:    pubID,
		FileType:    fileType,
	}
	h.db.Create(&carta)
	return c.JSON(http.StatusCreated, carta)
}

func (h *CartaHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	var carta models.Carta
	if err := h.db.First(&carta, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "carta não encontrada")
	}
	if carta.PublicID != "" && h.cld != nil {
		h.cld.Upload.Destroy(context.Background(), uploader.DestroyParams{PublicID: carta.PublicID})
	}
	h.db.Delete(&carta)
	return c.NoContent(http.StatusNoContent)
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

type FotoHandler struct {
	db  *gorm.DB
	cld *cloudinary.Cloudinary
}

func NewFotoHandler(db *gorm.DB, cld *cloudinary.Cloudinary) *FotoHandler {
	return &FotoHandler{db: db, cld: cld}
}

func (h *FotoHandler) List(c echo.Context) error {
	var fotos []models.Foto
	event := c.QueryParam("event")
	q := h.db.Order("taken_at desc, created_at desc")
	if event != "" {
		q = q.Where("event_name = ?", event)
	}
	q.Find(&fotos)
	return c.JSON(http.StatusOK, fotos)
}

func (h *FotoHandler) Create(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "arquivo obrigatório")
	}
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro ao abrir arquivo")
	}
	defer src.Close()

	url, pubID, err := uploadToCloudinary(h.cld, src, "kairos/fotos", uuid.New().String())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "erro no upload")
	}

	foto := models.Foto{
		URL:       url,
		PublicID:  pubID,
		Caption:   c.FormValue("caption"),
		EventName: c.FormValue("event_name"),
		TakenAt:   c.FormValue("taken_at"),
	}
	h.db.Create(&foto)
	return c.JSON(http.StatusCreated, foto)
}

func (h *FotoHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	var foto models.Foto
	if err := h.db.First(&foto, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "foto não encontrada")
	}
	if foto.PublicID != "" && h.cld != nil {
		h.cld.Upload.Destroy(context.Background(), uploader.DestroyParams{PublicID: foto.PublicID})
	}
	h.db.Delete(&foto)
	return c.NoContent(http.StatusNoContent)
}
