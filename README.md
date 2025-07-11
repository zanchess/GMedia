# GMedia Task

## Звпуск проекта:

### Запуск контейнеров в Docker
```bash
docker-compose up -d
```

### Устновка пакетов
```bash
npm ci
```

### Запуск проекта локально
```bash
npm run dev
```

### Генераций gql типов
```bash
npm run codegen
```

### Postman коллекции в папке `tests` или публичная коллекция [Ссылка на публичную коллекцию](https://www.postman.com/zanchessss/workspace/gmedia-test)
(Если используете публичную коллекцию, чтобы все тесты прошли на локальном окружении, надо удалить в collection variable *current_task* и *currents_task_id* )

# Архитектура сервиса

## Основные модули
- **controller/**
    - REST-контроллеры (обработка HTTP-запросов, маршрутизация, валидация, вызов сервисов)
- **graphql/**
    - Схема GraphQL, резолверы, типы (GraphQL API)
- **services/**
    - Бизнес-логика, работа с БД (MongoDB), интеграция с RabbitMQ, обработка задач
- **models/**
    - Модели данных (структуры преобразования данных под бд)
- **interface/**
    - TypeScript-интерфейсы для типизации данных и контрактов между слоями
- **enum/**
    - Перечисления (статусы, коды ошибок, константы RabbitMQ)
- **schema/**
    - Схемы валидации для REST (например, для Fastify)
- **middleware/**
    - Middleware для обработки входящих данных (например, санитайзинг)
- **tests/**
    - Коллекции и тесты для проверки API

## Внешние зависимости
- **MongoDB** — хранение задач
- **RabbitMQ** — обмен событиями между сервисами
- **Fastify** — REST API сервер
- **Apollo Server** — GraphQL сервер

# Архитектура RabbitMQ

## Компоненты

- **Exchange:**  
  `task.exchange` (тип: Direct)  
  Принимает сообщения о событиях с задачами (создание, обновление).

- **Очередь:**  
  `task.actions`  
  Получает сообщения из Exchange по routing key.

- **Routing key:**  
  `task.action`  
  Используется для маршрутизации сообщений.

## Почему Direct Exchange?
Direct Exchange позволяет маршрутизировать сообщения по точному совпадению routing key.


# Credentials  
- Доступ к RabbitMQ UI: http://localhost:15672 (user/password)
- Доступ к MongoDB: mongodb://root:example@localhost:27017


# Используемые паттерны:

- Шаблонные метод
- Command
- Singleton
- DI

# Возможные улучшения:
- Использовать nx или yarn чтобы консьюмер запускать как отдельное приложение на отдельном порте
- Использовать слой репозиторий для работы с данными

# Части которые были сгенерированы LLM
- Структура проекта
- Список методов без реализации (реализацию по большему писал я)
- Реализация DI
- Middleware для санитайзига
- Schemas для валидации входных данныых