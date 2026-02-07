import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting order service seed...');

  // Sample product IDs and dealer IDs (these should match your actual data)
  // In a real scenario, you'd fetch these from the database
  const dealerIds = ['dealer-001', 'dealer-002', 'dealer-003', 'dealer-004', 'dealer-005'];
  const productData = [
    { sku: 'P-100', name: 'Ultra White Satin', price: 1200, id: 'prod-uuid-100' },
    { sku: 'P-101', name: 'Royal Blue Matt', price: 1100, id: 'prod-uuid-101' },
    { sku: 'P-102', name: 'Sunset Orange Emulsion', price: 1150, id: 'prod-uuid-102' },
    { sku: 'P-200', name: 'WeatherShield Exterior White', price: 1500, id: 'prod-uuid-200' },
    { sku: 'P-201', name: 'WeatherShield Stone Grey', price: 1550, id: 'prod-uuid-201' },
    { sku: 'P-300', name: 'Teak Wood Varnish', price: 800, id: 'prod-uuid-300' },
    { sku: 'P-301', name: 'Mahogany Stain', price: 750, id: 'prod-uuid-301' },
    { sku: 'P-400', name: 'Wall Primer White', price: 600, id: 'prod-uuid-400' },
  ];
  
  // Create 15 sample orders with varying statuses
  const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const paymentStatuses: PaymentStatus[] = ['PENDING', 'PARTIAL', 'PAID'];

  const addresses = [
    {
      line1: '123 Market Street',
      line2: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400058',
      country: 'India',
    },
    {
      line1: '456 Nehru Place',
      line2: 'Commercial Complex',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110019',
      country: 'India',
    },
    {
      line1: '789 MG Road',
      line2: 'Near Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
  ];

  for (let i = 1; i <= 15; i++) {
    const orderNumber = `ORD-2026-${String(i).padStart(4, '0')}`;
    const dealerId = dealerIds[Math.floor(Math.random() * dealerIds.length)];
    const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentStatus = orderStatus === 'DELIVERED' ? 'PAID' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    // Random number of items (1-3)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = productData[Math.floor(Math.random() * productData.length)];
      const quantity = (Math.floor(Math.random() * 10) + 1) * 4; // 4-40 units in multiples of 4
      const unitPrice = product.price;
      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: unitPrice,
        lineTotal: lineTotal,
      });
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingCharges = 500;
    const discountAmount = i % 3 === 0 ? subtotal * 0.05 : 0; // 5% discount on every 3rd order
    const totalAmount = subtotal + taxAmount + shippingCharges - discountAmount;

    const deliveryAddress = addresses[Math.floor(Math.random() * addresses.length)];
    
    // Create order with delivery dates
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (20 - i)); // Spread orders over last 20 days
    
    const estimatedDeliveryDate = new Date(createdDate);
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          dealerId,
          orderType: 'DEALER_ORDER',
          orderStatus: orderStatus as OrderStatus,
          paymentStatus: paymentStatus as PaymentStatus,
          subtotal,
          taxAmount,
          discountAmount,
          shippingCharges,
          totalAmount,
          deliveryAddress,
          billingAddress: deliveryAddress,
          estimatedDeliveryDate,
          actualDeliveryDate: orderStatus === 'DELIVERED' ? new Date() : null,
          paymentMethod: 'Credit',
          paymentTerms: '30 days',
          trackingNumber: orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED' ? `TRK-${orderNumber}` : null,
          transporterName: orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED' ? 'Blue Dart' : null,
          notes: i % 5 === 0 ? 'Urgent delivery required' : null,
          createdAt: createdDate,
          updatedAt: createdDate,
          items: {
            create: orderItems,
          },
        },
      });
      console.log(`Created order: ${order.orderNumber} (${order.orderStatus})`);
    } catch (error) {
      console.error(`Error creating order ${orderNumber}:`, error);
    }
  }

  const totalOrders = await prisma.order.count();
  console.log(`✅ Order service seeding finished. Total orders: ${totalOrders}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
