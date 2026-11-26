import { pgEnum } from "drizzle-orm/pg-core";

export const connectionProviderEnum = pgEnum("kz_connection_provider", [
  "gmail",
  "googlecalendar",
]);

export const connectionStatusEnum = pgEnum("kz_connection_status", [
  "disconnected",
  "connecting",
  "connected",
  "needs_reauth",
  "error",
]);

export const chatMessageRoleEnum = pgEnum("kz_chat_message_role", [
  "user",
  "assistant",
  "tool",
]);

export const actionPlanStatusEnum = pgEnum("kz_action_plan_status", [
  "proposed",
  "approved",
  "executing",
  "succeeded",
  "partial_failed",
  "failed",
  "needs_reconciliation",
  "cancelled",
  "expired",
]);

export const actionStepStatusEnum = pgEnum("kz_action_step_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
  "unknown",
  "skipped",
]);

export const activityStatusEnum = pgEnum("kz_activity_status", [
  "succeeded",
  "failed",
  "unknown",
]);
