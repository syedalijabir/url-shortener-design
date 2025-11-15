package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	url_service "github.com/syedalijabir/protos/url-service"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// HTTP Request/Response structures
type ShortenRequest struct {
	URL         string `json:"url" binding:"required"`
	CustomAlias string `json:"custom_alias,omitempty"`
}

type ShortenResponse struct {
	ShortCode   string `json:"short_code"`
	OriginalURL string `json:"original_url"`
	Error       string `json:"error,omitempty"`
}

type StatsResponse struct {
	ShortCode  string `json:"short_code"`
	ClickCount int64  `json:"click_count"`
	CreatedAt  string `json:"created_at"`
	Error      string `json:"error,omitempty"`
}

type GatewayServer struct {
	urlClient url_service.URLServiceClient
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func NewGatewayServer() (*GatewayServer, error) {
	urlHost := getEnv("URL_SERVICE_HOST", "url-service")
	urlConn, err := grpc.Dial(urlHost+":50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	return &GatewayServer{
		urlClient: url_service.NewURLServiceClient(urlConn),
	}, nil
}

func (g *GatewayServer) ShortenURL(c *gin.Context) {
	var req ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ShortenResponse{Error: err.Error()})
		return
	}

	// Simple protocol conversion - no business logic
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := g.urlClient.ShortenURL(ctx, &url_service.ShortenRequest{
		OriginalUrl: req.URL,
		CustomAlias: req.CustomAlias,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, ShortenResponse{Error: err.Error()})
		return
	}

	if resp.Error != "" {
		c.JSON(http.StatusBadRequest, ShortenResponse{Error: resp.Error})
		return
	}

	c.JSON(http.StatusOK, ShortenResponse{
		ShortCode:   resp.ShortCode,
		OriginalURL: resp.OriginalUrl,
	})
}

func (g *GatewayServer) RedirectURL(c *gin.Context) {
	shortCode := c.Param("code")
	if shortCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Short code is required"})
		return
	}

	// Simple protocol conversion - URL service handles cache/storage logic
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	urlResp, err := g.urlClient.GetOriginalURL(ctx, &url_service.GetOriginalRequest{
		ShortCode: shortCode,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !urlResp.Found {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.Redirect(http.StatusFound, urlResp.OriginalUrl)
}

func (g *GatewayServer) GetStats(c *gin.Context) {
	shortCode := c.Param("code")
	if shortCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Short code is required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := g.urlClient.GetURLStats(ctx, &url_service.StatsRequest{
		ShortCode: shortCode,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, StatsResponse{Error: err.Error()})
		return
	}

	if resp.Error != "" {
		c.JSON(http.StatusNotFound, StatsResponse{Error: resp.Error})
		return
	}

	c.JSON(http.StatusOK, StatsResponse{
		ShortCode:  resp.ShortCode,
		ClickCount: resp.ClickCount,
		CreatedAt:  resp.CreatedAt,
	})
}

func (g *GatewayServer) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "gateway",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func main() {
	gateway, err := NewGatewayServer()
	if err != nil {
		log.Fatalf("Failed to create gateway server: %v", err)
	}

	router := gin.Default()

	// API routes - HTTP to gRPC conversion
	router.POST("/shorten", gateway.ShortenURL)
	router.GET("/stats/:code", gateway.GetStats)
	router.GET("/:code", gateway.RedirectURL)

	router.GET("/health", gateway.HealthCheck)
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "URL Shortener Gateway",
			"version": "1.0.0",
		})
	})

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start gateway server: %v", err)
	}
}
