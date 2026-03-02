const logService = require("../services/log.service");
const uap = require("ua-parser-js");

function mapToActionType(req, statusCode) {
  const path = req.originalUrl || req.path || "";
  const method = (req.method || "").toUpperCase();
  const resource = extractResourceType(path) || "";

  if (path.includes("auth/login")) {
    return statusCode < 400 ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
  }

  if (path.includes("auth/logout")) {
    return "LOGOUT";
  }

  if (
    path.includes("/auth/change-password") ||
    path.includes("/change-password")
  ) {
    return "PASSWORD_CHANGED";
  }

  if (path.includes("/auth/register")) {
    return "USER_REGISTERED";
  }
  if (path.includes("/logs")) {
    if (method === "GET") return "ADMIN_LOG_VIEWED";
    if (method === "POST") return "ADMIN_LOG_EXPORTED";
  }

  // By Resource mapping
  const resourceMapping = {
    VEHICLE: { POST: "VEHICLE_CREATED", PUT: "VEHICLE_UPDATED", PATCH: "VEHICLE_UPDATED", DELETE: "VEHICLE_DELETED", GET: "VEHICLE_VIEWED" },
    ROUTE: { POST: "ROUTE_CREATED", PUT: "ROUTE_UPDATED", PATCH: "ROUTE_UPDATED", DELETE: "ROUTE_CANCELLED", GET: "ROUTE_VIEWED" },
    BOOKING: { POST: "BOOKING_CREATED", PUT: "BOOKING_CONFIRMED", PATCH: "BOOKING_CONFIRMED", DELETE: "BOOKING_CANCELLED", GET: "BOOKING_VIEWED" },
    REVIEW: { POST: "REVIEW_CREATED", PUT: null, PATCH: null, DELETE: null, GET: null },
    DRIVER_VERIFICATION: { POST: "DRIVER_VERIFICATION_SUBMITTED", PUT: null, PATCH: null, DELETE: null, GET: "DRIVER_LICENSES_VIEWED" },
    USER: { POST: "USER_REGISTERED", PUT: "PROFILE_UPDATED", PATCH: "PROFILE_UPDATED", DELETE: "USER_DELETED", GET: "PROFILE_VIEWED" },
    EXPORT: { POST: "USER_DATA_EXPORT_REQUESTED", PUT: null, PATCH: null, DELETE: null, GET: null },
  }


  const action = resourceMapping[resource]?.[method];
  if (action) return action;
  return statusCode >= 400 ? "SYSTEM_ERROR" : null;
}

function extractResourceType(path) {
  const segments = path.replace(/^\/api\//, "").split("/");
  const resource = segments[0] || "";

  const map = {
    auth: "AUTH",
    users: "USER",
    vehicles: "VEHICLE",
    routes: "ROUTE",
    bookings: "BOOKING",
    "driver-verifications": "DRIVER_VERIFICATION",
    notifications: "NOTIFICATION",
    reviews: "REVIEW",
    export: "EXPORT",
    logs: "AUDIT_LOG",
  };
  return map[resource] || resource.toUpperCase() || null;
}

function sanitizeBody(body) {
  if (!body || typeof body !== "object") return null;

  const sensitiveFields = [
    "password",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "nationalNumber",
    "otpCode",
  ];

  const sanitized = { ...body };
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
}

const logger = (req, res, next) => {
  next();
  res.on("finish", async () => {
    try {
      console.log("res.locals: ", res.locals);
      const path = req.originalUrl || req.path || "";
      if (
        path.includes("/heath") ||
        path.includes("/metrics") ||
        path.includes("/documentation") ||
        path.includes("/favicon")
      ) {
        return;
      }

      const action = mapToActionType(req, res.statusCode);

      if (!action) return;

      const ua = uap(req.headers["user-agent"]);
      const deviceInfo = ua.os.name
        ? `${ua.os.name} ${ua.os.version || ''} (${ua.browser.name || 'Unknown Browser'})`
        : "Unknown Device";
      const metaDataObj = logService.maskPII(req.body);
      // Check Status Code
      const accessResult =
        res.statusCode < 400
          ? "SUCCESS"
          : res.statusCode === 401 || res.statusCode === 403
            ? "DENIED"
            : "ERROR";

      await logService.createLog({
        action,
        userId: req.user?.sub || null,
        userSnapshot: await logService.createUserSnapshot(req.user?.sub),
        actionTimeStamp: new Date(),
        ipAddress:
          req.ip ||
          req.headers["x-forward-for"] ||
          req.socket?.remoteAddress ||
          "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        deviceInfo: deviceInfo,
        httpMethod: req.method,
        endpoint: path,
        resourceType: extractResourceType(path) || "UNKNOWN",
        accessResult,
        httpStatusCode: res.statusCode.toString(),
        metaData:
          metaDataObj && Object.keys(metaDataObj).length > 0
            ? JSON.stringify(metaDataObj)
            : null,
        errorMessage: res.locals.errorMessage || null,
      });
    } catch (err) {
      console.error(
        `${new Date().toISOString()} [AuditLog] Error: `,
        err.message,
      );
    }
  });
};

module.exports = logger;
