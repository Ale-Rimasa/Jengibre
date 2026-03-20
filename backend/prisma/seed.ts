import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('ReyPerseo2026-', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@jengibre.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create 12 ceramic products
  const products = [
    {
      name: 'Taza Espresso Terracota',
      price: 2800,
      category: 'tazas',
      description: 'Elegante taza de espresso elaborada a mano en arcilla terracota. Su acabado natural con esmalte interior blanco realza el sabor del café. Capacidad 80ml.',
      image: '/images/producto-1.jpg',
      stock: 15,
      active: true,
    },
    {
      name: 'Taza Grande Stoneware Gris',
      price: 3500,
      category: 'tazas',
      description: 'Taza de gran capacidad en stoneware gris marengo. Perfecta para el desayuno o mate. Asa ergonómica y base antideslizante. Capacidad 350ml.',
      image: '/images/producto-2.jpg',
      stock: 12,
      active: true,
    },
    {
      name: 'Plato Trinche Orgánico',
      price: 4200,
      category: 'platos',
      description: 'Plato trinche con forma orgánica irregular, cada pieza es única. Esmalte color crema con manchas naturales del proceso de quema. Diámetro aproximado 28cm.',
      image: '/images/producto-3.jpg',
      stock: 8,
      active: true,
    },
    {
      name: 'Bowl Sopa Esmalte Azul',
      price: 3800,
      category: 'bowls',
      description: 'Bowl profundo ideal para sopas y cereales. Esmalte en tonos azul atlántico con interior blanco. Resistente al lavavajillas y microondas. Capacidad 600ml.',
      image: '/images/producto-4.jpg',
      stock: 10,
      active: true,
    },
    {
      name: 'Jarrón Alto Engobe Blanco',
      price: 8500,
      category: 'jarrones',
      description: 'Jarrón de 35cm de altura en arcilla roja con engobe blanco aplicado a mano. Textura áspera exterior, interior esmaltado. Ideal para ramas secas o flores de temporada.',
      image: '/images/producto-5.jpg',
      stock: 5,
      active: true,
    },
    {
      name: 'Plato Postre Líneas Sutiles',
      price: 2900,
      category: 'platos',
      description: 'Delicado plato de postre con incisiones lineales finas. Esmalte satinado color hueso. Borde irregular que aporta carácter artesanal. Diámetro 20cm.',
      image: '/images/producto-6.jpg',
      stock: 14,
      active: true,
    },
    {
      name: 'Set Vajilla 4 Personas Tierra',
      price: 14500,
      category: 'set_vajilla',
      description: 'Set completo de vajilla para 4 personas: 4 platos trinche, 4 platos postre, 4 bowls y 4 tazas. Colección Tierra en tonos naturales de arcilla y esmalte crema.',
      image: '/images/producto-7.jpg',
      stock: 3,
      active: true,
    },
    {
      name: 'Cuenco Decorativo Ondas',
      price: 5200,
      category: 'decoracion',
      description: 'Cuenco decorativo con textura de ondas talladas a mano. No apto para alimentos. Esmalte metalizado en tonos cobre y oro. Diámetro 25cm, altura 10cm.',
      image: '/images/producto-8.jpg',
      stock: 6,
      active: true,
    },
    {
      name: 'Bowl Ensalada Grande Rústico',
      price: 4800,
      category: 'bowls',
      description: 'Gran bowl para ensaladas familiar. Acabado rústico con marcas de los dedos del artesano visibles. Esmalte verde oliva interior, exterior sin esmaltar. Capacidad 1.5L.',
      image: '/images/producto-9.jpg',
      stock: 7,
      active: true,
    },
    {
      name: 'Jarrón Bajo Boca Ancha',
      price: 6800,
      category: 'jarrones',
      description: 'Jarrón de perfil redondeado y boca ancha, ideal para flores de tallo corto. Altura 18cm. Esmalte reactivo en tonos verdes y azules que cambia según la luz.',
      image: '/images/producto-10.jpg',
      stock: 4,
      active: true,
    },
    {
      name: 'Taza Té Doble Pared',
      price: 3200,
      category: 'tazas',
      description: 'Taza de té con doble pared de porcelana que mantiene la temperatura sin quemar la mano. Diseño minimalista con pequeño relieve floral. Capacidad 280ml.',
      image: '/images/producto-11.jpg',
      stock: 9,
      active: true,
    },
    {
      name: 'Figura Decorativa Cactus',
      price: 4500,
      category: 'decoracion',
      description: 'Escultura cerámica en forma de cactus saguaro. Esmalte verde oscuro con puntitos blancos. Altura 22cm. Pieza de decoración para interior, firmada por la artesana.',
      image: '/images/producto-12.jpg',
      stock: 5,
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Created ${products.length} products`);
  console.log('Seed completed successfully!');
  console.log('\nAdmin credentials:');
  console.log('  Email: admin@jengibre.com');
  console.log('  Password: ReyPerseo2026-');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
