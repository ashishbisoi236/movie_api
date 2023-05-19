const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      return { userId };
    } catch (error) {
      return {};
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
