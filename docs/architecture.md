---
title: "URL Shortener System Design"
description: "Scalable URL shortener architecture, diagrams, and Docker implementation."
keywords: ["system design", "url shortener", "architecture", "docker", "microservices", "redis", "postgres"]
---

# Architecture

This system is designed with clear separation of concerns and strong internal boundaries.

## 1. Reverse Proxy (Public Entry Point)
Handles HTTPS, routing, and protects private services.

## 2. Gateway
Offloads HTTP to gRPC, performs request validation, and routes internally.

## 3. URL-SVC
Core service that handles creation and lookup of URLs.

## 4. Storage Service
Encapsulates all database interactions and writes to Postgres.

## 5. Cache Service
Talks to Redis to serve high-speed responses and reduce DB load.

## 6. Postgres & Redis
Reliable persistence + low-latency caching.
