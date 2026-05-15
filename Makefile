# Makefile for E14CRM MCNA Project

.PHONY: dev prod stop logs setup

## Cài đặt lần đầu
setup:
	cp .env.example .env
	@echo "✅ Đã tạo .env — hãy điền API keys trước khi chạy"

## Chạy development (hot-reload)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

## Chạy production
prod:
	docker compose up -d --build

## Dừng tất cả
stop:
	docker compose down

## Xem logs
logs:
	docker compose logs -f
