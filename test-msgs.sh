curl -X POST http://localhost:3000/api/producer/send \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "telegram.notification",
    "data": {
      "chatId": "123456789",
      "text": "System update",
      "parseMode": "HTML"
    }
  }'
