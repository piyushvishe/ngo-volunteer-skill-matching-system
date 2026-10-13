# NGO Volunteer Skill Matching System

College mini project with a React/Vite frontend, Java 17/Spring Boot API, and MySQL persistence.

## Requirements

- JDK 17 or newer
- MySQL 8.x
- Node.js 20.19+ (or 22.12+) and npm

## Database configuration

Create the application database once; Hibernate updates the schema without dropping existing tables or records:

```sql
CREATE DATABASE ngo_skill_matching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure connection values in the environment. Do not commit secrets:

PowerShell:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/ngo_skill_matching'
$env:DB_USERNAME = 'your_mysql_user'
$env:DB_PASSWORD = 'your_mysql_password'
```

`DB_URL` defaults to the local database above. `DB_USERNAME` and `DB_PASSWORD` are required.

## Run locally

Start the API from the project root (leave it running):

```powershell
.\mvnw.cmd spring-boot:run
```

In a second terminal, install frontend dependencies once and start Vite:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The frontend currently targets the API at `http://localhost:8080` and permits credentialed CORS from that Vite origin.

## Implemented flows

- Volunteer and NGO registration, role-aware login redirects, and cookie-backed sessions.
- Persistent volunteer/NGO profiles, volunteer skills, NGO requirements and required skills.
- Volunteer applications, NGO review and acceptance, and database-backed assignments.
- Volunteer assignment completion recorded as participation history; NGOs can rate completed records.
- Session/role checks and ownership checks for application, assignment, requirement, volunteer profile/skill, and participation operations.

The local browser store is retained for non-authoritative display preferences/cache compatibility. Application, assignment, and completion state are read and written through the API.

## Checks

```powershell
.\mvnw.cmd test
cd frontend
npm run build
npm run lint
```

The Spring test context connects to MySQL, so configure the database environment first. Existing persisted records are retained; avoid manually dropping or truncating tables.

## Limitations

- Frontend API origin is currently fixed to `http://localhost:8080`.
- Completing assignments requires an end date/time the backend can parse (`yyyy-MM-dd` and `h:mm AM - h:mm PM`).
- No admin role or account deletion workflow is provided.
