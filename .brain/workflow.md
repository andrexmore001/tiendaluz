## Estrategia de Base de Datos (Local vs Prod)

Para que el flujo funcione sin errores de Prisma y sea profesional, tienes estas opciones:

### Opción A: Rama de Desarrollo en Neon (Muy Recomendado)
En tu panel de Neon, crea una "Branch" llamada `dev`.
- **Local (`.env`)**: Usa el connection string de la rama `dev`. Aquí haces tus pruebas y `npx prisma db push`.
- **Vercel**: Configura el connection string de la rama `main` en sus variables de entorno.
- **Resultado**: Vercel actualizará la base de datos real automáticamente al desplegar, pero tú trabajarás tranquilo en tu rama de pruebas.

### Opción B: Postgres Local (Si no tienes internet)
Si prefieres tener los datos en tu PC.
- Instalas Postgres localmente.
- **Local (`.env`)**: `DATABASE_URL="postgresql://localhost:5432/tiendaluz"`
- **Vercel**: Mantienes la URL de Neon.

---

## Ciclo de Desarrollo Diario

1.  **Trabaja en Local**: Editas código y pruebas con `npm run dev`.
2.  **Sincroniza Localmente**: Si cambias modelos en Prisma, corre `npx prisma db push`.
3.  **Sube a GitHub**: `git add .`, `git commit -m "...", `git push`.
4.  **Vercel hace el resto**: Al detectar el push, Vercel construye la app y corre el comando de actualización sobre Neon de forma automática.

---

> [!TIP]
> **Pro Tip: Neon Branches**
> Neon permite crear "Ramas" (Branches) de tu base de datos. Puedes tener una rama `dev` para tus pruebas locales y la rama `main` para Vercel. Así te aseguras de no romper nada en vivo mientras pruebas cosas nuevas.

> [!IMPORTANT]
> **Variables de Entorno en Vercel**
> Recuerda que si agregas una nueva variable en tu `.env` local, también debes agregarla en el panel de **Vercel Settings -> Environment Variables**.
