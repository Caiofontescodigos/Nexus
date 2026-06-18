import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/dynamodb.js";
import { env } from "../config/env.js";

const table = env.tasksTable;

function fromDb(item: Record<string, any>) {
  return {
    id: item.taskId,
    userId: item.userId,
    title: item.title,
    description: item.description || "",
    completed: item.completed ?? false,
    status: item.status || (item.completed ? "completed" : "pending"),
    priority: item.priority || "medium",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const taskRepository = {
  async findByUserId(userId: string) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: table,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ScanIndexForward: false,
      }),
    );
    return (result.Items || []).map(fromDb);
  },

  async findByIdAndUser(id: string, userId: string) {
    const result = await docClient.send(
      new GetCommand({
        TableName: table,
        Key: { taskId: id },
      }),
    );
    if (!result.Item || result.Item.userId !== userId) return null;
    return fromDb(result.Item);
  },

  async create(userId: string, data: Record<string, any>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: Record<string, any> = {
      taskId: id,
      userId,
      title: data.title,
      description: data.description || "",
      completed: data.completed ?? false,
      status: data.status || "pending",
      priority: data.priority || "medium",
      createdAt: now,
      updatedAt: now,
    };
    await docClient.send(
      new PutCommand({
        TableName: table,
        Item: item,
        ConditionExpression: "attribute_not_exists(taskId)",
      }),
    );
    return fromDb(item);
  },

  async update(id: string, userId: string, data: Record<string, any>) {
    const sets: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      sets.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      values[`:${key}`] = value;
    }

    if (sets.length === 0) return;

    sets.push("#updatedAt = :updatedAt");
    names["#updatedAt"] = "updatedAt";
    values[":updatedAt"] = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: table,
        Key: { taskId: id },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: {
          ...values,
          ":expectedUserId": userId,
        },
        ConditionExpression: "userId = :expectedUserId",
      }),
    );
  },

  async delete(id: string, userId: string) {
    await docClient.send(
      new DeleteCommand({
        TableName: table,
        Key: { taskId: id },
        ConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      }),
    );
  },

  async getStats(userId: string) {
    const tasks = await this.findByUserId(userId);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  },
};
