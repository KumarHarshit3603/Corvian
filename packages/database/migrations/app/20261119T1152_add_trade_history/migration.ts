#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/dff59a6a00b9a6291647117922d865f8822d1af5331ddbd6604cbf8aac3001fb/contract';
import startContract from '../../snapshots/dff59a6a00b9a6291647117922d865f8822d1af5331ddbd6604cbf8aac3001fb/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e438e50a9b1de90eaea1148d2712f056b63c3bc63d6a4ad7aaa72c3083a752e0/contract';
import endContract from '../../snapshots/e438e50a9b1de90eaea1148d2712f056b63c3bc63d6a4ad7aaa72c3083a752e0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'trade_history',
        columns: [
          col('base_amount', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('buy_order_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('maker_order_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('order_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('payload', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
          col('price', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('quote_amount', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('sell_order_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('side', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('symbol', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('taker_order_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('time_ms', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('trade_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('trade_time_ms', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['trade_id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'trade_history',
        index: 'trade_history_symbol_timestamp_d4cef3e5',
        columns: ['symbol', 'trade_time_ms'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
