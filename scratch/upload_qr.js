const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

cloudinary.config({
    cloud_name: "dtnrgadz4",
    api_key: "412211174321323",
    api_secret: "UqYsE0KFI_tA9P56ygNO3TLpe_M",
});

async function uploadAndUpdate() {
    const filePath = path.join(process.cwd(), 'public', 'nequi_qr_clean.png');
    console.log(`Subiendo ${filePath} a Cloudinary...`);

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'artesana',
            public_id: 'nequi_qr_new_optimized'
        });

        const newUrl = result.secure_url;
        console.log(`Imagen subida con éxito: ${newUrl}`);

        console.log('Actualizando configuración en la base de datos...');
        await prisma.setting.update({
            where: { id: 'site-settings' },
            data: { nequiQr: newUrl }
        });

        console.log('¡Configuración actualizada con éxito!');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

uploadAndUpdate();
