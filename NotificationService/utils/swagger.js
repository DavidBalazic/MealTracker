const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Notification Service",
    description: "A microservice for sending notifications to users within the FOOD TRACKER project.",
  },
  host: '<domain pending>',
};

const outputFile = '../swagger.json';
const routes = ['../app.js'];

swaggerAutogen(outputFile, routes, doc);