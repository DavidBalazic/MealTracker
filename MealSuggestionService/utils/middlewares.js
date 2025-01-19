require("dotenv").config();
const { postErr, validateToken } = require("./dataFetcher");

async function jwtValidationMiddleware(req, res, next) {
  /*#swagger.tags = ['Middleware']
    #swagger.description = 'Middleware to validate jwt token'
    #swagger.parameters['jwtToken'] = {
      in: 'body',
      description: 'jwt token',
      required: true,
      type: 'string'
    }
    #swagger.responses[401] = {description: 'Missing jwt token'}
    #swagger.responses[401] = {description: 'Invalid jwt token'}

*/
  const insecureAccess = req.app.get("insecureAccess");
  if (insecureAccess == "false") {
    const jwtToken = req.headers.authorization.split(" ")[1]; // Authorization: Bearer <token>
    if (!jwtToken) return res.status(401).json({ error: "Missing jwt token" });
    const validation = await validateToken(jwtToken);
    if (!validation)
      return res.status(401).json({ error: "Invalid jwt token" });
    if (!validation.isValid && validation.error == "expired")
      return res.status(401).json({ error: "Expired jwt token" });
  }
  next();
}

function errorLogger(req, res, next) {
  const originalStatus = res.status;

  res.status = function (statusCode) {
    if (statusCode === 500) {
      const originalJson = res.json; // intercept JSON payload
      res.json = function (body) {
        if (body && body.error) {
          postErr(body.error, 500);
          console.error("Error posted to error service");
        }
        return originalJson.call(this, body); // original res.json
      };
    }
    return originalStatus.call(this, statusCode); // res.status
  };

  next();
}

module.exports = { jwtValidationMiddleware, errorLogger };
