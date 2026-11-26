import { relations } from "drizzle-orm";

import { actionPlans } from "./action-plans";
import { actionSteps } from "./action-steps";
import { activityLogs } from "./activity-logs";
import { chatMessages } from "./chat-messages";
import { connections } from "./connections";
import { conversations } from "./conversations";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const usersRelations = relations(users, ({ one, many }) => ({
  workspace: one(workspaces),
  approvedPlans: many(actionPlans),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerUserId],
    references: [users.id],
  }),
  connections: many(connections),
  conversations: many(conversations),
  actionPlans: many(actionPlans),
  actionSteps: many(actionSteps),
  activityLogs: many(activityLogs),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [connections.workspaceId],
    references: [workspaces.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [conversations.workspaceId],
      references: [workspaces.id],
    }),
    messages: many(chatMessages),
    actionPlans: many(actionPlans),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [chatMessages.workspaceId],
    references: [workspaces.id],
  }),
  conversation: one(conversations, {
    fields: [chatMessages.workspaceId, chatMessages.conversationId],
    references: [conversations.workspaceId, conversations.id],
  }),
}));

export const actionPlansRelations = relations(
  actionPlans,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [actionPlans.workspaceId],
      references: [workspaces.id],
    }),
    conversation: one(conversations, {
      fields: [actionPlans.workspaceId, actionPlans.conversationId],
      references: [conversations.workspaceId, conversations.id],
    }),
    approvedBy: one(users, {
      fields: [actionPlans.approvedBy],
      references: [users.id],
    }),
    steps: many(actionSteps),
  }),
);

export const actionStepsRelations = relations(actionSteps, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [actionSteps.workspaceId],
    references: [workspaces.id],
  }),
  plan: one(actionPlans, {
    fields: [actionSteps.workspaceId, actionSteps.planId],
    references: [actionPlans.workspaceId, actionPlans.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [activityLogs.workspaceId],
    references: [workspaces.id],
  }),
}));
