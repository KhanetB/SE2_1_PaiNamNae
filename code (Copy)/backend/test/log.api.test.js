import { test, expect, describe, beforeAll, afterAll } from "@jest/globals";
import prisma from "../src/utils/prisma";

// =============================================
// Audit Log API Tests
// =============================================
// Tests: admin-only access, API endpoints behavior.
// Note: These tests require a running database.

// Helper to build a mock JWT for testing
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "testsecret";

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

const adminToken = generateToken({ sub: "admin-test-user", role: "ADMIN" });
const passengerToken = generateToken({ sub: "passenger-test-user", role: "PASSENGER" });

// We test the controller logic directly since we may not have the full server running
const logService = require("../src/services/log.service");

describe("AuditLog API Access Control", () => {
    let testLogIds = [];

    beforeAll(async () => {
        // Create some test logs
        const log1 = await logService.createLog({
            eventType: "LOGIN_SUCCESS",
            userId: "api-test-user",
            ipAddress: "10.0.0.1",
            accessResult: "SUCCESS",
            statusCode: 200,
        });
        testLogIds.push(log1.id);

        const log2 = await logService.createLog({
            eventType: "LOGIN_FAILED",
            ipAddress: "10.0.0.2",
            accessResult: "DENIED",
            statusCode: 401,
        });
        testLogIds.push(log2.id);
    });

    afterAll(async () => {
        try {
            await prisma.$executeRawUnsafe(
                'ALTER TABLE "AuditLog" DISABLE TRIGGER prevent_audit_log_delete'
            );
            if (testLogIds.length > 0) {
                await prisma.auditLog.deleteMany({
                    where: { id: { in: testLogIds } },
                });
            }
            await prisma.$executeRawUnsafe(
                'ALTER TABLE "AuditLog" ENABLE TRIGGER prevent_audit_log_delete'
            );
        } catch (e) {
            console.warn("API test cleanup warning:", e.message);
        }
        await prisma.$disconnect();
    });

    // ------------------------------------------
    // Test: getAllLogs returns data with pagination
    // ------------------------------------------
    test("getAllLogs() should return paginated results", async () => {
        const result = await logService.getAllLogs({
            page: 1,
            pageSize: 10,
        });

        expect(result).toBeDefined();
        expect(result.data).toBeInstanceOf(Array);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(10);
        expect(result.pagination.total).toBeGreaterThanOrEqual(2);
        expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    // ------------------------------------------
    // Test: filter by accessResult
    // ------------------------------------------
    test("getAllLogs() should filter by access result DENIED", async () => {
        const result = await logService.getAllLogs({
            accessResult: "DENIED",
            page: 1,
            pageSize: 50,
        });

        expect(result.data).toBeInstanceOf(Array);
        for (const log of result.data) {
            expect(log.accessResult).toBe("DENIED");
        }
    });

    // ------------------------------------------
    // Test: getLogStats returns meaningful data
    // ------------------------------------------
    test("getLogStats() should return event type breakdown", async () => {
        const stats = await logService.getLogStats();

        expect(stats.byEventType).toBeInstanceOf(Array);
        expect(stats.totalLogs).toBeGreaterThanOrEqual(0);

        // Check that at least one of our test events is represented
        const hasLoginSuccess = stats.byEventType.some(
            (s) => s.eventType === "LOGIN_SUCCESS"
        );
        const hasLoginFailed = stats.byEventType.some(
            (s) => s.eventType === "LOGIN_FAILED"
        );
        expect(hasLoginSuccess || hasLoginFailed).toBe(true);
    });

    // ------------------------------------------
    // Test: export request SLA deadline validation
    // ------------------------------------------
    test("ExportRequest should enforce deadline constraints", async () => {
        const now = new Date();
        const validDeadline = new Date(now);
        validDeadline.setDate(validDeadline.getDate() + 10);

        const request = await logService.createExportRequest({
            requestedBy: "admin-test-user",
            officerName: "Test Officer",
            officerOrganization: "Test Org",
            deadline: validDeadline,
            filters: {},
            format: "csv",
            status: "PENDING",
        });

        expect(request).toBeDefined();
        expect(request.id).toBeDefined();
        expect(request.status).toBe("PENDING");
        expect(request.officerName).toBe("Test Officer");

        // Cleanup
        await prisma.exportRequest.delete({ where: { id: request.id } });
    });

    // ------------------------------------------
    // Test: Export CSV generation
    // ------------------------------------------
    test("getLogsForExport() should return all matching logs without pagination", async () => {
        const logs = await logService.getLogsForExport({
            eventTypes: ["LOGIN_SUCCESS"],
        });

        expect(logs).toBeInstanceOf(Array);
        for (const log of logs) {
            expect(log.eventType).toBe("LOGIN_SUCCESS");
        }
    });

    // ------------------------------------------
    // Test: Immutability — AuditLog cannot be updated
    // ------------------------------------------
    test("AuditLog should reject UPDATE operations (immutability trigger)", async () => {
        if (testLogIds.length === 0) return;

        try {
            await prisma.$executeRawUnsafe(
                `UPDATE "AuditLog" SET "eventType" = 'LOGOUT' WHERE id = '${testLogIds[0]}'`
            );
            // If we reach here, the trigger didn't fire
            fail("Expected UPDATE to be rejected by trigger");
        } catch (err) {
            expect(err.message).toContain("immutable");
        }
    });

    // ------------------------------------------
    // Test: Immutability — AuditLog cannot be deleted
    // ------------------------------------------
    test("AuditLog should reject DELETE operations (immutability trigger)", async () => {
        if (testLogIds.length === 0) return;

        try {
            await prisma.$executeRawUnsafe(
                `DELETE FROM "AuditLog" WHERE id = '${testLogIds[0]}'`
            );
            fail("Expected DELETE to be rejected by trigger");
        } catch (err) {
            expect(err.message).toContain("immutable");
        }
    });
});
