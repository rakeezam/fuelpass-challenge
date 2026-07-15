import { Migration } from '@mikro-orm/migrations';

export class Migration20260715111809 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "orders" ("id" uuid not null, "tail_number" varchar(255) not null, "airport_icao_code" varchar(255) not null, "requested_fuel_volume" double precision not null, "delivery_window_start" timestamptz not null, "delivery_window_end" timestamptz not null, "status" text not null default 'PENDING', "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "orders" add constraint "orders_status_check" check ("status" in ('PENDING', 'CONFIRMED', 'COMPLETED'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "orders" cascade;`);
  }

}
