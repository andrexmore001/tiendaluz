const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default settings...');
  const settings = await prisma.setting.upsert({
    where: { id: 'site-settings' },
    update: {},
    create: {
      id: 'site-settings',
      title: 'Artesana',
      slug: 'artesana',
      wompiEnabled: false,
      primaryColor: '#E8A2A2',
      secondaryColor: '#F9F1E7',
      accentColor: '#D4AF37',
      backgroundColor: '#FFFFFF',
      phone: '+57 311 565 9523',
      email: 'hola@artesana.com',
      address: 'Bogotá, Colombia',
    },
  });
  console.log('Default settings created/updated:', settings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
