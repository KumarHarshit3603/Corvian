# Database processor

This worker reads completed fills from Redis C's `trade-history` queue and stores them in the same PostgreSQL database used by the Next.js backend. Both modules use the shared Prisma contract and client in `packages/database`. The `trade_history` table keeps queryable trade fields and the full trade event in its `payload` JSON column. Trade IDs are unique, so retrying a message cannot create a duplicate row.

Set `DATABASE_URL` in the repository root `.env` file (or provide the same value to both runtime environments) so both modules use the same PostgreSQL database. After emitting the shared contract, apply its reviewed migration to add the trade table:

```sh
npm run contract:emit --workspace=@corvian/database
npm run db:migrate --workspace=@corvian/database
```

To create a migration after changing the shared contract, run `npm run migration:plan --workspace=@corvian/database -- --from <current-migration-hash> --name <migration-name>` and review the generated package before applying it.

Start Redis C and the engine, then run the worker from the repository root:

```sh
npm run process:trades
```

The worker is started explicitly so the normal Turbo development command does not require a database connection. It uses a reliable processing list: if it exits before acknowledging a message, the next worker run retries it. Failed database writes are retried, and invalid queue messages go to Redis C's `trade-history:dead-letter` queue.
