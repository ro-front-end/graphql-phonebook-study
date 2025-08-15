const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");

const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const cors = require("cors");
const http = require("http");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const User = require("./models/user");

const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const { PORT, MONGODB, SECRET } = require("./utils/config");
const pubsub = require("./subs/pubsub");

console.log("connecting to", MONGODB);

mongoose
  .connect(MONGODB)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

// setup is now within a function
const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        let currentUser = null;
        const auth = req ? req.headers.authorization : null;

        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(auth.substring(7), SECRET);

          currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};

start();
