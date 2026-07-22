# Shva Transaction Approval Simulator

A responsive full-stack transaction simulator built for the Shva developer interview task. The application provides MSSQL-backed user accounts, evaluates a selected moment against the local banking hours of a selected region, stores every result, and displays each user's approved transactions.

## Stack

- React 19, TypeScript, Vite, TanStack Query
- ASP.NET Core 8 Web API and Entity Framework Core
- Microsoft SQL Server 2022
- Docker Compose and nginx
- Vitest/Testing Library and xUnit

## Run everything with Docker

Requirements: Docker Desktop with at least 4 GB of memory available. On Apple Silicon, SQL Server runs through Docker's `linux/amd64` emulation and can take a little longer on first startup.

```bash
cp .env.example .env
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The API is also exposed at `http://localhost:5080`, and its health endpoint is `http://localhost:5080/health`.

The API waits for SQL Server, applies the included EF Core migration, and then starts accepting requests. Database data is retained in the `sqlserver-data` Docker volume.

To stop the application:

```bash
docker compose down
```

To intentionally remove all local database data as well:

```bash
docker compose down --volumes
```

## Local development

Requirements: .NET 8 SDK, Node.js 22+, npm, and a reachable SQL Server instance.

Start only SQL Server:

```bash
cp .env.example .env
docker compose up db
```

Run the API from another terminal:

```bash
dotnet restore server/Shva.Api/Shva.Api.csproj
dotnet run --project server/Shva.Api/Shva.Api.csproj --urls http://localhost:5080
```

Run the client from a third terminal:

```bash
cd client
npm install
npm run dev
```

Vite serves the client at `http://localhost:5173` and proxies `/api` to port 5080.

### Migrations

The first migration is committed and applied automatically at API startup. After changing the entity model, create a new migration with:

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add <MigrationName> --project server/Shva.Api/Shva.Api.csproj
```

## Business rule

The user selects a region and a time. The frontend combines that `HH:mm` value with today's date in the browser's local timezone and sends the resulting ISO-8601 instant to the API. The API—not the browser—converts that exact instant into the selected IANA timezone and decides the result.

A transaction is approved when its calculated regional time is:

```text
08:00:00 inclusive <= local time < 18:00:00 exclusive
```

Weekends and public holidays do not alter the result because the task defines only a time-of-day rule. The USA option intentionally uses New York (`America/New_York`) because a country-wide USA timezone does not exist.

Supported regions:

| Region | IANA timezone |
| --- | --- |
| Israel | `Asia/Jerusalem` |
| France | `Europe/Paris` |
| USA (New York) | `America/New_York` |
| Japan | `Asia/Tokyo` |
| Cyprus | `Asia/Nicosia` |
| Italy | `Europe/Rome` |

`TimeZoneInfo` uses the operating system's timezone database, including date-specific daylight-saving transitions.

## API

### List supported regions

```http
GET /api/regions
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Registration accepts `displayName`, `email`, and a password of at least eight characters. Passwords are stored only as salted hashes. Successful registration or login issues a seven-day, HTTP-only, SameSite `shva.session` cookie; protected API endpoints return HTTP 401 rather than redirecting. Cookie-protection keys use a dedicated Docker volume so active sessions remain valid when the API container restarts.

### Simulate and persist a transaction

```http
POST /api/transactions/simulate
Content-Type: application/json

{
  "regionCode": "FR",
  "submittedAtUtc": "2026-07-22T17:00:00Z"
}
```

The response includes the UTC instant, calculated local date/time and offset, local display time, and `Approved` or `Rejected` status. Both outcomes are stored and associated with the authenticated user.

### List approved transactions

```http
GET /api/transactions/approved
```

Returns up to 50 approved transactions for the authenticated user, newest first. Rejected transactions and other users' records are never returned. The UI automatically scrolls the newest card into view and reverses carousel direction correctly in Hebrew RTL mode.

Validation errors use ASP.NET Core Problem Details and unsupported region codes return HTTP 400.

## Tests and checks

```bash
dotnet test tests/Shva.Api.Tests/Shva.Api.Tests.csproj

cd client
npm test
npm run build
```

Backend tests cover every supported region, opening/closing boundaries, daylight-saving transitions, persistence of rejected results, and approved-only ordering. Frontend tests cover region filtering/selection and time-picker Apply/Cancel behavior.

## Architecture notes

- `RegionCatalog` is the single backend source of truth for region labels and IANA mappings.
- `TransactionApprovalService` is a pure service, separated from HTTP and persistence for deterministic testing.
- EF Core stores both the submitted UTC instant and the calculated local value/offset, preserving an audit-friendly record of the decision.
- TanStack Query manages server state; form selections remain local React state; the language preference is stored in `localStorage`.
- Authentication uses server-side ASP.NET cookie validation with HTTP-only cookies and salted password hashes; transaction ownership is enforced in every protected query.
- nginx serves the production SPA and reverse-proxies `/api` to the API container.
- English and Hebrew are fully supported, including document-level LTR/RTL direction changes. Illustration text is intentionally unchanged, as allowed by the task.

## Demo video checklist

1. Start all three services with `docker compose up --build`.
2. Select two regions and demonstrate how the same instant produces different local times.
3. Submit one transaction inside banking hours and one outside them.
4. Show that only the approved transaction appears in the card carousel.
5. Refresh the browser to demonstrate MSSQL persistence.
6. Switch between English and Hebrew and show RTL layout.
7. Resize to a mobile viewport to demonstrate responsiveness.
