const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: {
            OR: [
                { id: 'bandeja-mensaje-mdf' },
                { name: { contains: 'bandeja-mensaje-mdf', mode: 'insensitive' } },
                { slug: 'bandeja-mensaje-mdf' }
            ]
        },
        include: {
            variants: {
                include: {
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(product, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
