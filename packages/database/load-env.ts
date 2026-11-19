import { config } from "dotenv";
import { resolve } from "node:path";

const currentDirectoryEnv = resolve(process.cwd(), ".env");
const repositoryEnv = resolve(process.cwd(), "../../.env");

config({ path: currentDirectoryEnv });
if (repositoryEnv !== currentDirectoryEnv) config({ path: repositoryEnv });
