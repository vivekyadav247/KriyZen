import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { activityStatusEnum } from "./enums";
import { workspaces } from "./workspaces";

export const activityLogs = pgTable(
  "kz_activity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    actorType: text("actor_type").notNull(),
    operation: text("operation").notNull(),
    status: activityStatusEnum("status").notNull(),
    referenceId: text("reference_id"),
    safeSummary: text("safe_summary"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("kz_activity_workspace_created_at_idx").on(
      table.workspaceId,
      table.createdAt.desc(),
    ),
  ],
);
