let mock_db = {}
let count = 0;

jest.mock("../../src/services/log.service", function() {
  return {
    createLog: jest.fn(async function(data) {
      mock_db[count] = data
    }),
    maskPII: jest.fn(() => ({})),
    createUserSnapshot: jest.fn(async () => ({})),
  };
});

import logger from "../../src/middlewares/logger";
import { createLog as _createLog } from "../../src/services/log.service";

beforeEach(() => {
  jest.clearAllMocks();
});

test("TC16 View Route", async () => {
  const expectedAction = "ROUTE_VIEWED"
  const expectedAccessResult = "SUCCESS"
  const reqPath = "/api/routes"
  const method = "GET"
  const req = {
    user: { sub: 1 },
    method: method,
    path: reqPath,
    originalUrl: reqPath,
    ip: "127.0.0.1",
    headers: {
      "user-agent": "jest-test-agent",
    },
    body: {},
  };

  const res = {
    statusCode: 200,
    locals: {},
    on: jest.fn((event, callback) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }),
  };

  let finishCallback;

  const next = jest.fn();

  logger(req, res, next);

  await finishCallback();

  expect(next).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledWith(
    expect.objectContaining({
      action: expectedAction,
      accessResult: expectedAccessResult,
      userId: req.user.sub,
      endpoint: req.path,
      httpMethod: req.method,
      httpStatusCode: res.statusCode.toString(),
    }),
  );
});

test("TC17 Create Route", async () => {
  const expectedAction = "ROUTE_CREATED"
  const expectedAccessResult = "SUCCESS"
  const reqPath = "/api/routes"
  const method = "POST"
  const req = {
    user: { sub: 1 },
    method: method,
    path: reqPath,
    originalUrl: reqPath,
    ip: "127.0.0.1",
    headers: {
      "user-agent": "jest-test-agent",
    },
    body: {},
  };

  const res = {
    statusCode: 200,
    locals: {},
    on: jest.fn((event, callback) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }),
  };

  let finishCallback;

  const next = jest.fn();

  logger(req, res, next);

  await finishCallback();

  expect(next).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledWith(
    expect.objectContaining({
      action: expectedAction,
      accessResult: expectedAccessResult,
      userId: req.user.sub,
      endpoint: req.path,
      httpMethod: req.method,
      httpStatusCode: res.statusCode.toString(),
    }),
  );
});

test("TC18 Update Route", async () => {
  const expectedAction = "ROUTE_UPDATED"
  const expectedAccessResult = "SUCCESS"
  const reqPath = "/api/routes"
  const method = "PATCH"
  const req = {
    user: { sub: 1 },
    method: method,
    path: reqPath,
    originalUrl: reqPath,
    ip: "127.0.0.1",
    headers: {
      "user-agent": "jest-test-agent",
    },
    body: {},
  };

  const res = {
    statusCode: 200,
    locals: {},
    on: jest.fn((event, callback) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }),
  };

  let finishCallback;

  const next = jest.fn();

  logger(req, res, next);

  await finishCallback();

  expect(next).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledWith(
    expect.objectContaining({
      action: expectedAction,
      accessResult: expectedAccessResult,
      userId: req.user.sub,
      endpoint: req.path,
      httpMethod: req.method,
      httpStatusCode: res.statusCode.toString(),
    }),
  );
});

test("TC19 Delete Route", async () => {
  const expectedAction = "ROUTE_CANCELLED"
  const expectedAccessResult = "SUCCESS"
  const reqPath = "/api/routes"
  const method = "DELETE"
  const req = {
    user: { sub: 1 },
    method: method,
    path: reqPath,
    originalUrl: reqPath,
    ip: "127.0.0.1",
    headers: {
      "user-agent": "jest-test-agent",
    },
    body: {},
  };

  const res = {
    statusCode: 200,
    locals: {},
    on: jest.fn((event, callback) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }),
  };

  let finishCallback;

  const next = jest.fn();

  logger(req, res, next);

  await finishCallback();

  expect(next).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledTimes(1);
  expect(_createLog).toHaveBeenCalledWith(
    expect.objectContaining({
      action: expectedAction,
      accessResult: expectedAccessResult,
      userId: req.user.sub,
      endpoint: req.path,
      httpMethod: req.method,
      httpStatusCode: res.statusCode.toString(),
    }),
  );
});
