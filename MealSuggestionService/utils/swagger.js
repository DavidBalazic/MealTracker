const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Meal Suggestion Service",
    description: "A microservice for sugggesting recipes to users within the FOOD TRACKER project.",
    
  },
  host: '<domain pending>',
};

const outputFile = '../swagger.json';
const files = ['../app.js', './middlewares.js'];


swaggerAutogen(outputFile, files, doc);