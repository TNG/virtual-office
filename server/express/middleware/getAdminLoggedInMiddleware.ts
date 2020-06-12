import { RequestHandler } from "express";
import basicAuth from "express-basic-auth";
import { Config } from "../../Config";

export function getAdminLoggedInMiddleware(config: Config): RequestHandler {
  const credentials = config.adminEndpointsCredentials;
  if (credentials) {
    return basicAuth({
      users: { [credentials.username]: credentials.password },
      challenge: true,
      realm: "OpenAPI VirtualOffice",
    });
  }
  return (req, res, next) => next();
}
