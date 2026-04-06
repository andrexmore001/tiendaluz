import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary only for development to avoid SSL certificate issues on some local machines
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        return new Promise<NextResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'artesana',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Error in Cloudinary upload:', error);
                        resolve(NextResponse.json({ error: 'Error al subir a Cloudinary' }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json({ url: result?.secure_url }));
                    }
                }
            );

            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('Error in upload API:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
