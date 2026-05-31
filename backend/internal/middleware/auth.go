package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type JWTClaims struct {
	Authorized bool `json:"authorized"`
	jwt.RegisteredClaims
}

func JWTAuth(secret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			auth := c.Request().Header.Get("Authorization")
			if auth == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "token ausente")
			}

			tokenStr := strings.TrimPrefix(auth, "Bearer ")
			token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, echo.NewHTTPError(http.StatusUnauthorized, "método de assinatura inválido")
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "token inválido ou expirado")
			}

			claims, ok := token.Claims.(*JWTClaims)
			if !ok || !claims.Authorized {
				return echo.NewHTTPError(http.StatusUnauthorized, "não autorizado")
			}

			c.Set("claims", claims)
			return next(c)
		}
	}
}
