import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "../config/env.js";

const client = new DynamoDBClient({ region: env.region });
const docClient = DynamoDBDocumentClient.from(client);

export { docClient };
