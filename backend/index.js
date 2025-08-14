const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const User = require("./models/user");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

mongoose.set("strictQuery", false);

const Person = require("./models/person");
const { MONGODB, SECRET } = require("./utils/config");

mongoose
  .connect(MONGODB)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connection to MongoDB", error.message);
  });
let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
  },
];

const typeDefs = `
    enum YesNo {
    YES
    NO
    }




    type Address {
    street:String!
    city: String! 
    }

    type Person {
    name:String!
    phone:String
    address: Address!

    id:ID!
    }

    type User {
    username: String!
    friends: [Person!]!
    id:ID!
    }

    type Token {
    value: String!
    }





type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name:String!): Person
    me: User
    
    }

    type Mutation {
    addPerson(
    name: String!
    phone: String
    street: String!
    city: String!
    ): Person
    editNumber(
    name:String!
    phone:String!
    ):Person
    deletePerson(
    id: ID!
    ):Person
    createUser(
    username: String!
    ): User
    login(
    username: String!
    password: String!
    ):Token
    addAsFriend(
    name: String!
    ): User
}



`;

const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) {
        return await Person.find({});
      }
      return await Person.find({ phone: { $exists: args.phone === "YES" } });
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const person = new Person({ ...args });
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      try {
        await person.save();
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();
      } catch (error) {
        throw new GraphQLError("Saving person failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      return person;
    },

    editNumber: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const person = await Person.findOne({ name: args.name });
      person.phone = args.phone;
      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError("Saving number failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      return person;
    },

    deletePerson: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const deletedPerson = await Person.findByIdAndDelete(args.id);
      if (!deletedPerson) {
        throw new GraphQLError("Deleting person failed", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.id },
        });
      }
      return deletedPerson;
    },

    createUser: async (root, args) => {
      const user = await new User({ username: args.username });
      try {
        return user.save();
      } catch (error) {
        throw new GraphQLError("creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, SECRET) };
    },

    addAsFriend: async (root, args, { currentUser }) => {
      const isFriend = (person) =>
        currentUser.friends
          .map((f) => f._id.toString())
          .includes(person._id.toString());

      if (!currentUser) {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const person = await Person.findOne({ name: args.name });

      if (!isFriend(person)) {
        currentUser.friends = currentUser.friends.concat(person);
      }
      await currentUser.save();

      return currentUser;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req?.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), SECRET);
      const currentUser = await User.findById(decodedToken.id).populate(
        "friends"
      );

      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.info(`Server ready at ${url}`);
});
