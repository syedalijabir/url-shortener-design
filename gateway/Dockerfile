FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git wget && \
    GRPC_HEALTH_PROBE_VERSION=v0.4.14 && \
    wget -qO /bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o gateway main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/gateway .
COPY --from=builder /bin/grpc_health_probe /bin/grpc_health_probe
EXPOSE 8080
CMD ["./gateway"]


# FROM golang:1.23-alpine AS builder

# RUN apk add --no-cache git protoc build-base wget && \
#     GRPC_HEALTH_PROBE_VERSION=v0.4.14 && \
#     wget -qO /bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
#     chmod +x /bin/grpc_health_probe

# WORKDIR /app

# COPY go.mod go.sum ./
# RUN go mod download
# COPY . .
# COPY ./proto ./protos
# RUN ls -la ./protos

# RUN --mount=type=cache,target=/root/.cache \
#     protoc --go_out=. --go-grpc_out=. protos/*.proto

# RUN go build -o gateway main.go


# FROM alpine:latest
# RUN apk --no-cache add ca-certificates
# WORKDIR /root/

# COPY --from=builder /app/gateway .
# COPY --from=builder /bin/grpc_health_probe /bin/grpc_health_probe

# EXPOSE 8080
# # Start the gateway service
# CMD ["./gateway"]
