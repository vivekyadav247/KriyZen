import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { workspaces } from "./workspaces";

export const conversations = pgTable(
  "kz_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("kz_conversations_workspace_id_id_uq").on(
      table.workspaceId,
      table.id,
    ),
    index("kz_conversations_workspace_updated_at_idx").on(
      table.workspaceId,
      table.updatedAt.desc(),
    ),
  ],
);
