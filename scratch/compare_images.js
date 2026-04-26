const fs = require('fs');

const dbImages = JSON.parse(fs.readFileSync('scratch/db_images.json', 'utf8'));
const cloudinaryResources = JSON.parse(fs.readFileSync('scratch/cloudinary_images.json', 'utf8'));

console.log(`Imágenes en DB: ${dbImages.length}`);
console.log(`Recursos en Cloudinary: ${cloudinaryResources.length}`);

// Extraer el public_id de las URLs de la DB
// Ejemplo: https://res.cloudinary.com/dtnrgadz4/image/upload/v1745422899/artesana/of8f3v6v9v6v9v6v9.jpg
// Queremos: artesana/of8f3v6v9v6v9v6v9
function getPublicIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('cloudinary.com')) return null;
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // El public_id suele estar después de la versión (v12345678)
    // O directamente después de upload si no hay versión
    let publicIdWithExt = '';
    if (parts[uploadIndex + 1].startsWith('v') && !isNaN(parts[uploadIndex + 1].substring(1))) {
        publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
    } else {
        publicIdWithExt = parts.slice(uploadIndex + 1).join('/');
    }
    
    // Quitar la extensión
    return publicIdWithExt.split('.')[0];
}

const dbPublicIds = new Set();
dbImages.forEach(url => {
    const pid = getPublicIdFromUrl(url);
    if (pid) dbPublicIds.add(pid);
});

console.log(`Public IDs únicos en DB: ${dbPublicIds.size}`);

const orphans = cloudinaryResources.filter(res => !dbPublicIds.has(res.public_id));

console.log(`Imágenes huérfanas encontradas: ${orphans.length}`);

// Calcular espacio ahorrado
const totalSizeBytes = orphans.reduce((acc, res) => acc + res.bytes, 0);
console.log(`Espacio total que se puede liberar: ${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);

// Guardar lista de huérfanos para revisión
fs.writeFileSync('scratch/orphaned_images.json', JSON.stringify(orphans, null, 2));

console.log('--- Resumen de Huérfanos ---');
orphans.slice(0, 10).forEach(o => console.log(`- ${o.public_id} (${(o.bytes/1024).toFixed(1)} KB)`));
if (orphans.length > 10) console.log(`... y ${orphans.length - 10} más.`);
