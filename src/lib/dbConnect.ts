import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONOGO_URI;
if (!uri) {
  throw new Error("Please add your MONOGO_URI to .env.local");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;

declare global {
  var _mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

interface Collections {
  USERS: string;
  VERIFICATION_TOKENS: string;
  UNIVERSITIES: string;
  REPORTS: string;
}

export const collections: Collections = {
  USERS: "users",
  VERIFICATION_TOKENS: "verificationTokens",
  UNIVERSITIES: "universities",
  REPORTS:"reports"
}

export const dbConnect = (collectionName: string) => {
  return client.db(process.env.DB_NAME).collection(collectionName);
}