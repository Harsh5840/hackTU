# Order Service

Manages Orders, Payments, and Invoices.

## Features
- Order Creation with tax/discount calculation
- Integration with RabbitMQ for stock reservation
- PDF Invoice generation (stub)

## API Endpoints
- POST `/api/orders/create`
- GET `/api/orders/:id`

## Env Variables
See `.env.example`.
