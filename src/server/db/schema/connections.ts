import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { connectionProviderEnum, connectionStatusEnum } from "./enums";
import { workspaces } from "./workspaces";

export const connections = pgTable(
  "kz_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    provider: connectionProviderEnum("provider").notNull(),
    // Opaque Corsair identifier; intentionally nullable and not an FK.
    corsairAccountId: text("corsair_account_id").unique(),
    accountLabel: text("account_label"),
    status: connectionStatusEnum("status").notNull().default("disconnected"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastErrorCode: text("last_error_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("kz_connections_workspace_provider_uq").on(
      table.workspaceId,
      table.provider,
    ),
  ],
);
