const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONOGO_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export const collections = {
  USERS: "users",
  VERIFICATION_TOKENS: "verificationTokens"
}

export const dbConnect = (collectionName) => {
  return client.db(process.env.DB_NAME).collection(collectionName);
}