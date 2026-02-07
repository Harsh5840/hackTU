# API Gateway

Main entry point for the Modern Colours Supply Chain Platform.

## Features
- **Route Proxying**: Forwards request to microservices.
- **Authentication**: Validates JWTs.
- **Rate Limiting**: Protects against abuse.
- **Logging**: Centralized request logging.

## Routes
- `/api/auth` -> Auth Service
- `/api/inventory` -> Inventory Service
- `/api/orders` -> Order Service
- `/api/dealers` -> Dealer Service
- `/api/analytics` -> Analytics Service

## Env Variables
See `.env.example`.
