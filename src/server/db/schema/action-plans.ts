import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { actionPlanStatusEnum } from "./enums";
import { conversations } from "./conversations";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const actionPlans = pgTable(
  "kz_action_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    conversationId: uuid("conversation_id").notNull(),
    revision: integer("revision").notNull().default(1),
    status: actionPlanStatusEnum("status").notNull().default("proposed"),
    payloadHash: text("payload_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "restrict",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "kz_action_plans_conversation_workspace_fk",
      columns: [table.workspaceId, table.conversationId],
      foreignColumns: [conversations.workspaceId, conversations.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "kz_action_plans_approver_workspace_owner_fk",
      columns: [table.workspaceId, table.approvedBy],
      foreignColumns: [workspaces.id, workspaces.ownerUserId],
    }).onDelete("restrict"),
    check(
      "kz_action_plans_revision_positive_chk",
      sql`${table.revision} >= 1`,
    ),
    check(
      "kz_action_plans_approval_fields_pair_chk",
      sql`(${table.approvedBy} IS NULL) = (${table.approvedAt} IS NULL)`,
    ),
    unique("kz_action_plans_workspace_id_id_uq").on(
      table.workspaceId,
      table.id,
    ),
    index("kz_action_plans_workspace_status_expires_idx").on(
      table.workspaceId,
      table.status,
      table.expiresAt,
    ),
  ],
);
