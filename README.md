# Fastify Project

## Описание

Базовая структура Fastify-проекта с поддержкой GraphQL, MongoDB и RabbitMQ.

## Структура проекта

```
/src
  /controllers
    task.controller.ts
  /services
    task.service.ts
    rabbitmq.service.ts
  /models
    task.interface.ts
  /schemas
    task.interface.ts
  /graphql
    schema.graphql
    resolvers.ts
    generated-types.ts
  /routes
    task.controller.ts
  /tests
    postman_collection.json
  index.ts
codegen.yml
docker-compose.yml
README.md
PLAN.md (опционально)
package.json
tsconfig.json
```

## Запуск

1. `docker-compose up`
2. `npm install && npm run dev`

## Архитектура RabbitMQ

- **Exchange:** `task.exchange` (тип: Direct)
- **Очередь:** `task.actions`
- **Routing key:** `task.action`

### Как работает

- При создании или обновлении задачи сервис публикует сообщение в Exchange с routing key `task.action` и содержимым:
  ```json
  {
    "taskId": "<id задачи>",
    "action": "created" | "updated",
    "timestamp": "<ISO строка>"
  }
  ```
- Очередь `task.actions` привязана к Exchange по routing key `task.action` и получает только соответствующие сообщения.
- Consumer читает сообщения из очереди и логирует их в консоль (например, `Task <taskId> was <action> at <timestamp>`).

### Почему Direct Exchange?

Direct Exchange позволяет маршрутизировать сообщения по точному совпадению routing key. Это удобно, если нужно разделять разные типы событий (например, разные действия с задачами) по разным очередям или сервисам. Такой подход прост, прозрачен и легко масштабируется при необходимости.
