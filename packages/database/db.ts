import "./load-env";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./prisma/contract.d";
import contractJson from "./prisma/contract.json" with { type: "json" };

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required. Set it in the repository or workspace .env file.");
}

export const db = postgres<Contract>({ contractJson, url });
