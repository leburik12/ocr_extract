// server.js (ESM version)

import { ApolloServer } from 'apollo-server-express'; // Note the change from require()
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// __dirname is not available in ES modules, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read the schema using fs and path
const typeDefs = fs.readFileSync(path.join(__dirname, 'graphql/schema.graphql'), 'utf8');

// resolvers must be imported as an ES module
import { resolvers } from './graphql/resolvers.js';

const app = express();

// Add CORS middleware here BEFORE graphqlUploadExpress and Apollo Server
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}
startServer();