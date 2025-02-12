// apollo-server.ts
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import { connectToMongoose } from './config/mongoose';
import { typeDefs } from './graphql/schema/auth.schema';
import { resolvers } from './graphql/resolvers/resolvers';
import jwt from 'jsonwebtoken';
import { KEYS } from 'src/config/config'; // Adjust the path based on your config location

dotenv.config();

const JWT_SECRET = KEYS.jwtSecret;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const context = ({ req }: { req: any }) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { req: { user: decoded } };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { req: { user: null } };
    }
  }

  return { req: { user: null } };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = express() as any;

const startServer = async () => {
  await connectToMongoose();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(
      `🚀 Server running at http://localhost:4000${server.graphqlPath}`
    );
  });
};

startServer();
