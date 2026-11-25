import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@restaurant.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log(`Admin user created: ${admin.email} / admin123`);

  // Create Categories
  const catStarters = await prisma.category.create({ data: { name: 'Starters', sortOrder: 1 } });
  const catMains = await prisma.category.create({ data: { name: 'Main Course', sortOrder: 2 } });
  const catDrinks = await prisma.category.create({ data: { name: 'Drinks', sortOrder: 3 } });

  // Create Menu Items
  await prisma.menuItem.createMany({
    data: [
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 4.99, categoryId: catStarters.id },
      { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 12.99, categoryId: catMains.id },
      { name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper', price: 14.99, categoryId: catMains.id },
      { name: 'Coca Cola', description: 'Chilled 330ml can', price: 2.50, categoryId: catDrinks.id },
    ]
  });

  // Create Tables
  await prisma.restaurantTable.createMany({
    data: [
      { tableNumber: 1 },
      { tableNumber: 2 },
      { tableNumber: 3 },
      { tableNumber: 4 },
      { tableNumber: 5 },
    ]
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
