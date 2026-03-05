import { NextResponse } from "next/server";
import { auth, prisma } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { email, password } = await request.json();

        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
        }

        const updatedUser = await (prisma as any).user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        return NextResponse.json({
            message: "Perfil actualizado con éxito",
            user: { email: updatedUser.email },
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { error: "Error al actualizar el perfil" },
            { status: 500 }
        );
    }
}
