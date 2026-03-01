-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PAGE_ACCESS', 'API_ACCESS', 'DATA_CREATE', 'DATA_READ', 'DATA_UPDATE', 'DATA_DELETE', 'FILE_ACCESS', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'ACCOUNT_DEACTIVATED', 'ADMIN_ACTION', 'ADMIN_LOG_VIEWED', 'ADMIN_LOG_EXPORTED', 'DRIVER_VERIFICATION', 'BOOKING_ACTION', 'ROUTE_ACTION', 'SYSTEM_EVENT');

-- CreateEnum
CREATE TYPE "LogAccessResult" AS ENUM ('SUCCESS', 'DENIED', 'ERROR');

-- CreateEnum
CREATE TYPE "ExportRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventType" "LogEventType" NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "nationalIdHash" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "httpMethod" TEXT,
    "endpoint" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "accessResult" "LogAccessResult" NOT NULL,
    "statusCode" INTEGER,
    "details" JSON,
    "sessionId" TEXT,
    "previousHash" TEXT,
    "currentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "officerName" TEXT NOT NULL,
    "officerOrganization" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "filters" JSON NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'csv',
    "status" "ExportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_accessResult_idx" ON "AuditLog"("accessResult");

-- CreateIndex
CREATE INDEX "AuditLog_expiresAt_idx" ON "AuditLog"("expiresAt");

-- CreateIndex
CREATE INDEX "ExportRequest_status_idx" ON "ExportRequest"("status");

-- CreateIndex
CREATE INDEX "ExportRequest_deadline_idx" ON "ExportRequest"("deadline");

-- CreateIndex
CREATE INDEX "ExportRequest_requestedBy_idx" ON "ExportRequest"("requestedBy");
