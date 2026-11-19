# Shared Prisma database

The Next.js backend and database processor share one Prisma 8 contract, generated client types, migration history, and runtime client in `packages/database`.

The contract at [`packages/database/prisma/contract.prisma`](../../packages/database/prisma/contract.prisma) defines both `User` and `Trade`. Its generated `contract.json` and `contract.d.ts` files live beside it. Edit the contract source and run `npm run contract:emit` from the repository root to regenerate those files. The Next.js build also emits them before building.

Both modules import the same client:

```ts
import { db } from "@corvian/database/db";

const user = await db.orm.public.User.where({ email: "alice@example.com" }).first();
const trades = await db.orm.public.Trade.where({ symbol: "BTC/USDT" }).all();
```

Prisma configuration lives in [`packages/database/prisma.config.ts`](../../packages/database/prisma.config.ts), and shared migrations live in `packages/database/migrations`. Put the shared `DATABASE_URL` in the repository root `.env` or provide the same value in each runtime environment.

The Trade table migration is already planned in the shared history. Emit the contract, then apply the reviewed migration to the database:

```sh
npm run contract:emit
npm run db:migrate --workspace=@corvian/database
```

For later contract changes, plan from the current migration hash and review the generated package before applying it:

```sh
npm run migration:plan --workspace=@corvian/database -- --from <current-migration-hash> --name <migration-name>
```

The database processor reads completed fills from Redis C's `trade-history` queue and idempotently upserts them into the `trade_history` table by trade ID.
