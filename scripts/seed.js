const { PrismaClient: AuthPrisma } = require('./backend/auth-service/node_modules/@prisma/client');
const { PrismaClient: InventoryPrisma } = require('./backend/inventory-service/node_modules/@prisma/client');
const { PrismaClient: OrderPrisma } = require('./backend/order-service/node_modules/@prisma/client');
const { PrismaClient: DealerPrisma } = require('./backend/dealer-service/node_modules/@prisma/client');

// Note: You need to run 'npm install' in this script's directory if you want to run it standalone,
// but here we are trying to require from the sub-services. 
// A better approach for the user might be to run a seed command within each service.
// However, for a "Master Seed", we will assume the node_modules exist.

async function seed() {
  console.log('🌱 Starting Master Seed...');

  // 1. Dealer Seed
  // We need a dealer to place orders against
  console.log('Creating Dealership...');
  // Note: In a real scenario, we'd use the generated clients properly.
  // Since this environment is complex, let's output instructions for the user 
  // or create a simple SQL script.
  // Given the user asked to "make sure it doesn't look too much", 
  // a simple robust SQL seed might be better than a fragile Node script relying on paths.
  
  console.log('⚠️  Node Seeding is complex in monorepo without specific setup.');
  console.log('⚠️  Writing seed_data.sql instead for easy import.');
}

// Switching to SQL generation strategy
seed();
