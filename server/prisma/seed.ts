import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FoodBridge database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.donationRequest.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@foodbridge.org',
      password: adminPasswordHash,
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+1-555-0100',
      address: 'FoodBridge Central Ops, Suite 400',
      city: 'Metropolis',
      organizationType: 'Platform Admin',
      isVerified: true,
    },
  });

  // 2. Create 3 Verified Recipient Organisations
  const recipientHope = await prisma.user.create({
    data: {
      email: 'recipient@hopefoodbank.org',
      password: passwordHash,
      name: 'Hope Community Food Bank',
      role: 'RECIPIENT',
      phone: '+1-555-0201',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      organizationType: 'Food Bank',
      registrationNumber: 'NGO-2024-8841',
      isVerified: true,
    },
  });

  const recipientCityMission = await prisma.user.create({
    data: {
      email: 'recipient@citymission.org',
      password: passwordHash,
      name: 'City Mission Shelter & Kitchen',
      role: 'RECIPIENT',
      phone: '+1-555-0202',
      address: '108 Downtown Boulevard',
      city: 'Metropolis',
      organizationType: 'Shelter',
      registrationNumber: 'NGO-2023-4120',
      isVerified: true,
    },
  });

  const recipientSunshine = await prisma.user.create({
    data: {
      email: 'recipient@sunshineorphanage.org',
      password: passwordHash,
      name: 'Sunshine Orphanage & Welfare Home',
      role: 'RECIPIENT',
      phone: '+1-555-0203',
      address: '45 Sunshine Valley Road',
      city: 'Riverdale',
      organizationType: 'Orphanage',
      registrationNumber: 'NGO-2024-1903',
      isVerified: true,
    },
  });

  // 3. Create Donors
  const donorGrandPlaza = await prisma.user.create({
    data: {
      email: 'donor@grandplaza.com',
      password: passwordHash,
      name: 'Grand Plaza Hotel & Catering',
      role: 'DONOR',
      phone: '+1-555-0301',
      address: '500 Grand Avenue',
      city: 'Metropolis',
      organizationType: 'Hotel & Hospitality',
      isVerified: true,
    },
  });

  const donorGreenFields = await prisma.user.create({
    data: {
      email: 'donor@greenfields.com',
      password: passwordHash,
      name: 'GreenFields Organic Supermarket',
      role: 'DONOR',
      phone: '+1-555-0302',
      address: '120 Market Square',
      city: 'Springfield',
      organizationType: 'Supermarket',
      isVerified: true,
    },
  });

  const donorMetroBakery = await prisma.user.create({
    data: {
      email: 'donor@metrobakery.com',
      password: passwordHash,
      name: 'Metro Artisan Bakery',
      role: 'DONOR',
      phone: '+1-555-0303',
      address: '88 Baker Street',
      city: 'Metropolis',
      organizationType: 'Bakery',
      isVerified: true,
    },
  });

  const donorUniDining = await prisma.user.create({
    data: {
      email: 'donor@unidining.edu',
      password: passwordHash,
      name: 'University Central Dining Hall',
      role: 'DONOR',
      phone: '+1-555-0304',
      address: 'University Campus Hall A',
      city: 'Riverdale',
      organizationType: 'Institutional Dining',
      isVerified: true,
    },
  });

  console.log('✅ Created Admin, 3 Demo Recipient Organisations, and 4 Donors.');

  // Helper date generators relative to current time
  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600 * 1000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 3600 * 1000);

  // 4. Create 10 Realistic Demo Listings
  const listingsData = [
    {
      donorId: donorGrandPlaza.id,
      title: 'Buffet Surplus: Mediterranean Grilled Chicken & Roasted Vegetables',
      description: 'Chilled gourmet prepared trays from an executive conference luncheon. Maintained at strictly < 4°C. Cleanly packed in sanitized food-grade aluminum chafing pans.',
      category: 'COOKED_MEALS',
      quantity: 40,
      unit: 'servings',
      dietaryInfo: 'Halal',
      preparedAt: hoursFromNow(-3),
      useBy: hoursFromNow(24),
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(6),
      pickupAddress: '500 Grand Avenue, Banquet Loading Dock C',
      pickupCity: 'Metropolis',
      storageInstructions: 'Keep refrigerated below 4°C until serving. Reheat thoroughly to >= 75°C.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorMetroBakery.id,
      title: 'Artisan Sourdough Loaves, Ciabatta & Brioche Rolls',
      description: 'Fresh morning bake surplus. Crunchy crusts, zero preservatives, 100% wholesome organic flour. Packed in clean paper bakery crates.',
      category: 'BAKERY',
      quantity: 25,
      unit: 'kg',
      dietaryInfo: 'Vegetarian',
      preparedAt: hoursFromNow(-6),
      useBy: daysFromNow(2),
      pickupWindowStart: hoursFromNow(2),
      pickupWindowEnd: hoursFromNow(8),
      pickupAddress: '88 Baker Street, Rear Service Alley',
      pickupCity: 'Metropolis',
      storageInstructions: 'Store in cool dry conditions. Suitable for immediate freezing.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorGreenFields.id,
      title: 'Surplus Crates: Fresh Organic Apples, Oranges & Bananas',
      description: 'High-grade fresh seasonal fruits. Perfectly edible produce with minor visual cosmetic blemishes unsuited for premier retail shelves.',
      category: 'PRODUCE',
      quantity: 60,
      unit: 'kg',
      dietaryInfo: 'Vegan',
      preparedAt: hoursFromNow(-12),
      useBy: daysFromNow(5),
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(12),
      pickupAddress: '120 Market Square, Produce Receiving Dock 2',
      pickupCity: 'Springfield',
      storageInstructions: 'Store in ventilated cool area or refrigerated display.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorGreenFields.id,
      title: 'Chilled Dairy Pack: Pasteurized Whole Milk & Natural Yogurt',
      description: 'Factory-sealed dairy cartons approaching 4 days to retail sell-by date. Continuous cold-chain unbroken. Tested at 3.2°C.',
      category: 'DAIRY',
      quantity: 30,
      unit: 'liters',
      dietaryInfo: 'Vegetarian',
      preparedAt: hoursFromNow(-24),
      useBy: daysFromNow(4),
      pickupWindowStart: hoursFromNow(2),
      pickupWindowEnd: hoursFromNow(10),
      pickupAddress: '120 Market Square, Refrigerated Bay 1',
      pickupCity: 'Springfield',
      storageInstructions: 'Strict continuous cold storage between 1°C and 4°C required.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorGreenFields.id,
      title: 'Sealed Pantry Staples: Penne Rigate Pasta & Basmati Rice',
      description: 'Factory sealed bulk boxes of high quality non-perishable pasta and aromatic basmati rice from overstocked warehouse pallets.',
      category: 'PACKAGED_GOODS',
      quantity: 50,
      unit: 'kg',
      dietaryInfo: 'Vegan',
      preparedAt: hoursFromNow(-48),
      useBy: daysFromNow(90),
      pickupWindowStart: hoursFromNow(3),
      pickupWindowEnd: hoursFromNow(24),
      pickupAddress: '120 Market Square, Warehouse Door 4',
      pickupCity: 'Springfield',
      storageInstructions: 'Store in ambient dry conditions away from moisture.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorGrandPlaza.id,
      title: 'Corporate Bento Lunch Boxes: Quinoa Salad & Roasted Veggies',
      description: 'Individually portioned eco-friendly meal containers prepared for corporate summit attendees. Fully sealed, clean, and nutritious.',
      category: 'COOKED_MEALS',
      quantity: 35,
      unit: 'meals',
      dietaryInfo: 'Vegan',
      preparedAt: hoursFromNow(-2),
      useBy: hoursFromNow(18),
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(5),
      pickupAddress: '500 Grand Avenue, West Kitchen Exit',
      pickupCity: 'Metropolis',
      storageInstructions: 'Keep chilled until distribution.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorUniDining.id,
      title: 'Farm Fresh Vegetables: Crisp Spinach, Carrots & Vine Tomatoes',
      description: 'Surplus produce from the campus agricultural initiative. Washed, graded, and packed in ventilated wooden crates.',
      category: 'PRODUCE',
      quantity: 22,
      unit: 'kg',
      dietaryInfo: 'Vegan',
      preparedAt: hoursFromNow(-8),
      useBy: daysFromNow(4),
      pickupWindowStart: hoursFromNow(2),
      pickupWindowEnd: hoursFromNow(12),
      pickupAddress: 'University Campus Hall A, Service Entrance',
      pickupCity: 'Riverdale',
      storageInstructions: 'Keep in cool produce cellar or refrigeration.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorMetroBakery.id,
      title: 'Sweet & Savory Pastries: Butter Croissants, Danishes & Pretzels',
      description: 'Freshly baked specialty pastries from afternoon bakery inventory. Cleanly lined pastry boxes ready for immediate community tea or breakfast.',
      category: 'BAKERY',
      quantity: 45,
      unit: 'servings',
      dietaryInfo: 'Vegetarian',
      preparedAt: hoursFromNow(-4),
      useBy: hoursFromNow(36),
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(7),
      pickupAddress: '88 Baker Street, Front Counter Pickup',
      pickupCity: 'Metropolis',
      storageInstructions: 'Keep in dry covered containers.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorUniDining.id,
      title: 'Hot Cooked Feast: Fragrant Vegetable Dum Biryani with Cucumber Raita',
      description: 'Steam-table food prepared for campus evening celebration dinner. Untouched pans stored in commercial warming cabinets.',
      category: 'COOKED_MEALS',
      quantity: 40,
      unit: 'servings',
      dietaryInfo: 'Vegetarian',
      preparedAt: hoursFromNow(-1),
      useBy: hoursFromNow(12),
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(4),
      pickupAddress: 'University Campus Hall A, Main Catering Bay',
      pickupCity: 'Riverdale',
      storageInstructions: 'Hold at > 63°C or chill rapidly to < 4°C.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    },
    {
      donorId: donorGrandPlaza.id,
      title: 'Gourmet Cheese Blocks: Farmhouse Aged Cheddar & Mozzarella',
      description: 'Hermetically vacuum-sealed vacuum packs from hotel gourmet cheese bar restock. Unopened and within optimum maturation window.',
      category: 'DAIRY',
      quantity: 15,
      unit: 'kg',
      dietaryInfo: 'Vegetarian',
      preparedAt: hoursFromNow(-36),
      useBy: daysFromNow(14),
      pickupWindowStart: hoursFromNow(2),
      pickupWindowEnd: hoursFromNow(16),
      pickupAddress: '500 Grand Avenue, Chef Office Receiving',
      pickupCity: 'Metropolis',
      storageInstructions: 'Keep chilled between 2°C and 6°C.',
      foodSafetyConfirmed: true,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
    },
  ];

  for (const item of listingsData) {
    await prisma.listing.create({ data: item });
  }

  console.log(`✅ Created ${listingsData.length} realistic demo food listings with complete metadata.`);

  // 5. Create a completed donation for historical statistics
  const completedListing = await prisma.listing.create({
    data: {
      donorId: donorGrandPlaza.id,
      title: 'Previous Redistribution: 80 Fresh Artisan Bagels & Sandwiches',
      description: 'Successfully picked up and distributed to city homeless shelter residents.',
      category: 'BAKERY',
      quantity: 80,
      unit: 'servings',
      dietaryInfo: 'Vegetarian',
      preparedAt: daysFromNow(-3),
      useBy: daysFromNow(-2),
      pickupWindowStart: daysFromNow(-3),
      pickupWindowEnd: daysFromNow(-3),
      pickupAddress: '500 Grand Avenue',
      pickupCity: 'Metropolis',
      status: 'COMPLETED',
      foodSafetyConfirmed: true,
    },
  });

  await prisma.donationRequest.create({
    data: {
      listingId: completedListing.id,
      recipientId: recipientCityMission.id,
      status: 'COMPLETED',
      requestedQuantity: 80,
      pickupTime: daysFromNow(-3),
      purpose: 'Dinner distribution to shelter night intake residents.',
      verificationCode: '4821',
    },
  });

  // 6. Create an AuditLog entry
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      details: 'FoodBridge database initialized and seeded with demo listings, recipient organizations, and admin credentials.',
    },
  });

  console.log('🎉 Seed complete! FoodBridge is ready for end-to-end operation.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
