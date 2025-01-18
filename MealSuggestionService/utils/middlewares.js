require("dotenv").config();

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
  const jwtToken = req.body.jwtToken;
  const insecureAccess = req.app.get("insecureAccess");

  if (!insecureAccess) {
    if (!jwtToken) {
      return res.status(401).json({ error: "Missing jwt token" });
    }
    if (!(await validateToken(jwtToken))) {
      return res.status(401).json({ error: "Invalid jwt token" });
    }
  }

  next();
}

module.exports = { jwtValidationMiddleware };
