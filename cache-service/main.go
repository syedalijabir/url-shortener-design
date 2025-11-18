package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	proto "github.com/syedalijabir/protos/cache-service"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
)

type cacheServer struct {
	proto.UnimplementedCacheServiceServer
	rdb *redis.Client
}

// Get retrieves a value from Redis
func (s *cacheServer) Get(ctx context.Context, req *proto.GetRequest) (*proto.GetResponse, error) {
	log.Printf("Cache GET request for key: %s", req.Key)

	val, err := s.rdb.Get(ctx, req.Key).Result()
	if err == redis.Nil {
		log.Printf("Cache miss for key: %s", req.Key)
		return &proto.GetResponse{Found: false}, nil
	} else if err != nil {
		log.Printf("Redis error: %v", err)
		return nil, err
	}

	log.Printf("Cache hit for key: %s", req.Key)
	return &proto.GetResponse{Value: val, Found: true}, nil
}

// Set stores a value in Redis with optional TTL
func (s *cacheServer) Set(ctx context.Context, req *proto.SetRequest) (*proto.SetResponse, error) {
	log.Printf("Cache SET request for key: %s", req.Key)

	var expiration time.Duration
	if req.TtlSeconds > 0 {
		expiration = time.Duration(req.TtlSeconds) * time.Second
	} else {
		expiration = 5
	}

	err := s.rdb.Set(ctx, req.Key, req.Value, expiration).Err()
	if err != nil {
		log.Printf("Redis error: %v", err)
		return nil, err
	}

	log.Printf("Cache set successful for key: %s", req.Key)
	return &proto.SetResponse{Success: true}, nil
}

// Delete removes a key from Redis
func (s *cacheServer) Delete(ctx context.Context, req *proto.DeleteRequest) (*proto.DeleteResponse, error) {
	log.Printf("Cache DELETE request for key: %s", req.Key)

	err := s.rdb.Del(ctx, req.Key).Err()
	if err != nil {
		log.Printf("Redis error: %v", err)
		return nil, err
	}

	log.Printf("Cache delete successful for key: %s", req.Key)
	return &proto.DeleteResponse{Success: true}, nil
}

// HealthCheck HTTP endpoint for simple health monitoring
func (s *cacheServer) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "cache-service",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func main() {
	// Redis connection
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisHost + ":" + redisPort,
	})

	// Test Redis connection
	_, err := rdb.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("failed to connect to Redis: %v", err)
	}

	cacheServer := &cacheServer{
		rdb: rdb,
	}

	// Start gRPC server
	lis, err := net.Listen("tcp", ":50052")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	server := grpc.NewServer()
	proto.RegisterCacheServiceServer(server, cacheServer)

	// Register gRPC health check
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(server, healthServer)

	// Start HTTP health endpoint
	// go func() {
	// 	r := gin.Default()
	// 	r.GET("/health", cacheServer.HealthCheck)
	// 	if err := r.Run(":8080"); err != nil {
	// 		log.Fatalf("failed to start HTTP health server: %v", err)
	// 	}
	// }()

	log.Printf("Cache Service starting on :50052 with Redis at %s:%s", redisHost, redisPort)
	if err := server.Serve(lis); err != nil {
		log.Fatalf("failed to serve gRPC: %v", err)
	}
}
