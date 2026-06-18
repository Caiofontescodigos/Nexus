import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/dynamodb.js";
import { env } from "../config/env.js";

const table = env.usersTable;

export const userRepository = {
  async findByEmail(email: string) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: table,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      }),
    );
    const items = result.Items;
    if (!items || items.length === 0) return null;
    const item = items[0];
    return {
      id: item.userId,
      name: item.name,
      email: item.email,
      password: item.passwordHash,
      createdAt: item.createdAt,
    };
  },

  async findById(id: string) {
    const result = await docClient.send(
      new GetCommand({
        TableName: table,
        Key: { userId: id },
      }),
    );
    if (!result.Item) return null;
    return {
      id: result.Item.userId,
      name: result.Item.name,
      email: result.Item.email,
      password: result.Item.passwordHash,
      createdAt: result.Item.createdAt,
    };
  },

  async create(data: { name: string; email: string; password: string }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item = {
      userId: id,
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      createdAt: now,
    };
    await docClient.send(
      new PutCommand({
        TableName: table,
        Item: item,
        ConditionExpression: "attribute_not_exists(userId)",
      }),
    );
    return { id, name: data.name, email: data.email, createdAt: now };
  },

  async update(id: string, data: Partial<{ name: string }>) {
    const sets: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, string> = {};
    if (data.name !== undefined) {
      sets.push("#n = :name");
      names["#n"] = "name";
      values[":name"] = data.name;
    }
    if (sets.length === 0) {
      return this.findById(id) as any;
    }
    const result = await docClient.send(
      new UpdateCommand({
        TableName: table,
        Key: { userId: id },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      }),
    );
    const item = result.Attributes!;
    return {
      id: item.userId,
      name: item.name,
      email: item.email,
      password: item.passwordHash,
      createdAt: item.createdAt,
    };
  },
};
