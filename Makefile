SERVICE=payments_ms

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f $(SERVICE)

clean:
	docker compose down -v --remove-orphans
	docker system prune -f

run:
	docker-compose exec $(SERVICE) npm start

restart: down up