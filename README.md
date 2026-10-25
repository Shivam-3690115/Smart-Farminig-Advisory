# Rootwise Smart Farming Advisory

## Run with MySQL

1. Create a MySQL database user, or use an existing local user.
2. Set the backend environment variables before starting Spring Boot:

```powershell
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/rootwise?createDatabaseIfNotExist=true&serverTimezone=UTC"
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "your-mysql-password"
$env:OPENWEATHER_API_KEY = "your-openweathermap-key"
$env:OPENAI_API_KEY = "your-openai-key"
$env:OPENAI_MODEL = "gpt-4o-mini"
```

3. Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Hibernate creates or updates the `farmer_accounts` table automatically with `ddl-auto=update`.

4. Start the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Open from a mobile phone

Connect the phone and computer to the same Wi-Fi network. Start the frontend with
the LAN host enabled:

```powershell
cd frontend
npm run dev -- --host 0.0.0.0
```

Start the backend normally. Then open this address on the phone, replacing the
IP if your computer receives a different Wi-Fi address:

```text
http://10.52.255.244:5173
```

The frontend automatically calls the API using the same computer hostname on
port `8080`; do not use `localhost` on the phone.

If Windows Firewall blocks the ports, run PowerShell as Administrator once:

```powershell
New-NetFirewallRule -DisplayName "Rootwise frontend 5173" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
New-NetFirewallRule -DisplayName "Rootwise API 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

## Authentication API

- `POST /api/auth/register`
  - Body: `{ "name": "Ravi Kumar", "email": "ravi@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login`
  - Body: `{ "email": "ravi@example.com", "password": "at-least-8-chars" }`

Passwords are BCrypt-hashed before storage. The frontend stores the returned session token in `localStorage` for the current demo session.

## External integrations

The backend proxies OpenWeatherMap and OpenAI requests so API keys are never shipped
to the browser. Copy `backend/.env.example` as a reference and set the variables in
the same terminal process used to start Spring Boot. Do not commit a `.env` file or
place either key in frontend source code.

The following endpoints are available to the frontend:

- `GET /api/integrations/weather?location=Nashik%2C%20Maharashtra`
- `POST /api/integrations/plant-advice`
- `POST /api/integrations/chat`

The plant-advice request accepts `symptoms` and an optional `imageDataUrl`. The
weather endpoint returns current conditions plus a short forecast. If a provider
is not configured or unavailable, the API returns an explicit error rather than
silently presenting live data as real.

## Deploy to Render

This repository includes [`render.yaml`](./render.yaml), which defines one Docker
backend and one static frontend. Create a Render Blueprint from this repository
and set these required values in the Render dashboard:

- `MYSQL_URL`: a reachable external MySQL JDBC URL; Render does not provide MySQL
  as a native database service.
- `MYSQL_USERNAME` and `MYSQL_PASSWORD`
- `OPENWEATHER_API_KEY`
- `OPENAI_API_KEY`
- `VITE_API_URL`: the deployed backend URL followed by `/api`, for example
  `https://smart-farming-api.onrender.com/api`

Do not put secrets in `backend/.env`, `render.yaml`, or frontend source code.
After the backend deploys, update `VITE_API_URL` with its actual Render URL and
redeploy the static frontend.
