# PowerShell script to seed all services via Docker

Write-Host "🌱 Starting database seeding for all services..." -ForegroundColor Green

# Ensure containers are running
Write-Host "`n📦 Checking Docker containers..." -ForegroundColor Cyan
docker-compose ps

# Seed Auth Service
Write-Host "`n🔑 Seeding Auth Service..." -ForegroundColor Yellow
docker-compose exec -T auth-service npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth service seeded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Auth service seeding failed" -ForegroundColor Red
}

# Seed Inventory Service
Write-Host "`n📦 Seeding Inventory Service..." -ForegroundColor Yellow
docker-compose exec -T inventory-service npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Inventory service seeded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Inventory service seeding failed" -ForegroundColor Red
}

# Seed Dealer Service
Write-Host "`n🤝 Seeding Dealer Service..." -ForegroundColor Yellow
docker-compose exec -T dealer-service npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dealer service seeded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Dealer service seeding failed" -ForegroundColor Red
}

# Seed Order Service
Write-Host "`n📋 Seeding Order Service..." -ForegroundColor Yellow
docker-compose exec -T order-service npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Order service seeded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Order service seeding failed" -ForegroundColor Red
}

Write-Host "`n✨ Database seeding complete!" -ForegroundColor Green
Write-Host "`n📊 Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@moderncolours.com / admin123" -ForegroundColor White
Write-Host "  Dealer: dealer1@example.com / dealer123" -ForegroundColor White
Write-Host "  Buyer: buyer1@example.com / buyer123" -ForegroundColor White
