import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { csv } = await req.json();
        if (!csv) return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });

        // Standardize line endings and filter empty lines
        const lines = csv.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l !== '');
        if (lines.length < 2) return NextResponse.json({ error: 'CSV is empty or missing header' }, { status: 400 });

        // Detect delimiter (use , or ; based on frequency in first row of standard columns)
        const firstLine = lines[0];
        const delimiter = (firstLine.split(';').length > firstLine.split(',').length && !firstLine.includes('Atributo,Valores')) ? ';' : ',';

        const parseCSVLine = (line: string) => {
            const result: string[] = [];
            let inQuotes = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = parseCSVLine(lines[0]).map((h: string) => h.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/["']/g, '') // remove extra quotes
        );
        const dataRows = lines.slice(1);

        let processedAttributesCount = 0;
        let processedValuesCount = 0;

        for (const line of dataRows) {
            const cols = parseCSVLine(line);
            
            let name = '';
            let rawValues = '';

            headers.forEach((header, i) => {
                if (header === 'atributo' || header === 'attribute' || header === 'nombre') {
                    name = cols[i]?.replace(/^"|"$/g, '').trim() || ''; 
                } else if (header === 'valores' || header === 'values' || header === 'opciones') {
                    rawValues = cols[i]?.replace(/^"|"$/g, '').trim() || '';
                }
            });

            if (!name) continue; // Skip lines with no attribute name

            // Upsert the main Attribute First
            const attribute = await prisma.attribute.upsert({
                where: { name },
                update: {}, 
                create: { name }
            });

            processedAttributesCount++;

            // Insert new Values separated by semicolon ";"
            if (rawValues) {
                const valueTokens = rawValues.split(';').map((v: string) => v.trim()).filter((v: string) => v !== '');
                
                for (const valToken of valueTokens) {
                    const existingVal = await prisma.attributeValue.findFirst({
                        where: { attributeId: attribute.id, value: valToken }
                    });
                    
                    if (!existingVal) {
                        await prisma.attributeValue.create({
                            data: { attributeId: attribute.id, value: valToken }
                        });
                        processedValuesCount++;
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Carga exitosa. Se procesaron ${processedAttributesCount} atributos globales y se crearon ${processedValuesCount} nuevos valores (opciones) en la base de datos.`
        });

    } catch (error: any) {
        console.error('Error in attributes bulk upload:', error);
        return NextResponse.json({ error: 'Error al procesar el archivo CSV de atributos: ' + error.message }, { status: 500 });
    }
}
