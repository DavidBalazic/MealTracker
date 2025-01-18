const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const notificationRoutes = require("./routes/notifications");
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger.json')

const app = express();


app.use(bodyParser.json());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/notification-service';

mongoose
  .connect(mongoUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/", notificationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

