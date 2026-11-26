import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const workspaces = pgTable(
  "kz_workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    corsairTenantId: text("corsair_tenant_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("kz_workspaces_owner_user_id_uq").on(table.ownerUserId),
    unique("kz_workspaces_corsair_tenant_id_uq").on(table.corsairTenantId),
    unique("kz_workspaces_id_owner_user_id_uq").on(
      table.id,
      table.ownerUserId,
    ),
  ],
);
