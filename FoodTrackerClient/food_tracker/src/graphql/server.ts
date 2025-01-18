import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
