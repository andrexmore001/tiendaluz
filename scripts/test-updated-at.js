
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("Fetching current settings...");
    let settings = await prisma.setting.findFirst();
    console.log("Current updatedAt:", settings.updatedAt);

    console.log("Updating title to trigger updatedAt...");
    await prisma.setting.update({
        where: { id: settings.id },
        data: { title: settings.title + " (Edited)" }
    });

    let updated = await prisma.setting.findFirst();
    console.log("New updatedAt:", updated.updatedAt);
    
    if (updated.updatedAt > settings.updatedAt) {
        console.log("SUCCESS: updatedAt field changed automatically.");
    } else {
        console.log("FAILURE: updatedAt field did not change.");
    }

    // Revert
    await prisma.setting.update({
        where: { id: settings.id },
        data: { title: settings.title }
    });
}

test().catch(console.error).finally(() => prisma.$disconnect());
