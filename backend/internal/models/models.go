package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── Base ────────────────────────────────────────────────────────────────────

type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

type QuizQuestion struct {
	Base
	Order   int      `json:"order" gorm:"uniqueIndex"`
	Text    string   `json:"text" gorm:"not null"`
	Options []string `json:"options" gorm:"serializer:json"`
	Answer  string   `json:"-" gorm:"not null"` // hidden from client
}

// ─── Carta ────────────────────────────────────────────────────────────────────

type Carta struct {
	Base
	Title       string `json:"title"`
	Description string `json:"description"`
	FileURL     string `json:"file_url" gorm:"not null"`
	FileType    string `json:"file_type"` // "image" | "pdf"
	PublicID    string `json:"public_id"`  // cloudinary public_id
	From        string `json:"from"`        // "eu" | "yasmin"
	Date        string `json:"date"`        // data escrita na carta (livre)
}

// ─── Foto ─────────────────────────────────────────────────────────────────────

type Foto struct {
	Base
	URL       string `json:"url" gorm:"not null"`
	PublicID  string `json:"public_id"`
	Caption   string `json:"caption"`
	EventName string `json:"event_name"`
	TakenAt   string `json:"taken_at"` // YYYY-MM-DD
}

// ─── Desejo ───────────────────────────────────────────────────────────────────

type Desejo struct {
	Base
	Text      string `json:"text" gorm:"not null"`
	Completed bool   `json:"completed" gorm:"default:false"`
	Category  string `json:"category"` // "viagem" | "presente" | "experiência" | "outro"
	AddedBy   string `json:"added_by"` // "eu" | "yasmin"
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

type Meta struct {
	Base
	Title       string `json:"title" gorm:"not null"`
	Description string `json:"description"`
	Progress    int    `json:"progress" gorm:"default:0"` // 0-100
	Completed   bool   `json:"completed" gorm:"default:false"`
	Deadline    string `json:"deadline"` // YYYY-MM-DD, opcional
	Emoji       string `json:"emoji"`
}

// ─── Lugar ────────────────────────────────────────────────────────────────────

type Lugar struct {
	Base
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	Country     string `json:"country"`
	City        string `json:"city"`
	Visited     bool   `json:"visited" gorm:"default:false"`
	VisitedAt   string `json:"visited_at"`
	ImageURL    string `json:"image_url"`
	PublicID    string `json:"public_id"`
	WishLevel   int    `json:"wish_level" gorm:"default:3"` // 1-5
}

// ─── Restaurante ──────────────────────────────────────────────────────────────

type Restaurante struct {
	Base
	Name        string  `json:"name" gorm:"not null"`
	Description string  `json:"description"`
	Cuisine     string  `json:"cuisine"` // "italiana" | "japonesa" etc
	City        string  `json:"city"`
	Address     string  `json:"address"`
	Visited     bool    `json:"visited" gorm:"default:false"`
	VisitedAt   string  `json:"visited_at"`
	Rating      float64 `json:"rating"`  // 0.0-5.0
	Notes       string  `json:"notes"`
	MapsURL     string  `json:"maps_url"`
	ImageURL    string  `json:"image_url"`
	PublicID    string  `json:"public_id"`
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineItem struct {
	Base
	Title       string `json:"title" gorm:"not null"`
	Description string `json:"description"`
	Date        string `json:"date" gorm:"not null"` // YYYY-MM-DD
	Emoji       string `json:"emoji"`
	ImageURL    string `json:"image_url"`
	PublicID    string `json:"public_id"`
}

// ─── Filme ────────────────────────────────────────────────────────────────────

type Filme struct {
	Base
	Title    string  `json:"title" gorm:"not null"`
	Year     int     `json:"year"`
	Status   string  `json:"status" gorm:"default:'quero ver'"` // "quero ver" | "assistindo" | "assistimos"
	Rating   float64 `json:"rating"`
	Notes    string  `json:"notes"`
	PosterURL string `json:"poster_url"`
	StreamOn  string `json:"stream_on"` // "Netflix" | "Prime" etc
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

type PlaylistItem struct {
	Base
	Title    string `json:"title" gorm:"not null"`
	Artist   string `json:"artist"`
	SpotifyURL string `json:"spotify_url"`
	YoutubeURL string `json:"youtube_url"`
	Meaning  string `json:"meaning"` // por que essa música é especial
	AddedBy  string `json:"added_by"`
}
