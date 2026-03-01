const logService = require("../services/log.service");

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
  // ADMIN_LOG_VIEWED;
  // ADMIN_LOG_EXPORTED;
  // ADMIN_EXPORT_REQUEST_CREATED;
  if (path.includes("/logs")) {
    if (method === "GET") return "ADMIN_LOG_VIEWED";
    if (method === "POST") return "ADMIN_LOG_EXPORTED";
  }

  // By Resource mapping
  if (resource === "VEHICLE") {
    if (method === "POST") return "VEHICLE_CREATED";
    if (method === "PUT" || method === "PATCH") return "VEHICLE_UPDATED";
    if (method === "DELETE") return "VEHICLE_DELETED";
    return "VEHICLE_VIEWED";
  }

  if (resource === "ROUTE") {
    if (method === "POST") return "ROUTE_CREATED";
    if (method === "PUT" || method === "PATCH") return "ROUTE_UPDATED";
    if (method === "DELETE") return "ROUTE_CANCELLED";
    return "ROUTE_VIEWED";
  }

  if (resource === "BOOKING") {
    if (method === "POST") return "BOOKING_CREATED";
    // Assuming PUT translates to booking being processed
    if (method === "PUT" || method === "PATCH") return "BOOKING_CONFIRMED";
    if (method === "DELETE") return "BOOKING_CANCELLED";
    return "BOOKING_VIEWED";
  }

  if (resource === "REVIEW") {
    if (method === "POST") return "REVIEW_CREATED";
    return null; // Avoid unneeded read mappings
  }

  if (resource === "DRIVER_VERIFICATION") {
    if (method === "POST") return "DRIVER_VERIFICATION_SUBMITTED";
    return "DRIVER_LICENSES_VIEWED";
  }

  if (resource === "USER") {
    if (method === "POST") return "USER_REGISTERED";
    if (method === "PUT" || method === "PATCH") return "PROFILE_UPDATED";
    if (method === "DELETE") return "USER_DELETED";
    return "PROFILE_VIEWED";
  }

  if (resource === "EXPORT") {
    if (method === "POST") return "USER_DATA_EXPORT_REQUESTED";
    return null;
  }

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

      const metaDataObj = sanitizeBody(req.body);
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
        userSnapshot: req.user ? JSON.stringify(req.user) : null,
        actionTimeStamp: new Date(),
        ipAddress:
          req.ip ||
          req.headers["x-forward-for"] ||
          req.socket?.remoteAddress ||
          "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        deviceInfo: null,
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
        `${new Date()} [AuditLog] Failed to create log entry: `,
        err.message,
      );
    }
  });
};

module.exports = logger;
