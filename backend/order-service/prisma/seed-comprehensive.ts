import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive order seeding for demo...');

  try {
    // Delete existing orders
    await prisma.order.deleteMany({});
    console.log('Cleared existing orders');

    const dealerIds = [
      'dealer-user-001',
      'dealer-user-002',
      'dealer-user-003',
      'dealer-user-004',
      'dealer-user-005',
      'telegram-6140979307',
    ];

    const productIds = ['P-100', 'P-101', 'P-102', 'P-200', 'P-201', 'P-300', 'P-301', 'P-400'];
    const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'PENDING'];
    
    // Create 30 orders spread over last 30 days
    const orders = [];
    for (let i = 0; i < 30; i++) {
      const daysAgo = 29 - i;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

      const dealerId = dealerIds[Math.floor(Math.random() * dealerIds.length)];
      const numProducts = 1 + Math.floor(Math.random() * 3);
      
      let subtotal = 0;
      const items = [];
      
      const productNames: Record<string, string> = {
        'P-100': 'Ultra White Satin',
        'P-101': 'Royal Blue Matt',
        'P-102': 'Sunset Orange Emulsion',
        'P-200': 'WeatherShield Exterior White',
        'P-201': 'WeatherShield Stone Grey',
        'P-300': 'Teak Wood Varnish',
        'P-301': 'Mahogany Stain',
        'P-400': 'Wall Primer White',
      };
      
      for (let j = 0; j < numProducts; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = 5 + Math.floor(Math.random() * 20);
        const unitPrice = 600 + Math.floor(Math.random() * 1000);
        const itemTotal = quantity * unitPrice;
        subtotal += itemTotal;
        
        items.push({
          productId,
          productName: productNames[productId] || 'Paint Product',
          quantity,
          unitPrice,
          discountAmount: 0,
          taxPercentage: 18.0,
          taxAmount: itemTotal * 0.18,
          lineTotal: itemTotal,
        });
      }
      
      const taxAmount = subtotal * 0.18;
      const totalAmount = subtotal + taxAmount;
      
      // Older orders are more likely to be delivered
      const statusIndex = daysAgo > 20 ? 0 : daysAgo > 15 ? 1 : daysAgo > 10 ? 2 : daysAgo > 7 ? 3 : daysAgo > 4 ? 4 : daysAgo > 2 ? 5 : 6;
      const status = statuses[statusIndex];
      
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now() + i}`,
          dealerId,
          orderType: 'DEALER_ORDER',
          orderStatus: status,
          paymentStatus: status === 'DELIVERED' ? 'PAID' : status === 'CANCELLED' ? 'FAILED' : 'PENDING',
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toFixed(2),
          discountAmount: '0',
          shippingCharges: '0',
          totalAmount: totalAmount.toFixed(2),
          deliveryAddress: {
            line1: `${100 + i} Main Street`,
            city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][Math.floor(Math.random() * 5)],
            state: ['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu'][Math.floor(Math.random() * 5)],
            pincode: `${400000 + Math.floor(Math.random() * 100000)}`,
          },
          items: {
            create: items,
          },
          createdAt,
          updatedAt: createdAt,
        },
      });
      
      orders.push(order);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1} orders...`);
      }
    }

    console.log(`✅ Order seeding completed! Created ${orders.length} orders`);
    console.log('📊 Status distribution:');
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders`);
    });
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
