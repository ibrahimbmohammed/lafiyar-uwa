# Lafiyar-Uwa

A scalable USSD-based maternal health platform for Nigeria, built with Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, and Docker.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Running the Project](#running-the-project)
- [USSD State Machine](#ussd-state-machine)
- [Session Management with Redis](#session-management-with-redis)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
Lafiyar-Uwa is a digital health platform that enables mothers to register, receive weekly health tips, and get risk assessments via USSD. It supports multi-language, risk scoring, and integrates with health workers and facilities.

## Features
- USSD registration and menu navigation
- Maternal risk assessment and scoring
- Weekly health tips via IVR/SMS
- Integration with health workers (CHW)
- PostgreSQL for persistent data
- Redis for session management
- Dockerized for easy deployment
- Prisma ORM for type-safe database access

## Tech Stack
- Node.js & TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- Docker & Docker Compose
- USSD-Builder library

## Folder Structure
```
├── src/
│   ├── core/
│   │   ├── config/         # App, DB, Redis, logger configs
│   │   ├── middleware/    # Global middlewares
│   │   ├── services/      # Shared services (Redis, AT, etc.)
│   │   ├── utils/         # Helper utilities
│   ├── modules/
│   │   ├── ussd/          # USSD controllers, menus, routes
│   │   ├── users/         # User logic, services
│   │   ├── risk-assessment/ # Risk scoring
│   │   ├── ...            # Other modules
│   ├── server.ts          # App entry point
├── prisma/
│   ├── schema.prisma      # Prisma schema
├── docker-compose.yml     # Docker services
├── .env.example           # Example environment variables
├── README.md              # Project documentation
```

## Setup & Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/ibrahimbmohammed/lafiyar-uwa.git
   cd lafiyar-uwa
   ```
2. **Copy environment variables:**
   ```sh
   cp .env.example .env
   # Edit .env with your secrets
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Start Docker services:**
   ```sh
   docker-compose up -d
   # This starts PostgreSQL and Redis
   ```

## Environment Variables
See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `AT_API_KEY`, `AT_USERNAME` - Africa's Talking API
- `APP_NAME`, `PORT`, etc.

## Database & Migrations
- **Prisma setup:**
  ```sh
  npx prisma generate
  npx prisma migrate dev --name init
  ```
- **Push schema changes:**
  ```sh
  npx prisma db push
  ```

## Running the Project
- **Development:**
  ```sh
  npm run dev
  # Uses nodemon and ts-node
  ```
- **Production:**
  ```sh
  npm run build
  npm start
  ```

## USSD State Machine
- USSD logic is in `src/modules/ussd/menus/`
- States are managed using `ussd-builder`.
- Each state persists session data to Redis for reliability.

## Session Management with Redis
- Redis is used to store USSD session data for each user.
- See `src/core/services/redis.service.ts` for usage.
- Example:
  ```ts
  await redisService.set(sessionKey, JSON.stringify(sessionData));
  const sessionData = await redisService.get(sessionKey);
  ```
- Ensures sessions survive server restarts and scale horizontally.

## Testing
- Unit and integration tests are in `tests/`
- Run tests with:
  ```sh
  npm test
  ```

## Contributing
- Fork the repo, create a feature branch, and submit a PR.
- Please follow the code style and add tests for new features.

## License
MIT

---
For questions or support, open an issue or contact the maintainer.
