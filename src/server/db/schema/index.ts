import { actionPlans } from "./action-plans";
import { actionSteps } from "./action-steps";
import { activityLogs } from "./activity-logs";
import { chatMessages } from "./chat-messages";
import { connections } from "./connections";
import { conversations } from "./conversations";
import {
  actionPlansRelations,
  actionStepsRelations,
  activityLogsRelations,
  chatMessagesRelations,
  connectionsRelations,
  conversationsRelations,
  usersRelations,
  workspacesRelations,
} from "./relations";
import { users } from "./users";
import { workspaces } from "./workspaces";

export * from "./action-plans";
export * from "./action-steps";
export * from "./activity-logs";
export * from "./chat-messages";
export * from "./connections";
export * from "./conversations";
export * from "./enums";
export * from "./relations";
export * from "./users";
export * from "./workspaces";

export const schema = {
  users,
  workspaces,
  connections,
  conversations,
  chatMessages,
  actionPlans,
  actionSteps,
  activityLogs,
  usersRelations,
  workspacesRelations,
  connectionsRelations,
  conversationsRelations,
  chatMessagesRelations,
  actionPlansRelations,
  actionStepsRelations,
  activityLogsRelations,
};
