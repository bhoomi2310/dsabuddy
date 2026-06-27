const globalForPrisma = globalThis;
try {
  const dotenv = await import("dotenv");
  dotenv.default.config();
} catch {

}

const { PrismaClient } = await import("@prisma/client");

async function createPrismaClient() {
  try {
    return new PrismaClient({ log: ["error"] });
  } catch (err) {
    const msg = err?.message ?? "";
    if (
      err?.name === "PrismaClientConstructorValidationError" &&
      msg.includes('engine type "client"')
    ) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");

      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error(
          "DATABASE_URL is required to initialize Prisma with @prisma/adapter-pg"
        );
      }

      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter, log: ["error"] });
    }
    throw err;
  }
}

export const prisma =
  globalForPrisma.__prismaClient ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaClient = prisma;
}
// Trigger reload after prisma generate
