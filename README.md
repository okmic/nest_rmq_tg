# 📨 TG RMQ Nest

Simple APP на Nest.js, который:
- Принимает HTTP запросы
- Кладёт их в RabbitMQ
- Забирает из очереди и отправляет в Telegram

## 🛠️ Технологии

- Nest.js
- RabbitMQ  
- Telegram Bot (Grammy)
- Docker
- Swagger
- Jest

## 📦 Как запустить?

### Через Docker (проще всего)

```bash
git clone <your-repo>
cd tg_rmq_nest

cat > .env << EOF
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
EOF

# Запустить
docker-compose up -d