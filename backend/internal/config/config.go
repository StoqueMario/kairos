package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port             string
	DatabasePath     string
	JWTSecret        string
	AdminPassword    string
	CloudinaryURL    string
	CloudinaryCloud  string
	CloudinaryKey    string
	CloudinarySecret string
	CORSOrigins      string
	RelationshipStart string
}

func Load() *Config {
	return &Config{
		Port:             getEnv("PORT", "8080"),
		DatabasePath:     getEnv("DATABASE_PATH", "kairos.db"),
		JWTSecret:        getEnv("JWT_SECRET", "kairos-dev-secret-change-in-production"),
		AdminPassword:    getEnv("ADMIN_PASSWORD", "yasmin2025"),
		CloudinaryURL:    getEnv("CLOUDINARY_URL", ""),
		CloudinaryCloud:  getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinarySecret: getEnv("CLOUDINARY_API_SECRET", ""),
		CORSOrigins:      getEnv("CORS_ORIGINS", "http://localhost:5173"),
		RelationshipStart: getEnv("RELATIONSHIP_START", "2025-01-29"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
