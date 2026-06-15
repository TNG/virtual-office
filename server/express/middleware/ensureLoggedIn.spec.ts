import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { Config, AuthConfig } from "../../Config.js";
import ensureLoggedIn, { AuthenticatedRequest } from "./ensureLoggedIn.js";

jest.mock("passport", () => ({
  authenticate: jest.fn(),
}));
jest.mock("../../log.js", () => ({
  logger: { error: jest.fn() },
}));

import passport from "passport";

function mockReq(signedCookies: Record<string, any> = {}): Request {
  return { signedCookies } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function mockNext(): NextFunction {
  return jest.fn();
}

function setupConfig(authConfig: AuthConfig, cookieMaxAgeMs = 9000000) {
  const config = { authConfig, cookieMaxAgeMs } as unknown as Config;
  jest.spyOn(Container, "get").mockReturnValue(config);
}

describe("ensureLoggedIn", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("auth disabled", () => {
    it("calls next()", () => {
      setupConfig({ type: "disabled" });
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("no auth config", () => {
    it("returns 401 and calls next with router before crashing on undefined type", () => {
      setupConfig(undefined as any);
      (passport.authenticate as jest.Mock).mockReturnValue(jest.fn());
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      expect(() => ensureLoggedIn(req, res, next)).toThrow(TypeError);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledWith("router");
    });
  });

  describe("valid user in signed cookie", () => {
    it("sets currentUser on request and calls next", () => {
      setupConfig({ type: "slack", clientId: "x", secret: "y" });
      const user = { id: "slack-user", name: "Slack User" };
      const req = mockReq({ currentUser: JSON.stringify(user) }) as AuthenticatedRequest;
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(req.currentUser).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });

    it("calls next for basic user with basic auth", () => {
      setupConfig({ type: "basic", username: "u", password: "p" });
      const user = { id: "basic", name: "Basic User" };
      const req = mockReq({ currentUser: JSON.stringify(user) }) as AuthenticatedRequest;
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(req.currentUser).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe("auth type mismatch", () => {
    it("clears cookie and returns 401 when slack cookie but basic auth", () => {
      setupConfig({ type: "basic", username: "u", password: "p" });
      (passport.authenticate as jest.Mock).mockReturnValue(jest.fn());
      const user = { id: "slack-user", name: "Slack User" };
      const req = mockReq({ currentUser: JSON.stringify(user) });
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith("currentUser", {}, { maxAge: 0 });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledWith("router");
    });

    it("clears cookie and returns 401 when basic cookie but slack auth", () => {
      setupConfig({ type: "slack", clientId: "x", secret: "y" });
      const user = { id: "basic", name: "Basic User" };
      const req = mockReq({ currentUser: JSON.stringify(user) });
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith("currentUser", {}, { maxAge: 0 });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledWith("router");
    });
  });

  describe("basic auth with no cookie", () => {
    it("delegates to passport.authenticate", () => {
      setupConfig({ type: "basic", username: "u", password: "p" });
      const authenticateMock = jest.fn();
      (passport.authenticate as jest.Mock).mockReturnValue(authenticateMock);
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(passport.authenticate).toHaveBeenCalledWith(
        "basic",
        { session: false },
        expect.any(Function)
      );
      expect(authenticateMock).toHaveBeenCalledWith(req, res, next);
    });

    it("sets cookie and calls next when passport authenticates user", () => {
      const cookieMaxAgeMs = 5000;
      setupConfig({ type: "basic", username: "u", password: "p" }, cookieMaxAgeMs);
      let authCallback: (err: any, user: any) => void;
      (passport.authenticate as jest.Mock).mockImplementation(
        (_strategy: string, _opts: any, cb: (err: any, user: any) => void) => {
          authCallback = cb;
          return jest.fn();
        }
      );
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      authCallback!(null, { id: "basic" });

      expect(res.cookie).toHaveBeenCalledWith(
        "currentUser",
        JSON.stringify({ id: "basic" }),
        { signed: true, maxAge: cookieMaxAgeMs, httpOnly: true }
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("returns 401 when passport fails", () => {
      setupConfig({ type: "basic", username: "u", password: "p" });
      let authCallback: (err: any, user: any) => void;
      (passport.authenticate as jest.Mock).mockImplementation(
        (_strategy: string, _opts: any, cb: (err: any, user: any) => void) => {
          authCallback = cb;
          return jest.fn();
        }
      );
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      authCallback!(null, false);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledWith("router");
    });

    it("calls next with error when passport errors", () => {
      setupConfig({ type: "basic", username: "u", password: "p" });
      let authCallback: (err: any, user: any) => void;
      (passport.authenticate as jest.Mock).mockImplementation(
        (_strategy: string, _opts: any, cb: (err: any, user: any) => void) => {
          authCallback = cb;
          return jest.fn();
        }
      );
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();
      const error = new Error("auth failure");

      ensureLoggedIn(req, res, next);

      authCallback!(error, undefined);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("slack auth with no cookie", () => {
    it("returns 401", () => {
      setupConfig({ type: "slack", clientId: "x", secret: "y" });
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      ensureLoggedIn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledWith("router");
    });
  });
});
