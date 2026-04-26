const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: "dtnrgadz4",
    api_key: "412211174321323",
    api_secret: "UqYsE0KFI_tA9P56ygNO3TLpe_M",
});

async function deleteOrphans() {
    const orphans = JSON.parse(fs.readFileSync('scratch/orphaned_images.json', 'utf8'));
    
    // Filtro de seguridad: Omitir subidas hoy (2026-04-26)
    const today = new Date().toISOString().split('T')[0];
    const safeToDelete = orphans.filter(o => !o.created_at.startsWith(today));

    console.log(`Huérfanos totales: ${orphans.length}`);
    console.log(`Seguros para borrar (anteriores a hoy): ${safeToDelete.length}`);
    
    if (safeToDelete.length === 0) {
        console.log('No hay imágenes antiguas para borrar hoy. Abortando.');
        return;
    }

    const publicIds = safeToDelete.map(o => o.public_id);
    
    // Cloudinary permite borrar hasta 100 por petición
    const chunks = [];
    for (let i = 0; i < publicIds.length; i += 100) {
        chunks.push(publicIds.slice(i, i + 100));
    }

    for (const chunk of chunks) {
        console.log(`Borrando lote de ${chunk.length} imágenes...`);
        try {
            const result = await cloudinary.api.delete_resources(chunk);
            console.log('Resultado del lote:', result.deleted);
        } catch (e) {
            console.error('Error al borrar lote:', e.message);
        }
    }

    console.log('--- Proceso de limpieza finalizado ---');
}

deleteOrphans().catch(e => console.error(e));
