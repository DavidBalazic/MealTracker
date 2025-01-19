const { buildSchema } = require("graphql");
const { sendEmail } = require("../utils/emailSender");

const schema = buildSchema(`
    type Query {
      health: String
    }
  
    type Mutation {
      send(content: String!, userEmail: String!): Response
    }
  
    type Response {
      message: String!
      content: String!
      userEmail: String!
    }
  `);

// resolvers
const root = {
  health: () => "GraphQL is running!",

  send: async ({ content, userEmail }) => {
    if (!content || !userEmail) {
      throw new Error("Both content and userEmail are required.");
    }

    await sendEmail(userEmail, "New Notification", content);
    console.log(`Email notification sent to ${userEmail}`);
    // Logic to handle the content and userEmail (e.g., save to database, send an email, etc.)
    return {
      message: "Data received successfully!",
      content,
      userEmail,
    };
  },
};

module.exports = { schema, root };
