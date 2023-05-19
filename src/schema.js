const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Movie {
    id: ID!
    name: String!
    description: String!
    director: String!
    releaseDate: String!
  }

  type Review {
    id: ID!
    movie: Movie!
    user: User!
    rating: Int!
    comment: String!
  }

  type Query {
    movies: [Movie!]!
    movie(id: ID!): Movie
    reviews(movieId: ID!): [Review!]!
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
    changePassword(oldPassword: String!, newPassword: String!): String
    createMovie(name: String!, description: String!, director: String!, releaseDate: String!): Movie
    updateMovie(id: ID!, name: String, description: String, director: String, releaseDate: String): Movie
    deleteMovie(id: ID!): ID
    createReview(movieId: ID!, rating: Int!, comment: String!): Review
    updateReview(id: ID!, rating: Int, comment: String): Review
    deleteReview(id: ID!): ID
  }
`;

module.exports = typeDefs;
