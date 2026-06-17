declare module "passport-slack-oauth2";
declare module "dotenv" {
  export function config(options?: any): any;
}
declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  const swaggerUI: { serve: RequestHandler[]; setup: (options?: any) => RequestHandler };
  export default swaggerUI;
  export const serve: RequestHandler[];
  export const setup: (options?: any) => RequestHandler;
}
