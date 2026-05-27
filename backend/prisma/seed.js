const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KiranaFlow database...\n');

  const store = await prisma.store.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      phone: '+919999999999',
      ownerName: 'Rajesh Kumar',
      storeName: 'Rajesh Kirana Store',
      address: '123, MG Road, Indore, Madhya Pradesh 452001',
      lat: 22.7196,
      lng: 75.8577,
      deliveryRadiusKm: 3.0,
      subscriptionPlan: 'pro',
      languagePreference: 'hi',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✅ Store: ${store.storeName} (${store.id})`);

  const driver1 = await prisma.driver.upsert({
    where: { phone: '+919888888881' },
    update: {},
    create: {
      storeId: store.id,
      name: 'Vikram Singh',
      phone: '+919888888881',
      vehicleType: 'motorcycle',
      vehicleCapacityKg: 30,
      licenseNumber: 'MP09-2025-0001',
      isActive: true,
      isOnDuty: true,
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { phone: '+919888888882' },
    update: {},
    create: {
      storeId: store.id,
      name: 'Suresh Patel',
      phone: '+919888888882',
      vehicleType: 'bicycle',
      vehicleCapacityKg: 15,
      licenseNumber: 'MP09-2025-0002',
      isActive: true,
      isOnDuty: false,
    },
  });
  console.log(`✅ Drivers: ${driver1.name}, ${driver2.name}`);

  const customers = [];
  const customerData = [
    { name: 'Amit Sharma', phone: '+919777777771', address: '45, Scheme No 54, Indore' },
    { name: 'Priya Patel', phone: '+919777777772', address: '78, Vijay Nagar, Indore' },
    { name: 'Rahul Verma', phone: '+919777777773', address: '12, Saket Nagar, Indore' },
    { name: 'Sunita Gupta', phone: '+919777777774', address: '90, Palasia, Indore' },
    { name: 'Ankit Joshi', phone: '+919777777775', address: '34, Banganga, Indore' },
  ];

  for (const c of customerData) {
    const customer = await prisma.customer.upsert({
      where: { storeId_phone: { storeId: store.id, phone: c.phone } },
      update: {},
      create: { storeId: store.id, ...c },
    });
    customers.push(customer);
  }
  console.log(`✅ Customers: ${customers.length} created`);

  const inventoryItems = [
    { name: 'Wheat Flour (Atta)', category: 'Grains', unit: 'kg', currentStock: 50, reorderLevel: 20, sellingPrice: 35 },
    { name: 'Basmati Rice', category: 'Grains', unit: 'kg', currentStock: 30, reorderLevel: 15, sellingPrice: 80 },
    { name: 'Tata Salt', category: 'Spices', unit: 'kg', currentStock: 100, reorderLevel: 30, sellingPrice: 18 },
    { name: 'Cooking Oil (Fortune)', category: 'Oil', unit: 'litre', currentStock: 25, reorderLevel: 10, sellingPrice: 170 },
    { name: 'Sugar', category: 'Groceries', unit: 'kg', currentStock: 40, reorderLevel: 15, sellingPrice: 42 },
    { name: 'Parle-G Biscuits', category: 'Snacks', unit: 'packet', currentStock: 200, reorderLevel: 50, sellingPrice: 10 },
    { name: 'Tata Tea', category: 'Beverages', unit: 'packet', currentStock: 60, reorderLevel: 20, sellingPrice: 245 },
    { name: 'Amul Milk', category: 'Dairy', unit: 'litre', currentStock: 30, reorderLevel: 20, sellingPrice: 56 },
    { name: 'Eggs (Tray)', category: 'Dairy', unit: 'piece', currentStock: 360, reorderLevel: 120, sellingPrice: 6 },
    { name: 'Toor Dal', category: 'Grains', unit: 'kg', currentStock: 20, reorderLevel: 10, sellingPrice: 140 },
    { name: 'Masala (MDH)', category: 'Spices', unit: 'packet', currentStock: 80, reorderLevel: 25, sellingPrice: 25 },
    { name: 'Colgate Toothpaste', category: 'Personal Care', unit: 'piece', currentStock: 35, reorderLevel: 15, sellingPrice: 85 },
    { name: 'Wheel Detergent', category: 'Household', unit: 'kg', currentStock: 45, reorderLevel: 15, sellingPrice: 50 },
    { name: 'Bournvita', category: 'Beverages', unit: 'packet', currentStock: 15, reorderLevel: 10, sellingPrice: 380 },
    { name: 'Coca Cola (2L)', category: 'Beverages', unit: 'piece', currentStock: 24, reorderLevel: 12, sellingPrice: 85 },
  ];

  const inventory = [];
  for (const item of inventoryItems) {
    const inv = await prisma.inventory.create({
      data: { storeId: store.id, ...item },
    });
    inventory.push(inv);
  }
  console.log(`✅ Inventory: ${inventory.length} items`);

  const orderItems = [
    [{ name: 'Wheat Flour (Atta)', qty: 5, unit: 'kg', price: 35 }, { name: 'Tata Salt', qty: 1, unit: 'kg', price: 18 }],
    [{ name: 'Cooking Oil (Fortune)', qty: 2, unit: 'litre', price: 170 }, { name: 'Sugar', qty: 1, unit: 'kg', price: 42 }],
    [{ name: 'Parle-G Biscuits', qty: 10, unit: 'packet', price: 10 }, { name: 'Tata Tea', qty: 1, unit: 'packet', price: 245 }],
    [{ name: 'Amul Milk', qty: 6, unit: 'litre', price: 56 }, { name: 'Eggs (Tray)', qty: 12, unit: 'piece', price: 6 }],
    [{ name: 'Basmati Rice', qty: 3, unit: 'kg', price: 80 }, { name: 'Toor Dal', qty: 2, unit: 'kg', price: 140 }],
  ];

  const statuses = ['delivered', 'delivered', 'delivered', 'in_transit', 'pending'];
  const drivers = [driver1.id, driver1.id, driver2.id, driver1.id, null];

  for (let i = 0; i < 5; i++) {
    const subtotal = orderItems[i].reduce((s, item) => s + item.price * item.qty, 0);
    const orderNum = `KF-${new Date().getFullYear()}-${String(10001 + i).padStart(5, '0')}`;

    const createdAt = new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        orderNumber: orderNum,
        storeId: store.id,
        customerId: customers[i].id,
        driverId: drivers[i],
        status: statuses[i],
        source: 'whatsapp',
        items: orderItems[i],
        subtotal,
        deliveryFee: 0,
        discount: 0,
        totalAmount: subtotal,
        paymentMethod: 'cod',
        paymentStatus: statuses[i] === 'delivered' ? 'completed' : 'pending',
        deliveryAddress: customers[i].address,
        createdAt,
        deliveredAt: statuses[i] === 'delivered' ? new Date(createdAt.getTime() + 30 * 60 * 1000) : null,
      },
    });
  }
  console.log('✅ Sample orders created');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    await prisma.storeMetric.upsert({
      where: { storeId_metricDate: { storeId: store.id, metricDate: date } },
      update: {},
      create: {
        storeId: store.id,
        metricDate: date,
        totalOrders: Math.floor(30 + Math.random() * 30),
        deliveredOrders: Math.floor(25 + Math.random() * 25),
        cancelledOrders: Math.floor(Math.random() * 3),
        totalRevenue: Math.floor(8000 + Math.random() * 7000),
        avgDeliveryTimeMin: 18 + Math.random() * 12,
        onTimeDeliveryRate: 0.85 + Math.random() * 0.12,
      },
    });
  }
  console.log('✅ Historical metrics generated');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
