import { NextResponse } from "next/server";
import { prisma } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        // 1. Check if any users exist
        const userCount = await (prisma as any).user.count();

        if (userCount > 0) {
            return NextResponse.json(
                { error: "El sistema ya ha sido inicializado." },
                { status: 403 }
            );
        }

        // 2. Create the first user
        const email = "admin@artesana.com";
        const password = "artesana2026";
        const hashedPassword = await bcrypt.hash(password, 10);

        const firstUser = await (prisma as any).user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "Admin inicializado con éxito.",
            user: { email: firstUser.email },
            note: "Por seguridad, esta ruta ya no funcionará más.",
        });
    } catch (error) {
        console.error("Setup Error:", error);
        return NextResponse.json(
            { error: "Error al inicializar el administrador." },
            { status: 500 }
        );
    }
}
