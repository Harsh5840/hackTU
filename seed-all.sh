#!/bin/bash

# Bash script to seed all services via Docker

echo "🌱 Starting database seeding for all services..."

# Ensure containers are running
echo ""
echo "📦 Checking Docker containers..."
docker-compose ps

# Seed Auth Service
echo ""
echo "🔑 Seeding Auth Service..."
docker-compose exec -T auth-service npm run seed
if [ $? -eq 0 ]; then
    echo "✅ Auth service seeded successfully"
else
    echo "❌ Auth service seeding failed"
fi

# Seed Inventory Service
echo ""
echo "📦 Seeding Inventory Service..."
docker-compose exec -T inventory-service npm run seed
if [ $? -eq 0 ]; then
    echo "✅ Inventory service seeded successfully"
else
    echo "❌ Inventory service seeding failed"
fi

# Seed Dealer Service
echo ""
echo "🤝 Seeding Dealer Service..."
docker-compose exec -T dealer-service npm run seed
if [ $? -eq 0 ]; then
    echo "✅ Dealer service seeded successfully"
else
    echo "❌ Dealer service seeding failed"
fi

# Seed Order Service
echo ""
echo "📋 Seeding Order Service..."
docker-compose exec -T order-service npm run seed
if [ $? -eq 0 ]; then
    echo "✅ Order service seeded successfully"
else
    echo "❌ Order service seeding failed"
fi

echo ""
echo "✨ Database seeding complete!"
echo ""
echo "📊 Demo Credentials:"
echo "  Admin: admin@moderncolours.com / admin123"
echo "  Dealer: dealer1@example.com / dealer123"
echo "  Buyer: buyer1@example.com / buyer123"
