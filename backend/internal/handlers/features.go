package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"kairos/internal/models"
)

// ─── Desejos ──────────────────────────────────────────────────────────────────

type DesejoHandler struct{ db *gorm.DB }

func NewDesejoHandler(db *gorm.DB) *DesejoHandler { return &DesejoHandler{db: db} }

func (h *DesejoHandler) List(c echo.Context) error {
	var items []models.Desejo
	h.db.Order("created_at desc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *DesejoHandler) Create(c echo.Context) error {
	var item models.Desejo
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *DesejoHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Desejo
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *DesejoHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.Desejo{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Metas ────────────────────────────────────────────────────────────────────

type MetaHandler struct{ db *gorm.DB }

func NewMetaHandler(db *gorm.DB) *MetaHandler { return &MetaHandler{db: db} }

func (h *MetaHandler) List(c echo.Context) error {
	var items []models.Meta
	h.db.Order("created_at desc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *MetaHandler) Create(c echo.Context) error {
	var item models.Meta
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *MetaHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Meta
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrada")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *MetaHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.Meta{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Lugares ──────────────────────────────────────────────────────────────────

type LugarHandler struct{ db *gorm.DB }

func NewLugarHandler(db *gorm.DB) *LugarHandler { return &LugarHandler{db: db} }

func (h *LugarHandler) List(c echo.Context) error {
	var items []models.Lugar
	h.db.Order("wish_level desc, created_at desc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *LugarHandler) Create(c echo.Context) error {
	var item models.Lugar
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *LugarHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Lugar
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *LugarHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.Lugar{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Restaurantes ─────────────────────────────────────────────────────────────

type RestauranteHandler struct{ db *gorm.DB }

func NewRestauranteHandler(db *gorm.DB) *RestauranteHandler {
	return &RestauranteHandler{db: db}
}

func (h *RestauranteHandler) List(c echo.Context) error {
	var items []models.Restaurante
	h.db.Order("created_at desc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *RestauranteHandler) Create(c echo.Context) error {
	var item models.Restaurante
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *RestauranteHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Restaurante
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *RestauranteHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.Restaurante{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineHandler struct{ db *gorm.DB }

func NewTimelineHandler(db *gorm.DB) *TimelineHandler { return &TimelineHandler{db: db} }

func (h *TimelineHandler) List(c echo.Context) error {
	var items []models.TimelineItem
	h.db.Order("date asc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *TimelineHandler) Create(c echo.Context) error {
	var item models.TimelineItem
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *TimelineHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.TimelineItem
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *TimelineHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.TimelineItem{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Filmes ───────────────────────────────────────────────────────────────────

type FilmeHandler struct{ db *gorm.DB }

func NewFilmeHandler(db *gorm.DB) *FilmeHandler { return &FilmeHandler{db: db} }

func (h *FilmeHandler) List(c echo.Context) error {
	var items []models.Filme
	status := c.QueryParam("status")
	q := h.db.Order("created_at desc")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *FilmeHandler) Create(c echo.Context) error {
	var item models.Filme
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *FilmeHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Filme
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *FilmeHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.Filme{})
	return c.NoContent(http.StatusNoContent)
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

type PlaylistHandler struct{ db *gorm.DB }

func NewPlaylistHandler(db *gorm.DB) *PlaylistHandler { return &PlaylistHandler{db: db} }

func (h *PlaylistHandler) List(c echo.Context) error {
	var items []models.PlaylistItem
	h.db.Order("created_at desc").Find(&items)
	return c.JSON(http.StatusOK, items)
}

func (h *PlaylistHandler) Create(c echo.Context) error {
	var item models.PlaylistItem
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Create(&item)
	return c.JSON(http.StatusCreated, item)
}

func (h *PlaylistHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.PlaylistItem
	if err := h.db.First(&item, "id = ?", id).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "não encontrado")
	}
	if err := c.Bind(&item); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "dados inválidos")
	}
	h.db.Save(&item)
	return c.JSON(http.StatusOK, item)
}

func (h *PlaylistHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	h.db.Where("id = ?", id).Delete(&models.PlaylistItem{})
	return c.NoContent(http.StatusNoContent)
}
