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

test("TC24 Create Review", async () => {
  const expectedAction = "REVIEW_CREATED"
  const expectedAccessResult = "SUCCESS"
  const reqPath = "/api/reviews"
  const method = "POSt"
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
