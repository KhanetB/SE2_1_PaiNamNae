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

  if (path.includes("/admin")) {
    if (method === "GET") return "ADMIN_VIEWED";
    if (method === "POST") return "ADMIN_CREATED";
    if (method === "PATCH") return "ADMIN_UPDATED";
    if (method === "PUT") return "ADMIN_UPDATED";
    if (method === "DELETE") return "ADMIN_DELETED";
  }

  // By Resource mapping
  const resourceMapping = {
    VEHICLE: {
      POST: "VEHICLE_CREATED",
      PUT: "VEHICLE_UPDATED",
      PATCH: "VEHICLE_UPDATED",
      DELETE: "VEHICLE_DELETED",
      GET: "VEHICLE_VIEWED",
    },
    ROUTE: {
      POST: "ROUTE_CREATED",
      PUT: "ROUTE_UPDATED",
      PATCH: "ROUTE_UPDATED",
      DELETE: "ROUTE_CANCELLED",
      GET: "ROUTE_VIEWED",
    },
    BOOKING: {
      POST: "BOOKING_CREATED",
      PUT: "BOOKING_UPDATED",
      PATCH: "BOOKING_UPDATED",
      DELETE: "BOOKING_DELETED",
      GET: "BOOKING_VIEWED",
    },
    REVIEW: {
      POST: "REVIEW_CREATED",
      PUT: null,
      PATCH: null,
      DELETE: null,
      GET: null,
    },
    DRIVER_VERIFICATION: {
      POST: "DRIVER_VERIFICATION_SUBMITTED",
      PUT: "DRIVER_VERIFICATION_UPDATED",
      PATCH: "DRIVER_VERIFICATION_UPDATED",
      DELETE: null,
      GET: "DRIVER_LICENSES_VIEWED",
    },
    USER: {
      POST: "USER_REGISTERED",
      PUT: "PROFILE_UPDATED",
      PATCH: "PROFILE_UPDATED",
      DELETE: "USER_DELETED",
      GET: "PROFILE_VIEWED",
    },
    EXPORT: {
      POST: "USER_DATA_EXPORT_REQUESTED",
      PUT: null,
      PATCH: null,
      DELETE: null,
      GET: "USER_DATA_EXPORT_REQUESTED",
    },
  };

  const action = resourceMapping[resource]?.[method];
  if (action) return action;
  return statusCode >= 400 ? "SYSTEM_ERROR" : null;
}

function extractResourceType(path) {
  if (!path) return;
  let cleanPath = path.split("?")[0];
  cleanPath = cleanPath.replace(/\/{2,}/g, "/");
  const segments = cleanPath.split("/").filter(Boolean);
  const resourceSegment = segments[0] === "api" ? segments[1] : segments[0];
  if (!resourceSegment) return null;
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
  return map[resourceSegment] || resourceSegment.toUpperCase() || null;
}

const logger = (req, res, next) => {
  next();
  res.on("finish", async () => {
    try {
      const path = req.originalUrl || req.path || "";

      if (
        path.includes("/heath") ||
        path.includes("/metrics") ||
        path.includes("/documentation") ||
        path.includes("/favicon") ||
        path.includes("/notifications")
      ) {
        return;
      }

      const action = mapToActionType(req, res.statusCode);
      const ua = uap(req.headers["user-agent"]);
      const deviceInfo = ua.os.name
        ? `${ua.os.name} ${ua.os.version || ""} (${ua.browser.name || "Unknown Browser"})`
        : "Unknown Device";
      const metaDataObj = logService.maskPII(req.body);
      // Check Status Code
      const accessResult =
        res.statusCode < 400
          ? "SUCCESS"
          : res.statusCode === 401 || res.statusCode === 403
            ? "DENIED"
            : "ERROR";
      // console.log("User Id: ", req.user?.sub);
      await logService.createLog({
        action: action || "UNKNOWN",
        userId: req.user?.sub ?? res.locals.userId ?? null,
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
