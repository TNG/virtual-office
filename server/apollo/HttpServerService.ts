import { Service } from "typedi";
import http, { Server } from "http";
import { Express } from "express";

@Service()
export class HttpServerService {
  constructor() {}

  async create(appInstance: Express): Promise<Server> {
    return http.createServer(appInstance);
  }
}
