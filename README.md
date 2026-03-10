# galerka_hub (backend-only)

Сервис переведен в режим API-only для внешнего frontend-приложения.

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` на основе `.env.example`:

```env
DATABASE_URL="postgresql://appuser:<PASSWORD>@127.0.0.1:5433/appdb?schema=public"
ORG_ID="org_demo"
FRONTEND_ORIGIN="http://localhost:5173"
```

3. Применить миграции и сид:

```bash
npx prisma migrate deploy
node prisma/seed.js
```

4. Запустить API:

```bash
npm run dev
```

API будет доступен по `http://localhost:3000/api/*`.

## CORS

- CORS включен для всех маршрутов `/api/*` через `middleware.js`.
- Preflight `OPTIONS` обрабатывается автоматически.
- Разрешенный origin задается через `FRONTEND_ORIGIN`.

## Формат ответов

Успех:

```json
{
	"ok": true,
	"data": { }
}
```

Ошибка:

```json
{
	"ok": false,
	"error": {
		"message": "..."
	}
}
```

## Основные эндпоинты

- `GET /api/health/db`
- `GET /api/actors`
- `POST /api/actors`
- `GET /api/actors/:id`
- `GET /api/warehouses`
- `POST /api/warehouses`
- `GET /api/containers`
- `POST /api/containers`
- `GET /api/props`
- `POST /api/props/create`
- `GET /api/props/:id`
- `GET /api/qr/:code`
- `POST /api/issues/issue`
- `POST /api/issues/return`

## Примечания

- Frontend-страницы и компоненты удалены из проекта.
- Внешний frontend должен работать только через HTTP API.