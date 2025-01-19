const express = require("express");
const bodyParser = require("body-parser");
const errorRoute = require("./routes/errorRoute");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger.json");
const { graphqlHTTP } = require("express-graphql");
const {
  schema: graphQlSchema,
  root: graphQlRoot,
} = require("./graphql/graphql");

const app = express();

app.use(bodyParser.json());
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/", errorRoute);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlRoot,
    graphiql: true, // Enables the GraphiQL interface
  })
);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
