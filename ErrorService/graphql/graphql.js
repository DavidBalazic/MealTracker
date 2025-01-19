const { buildSchema } = require("graphql");
const errors = require("../models/errors");

const schema = buildSchema(`
  type Error {
    message: String!
    code: String!
  }

  type Query {
    getAllErrors: [Error!]!
    getErrorByCode(code: String!): Error
  }

  type Mutation {
    createError(message: String!, code: String!): Error
    clearErrors: String
  }
`);

// GraphQL Resolvers
const root = {
  getAllErrors: () => errors,
  getErrorByCode: ({ code }) => errors.find(err => err.code === code),
  createError: ({ message, code }) => {
    if (!message || !code) {
      throw new Error("Required: message, code");
    }
    const newError = { message, code };
    errors.push(newError);
    return newError;
  },
  clearErrors: () => {
    errors = [];
    return "All errors cleared";
  },
};

module.exports = { schema, root };
