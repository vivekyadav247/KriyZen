import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { chatMessageRoleEnum } from "./enums";
import { conversations } from "./conversations";
import { workspaces } from "./workspaces";

export const chatMessages = pgTable(
  "kz_chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    conversationId: uuid("conversation_id").notNull(),
    role: chatMessageRoleEnum("role").notNull(),
    parts: jsonb("parts").$type<unknown[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("kz_chat_messages_workspace_id_idx").on(table.workspaceId),
    foreignKey({
      name: "kz_chat_messages_conversation_workspace_fk",
      columns: [table.workspaceId, table.conversationId],
      foreignColumns: [conversations.workspaceId, conversations.id],
    }).onDelete("restrict"),
    index("kz_chat_messages_conversation_created_id_idx").on(
      table.conversationId,
      table.createdAt,
      table.id,
    ),
  ],
);
