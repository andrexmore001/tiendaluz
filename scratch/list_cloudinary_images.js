const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: "dtnrgadz4",
    api_key: "412211174321323",
    api_secret: "UqYsE0KFI_tA9P56ygNO3TLpe_M",
});

async function listAllResources() {
    let resources = [];
    let next_cursor = null;

    process.stderr.write('Obteniendo recursos de Cloudinary...\n');

    try {
        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'artesana/',
                max_results: 500,
                next_cursor: next_cursor
            });
            resources = resources.concat(result.resources);
            next_cursor = result.next_cursor;
            process.stderr.write(`Cargados ${resources.length} recursos...\n`);
        } while (next_cursor);

        fs.writeFileSync('scratch/cloudinary_images.json', JSON.stringify(resources, null, 2), 'utf8');
        process.stderr.write(`Guardados ${resources.length} recursos en scratch/cloudinary_images.json\n`);
    } catch (e) {
        process.stderr.write(`Error: ${e.message}\n`);
    }
}

listAllResources().catch(e => console.error(e));
