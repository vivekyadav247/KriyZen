import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { actionStepStatusEnum } from "./enums";
import { actionPlans } from "./action-plans";
import { workspaces } from "./workspaces";

export const actionSteps = pgTable(
  "kz_action_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    planId: uuid("plan_id").notNull(),
    ordinal: integer("ordinal").notNull(),
    kind: text("kind").notNull(),
    input: jsonb("input").$type<unknown>().notNull(),
    status: actionStepStatusEnum("status").notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull(),
    providerReference: text("provider_reference"),
    errorCode: text("error_code"),
    attemptCount: integer("attempt_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
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
      name: "kz_action_steps_plan_workspace_fk",
      columns: [table.workspaceId, table.planId],
      foreignColumns: [actionPlans.workspaceId, actionPlans.id],
    }).onDelete("restrict"),
    unique("kz_action_steps_plan_ordinal_uq").on(table.planId, table.ordinal),
    unique("kz_action_steps_workspace_idempotency_key_uq").on(
      table.workspaceId,
      table.idempotencyKey,
    ),
    check(
      "kz_action_steps_attempt_count_nonnegative_chk",
      sql`${table.attemptCount} >= 0`,
    ),
  ],
);
