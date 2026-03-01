import { test, expect, afterAll, beforeAll, describe } from "@jest/globals";
import logService from "../src/services/log.service";
import prisma from "../src/utils/prisma";

// =============================================
// Audit Log Service Unit Tests
// =============================================
// Tests: chain hashing, integrity verification,
// expiry date, filtering, and stats.

describe("AuditLog Service", () => {
    let createdLogIds = [];

    // Cleanup after tests — must bypass trigger
    afterAll(async () => {
        try {
            await prisma.$executeRawUnsafe(
                'ALTER TABLE "AuditLog" DISABLE TRIGGER prevent_audit_log_delete'
            );
            if (createdLogIds.length > 0) {
                await prisma.auditLog.deleteMany({
                    where: { id: { in: createdLogIds } },
                });
            }
            await prisma.$executeRawUnsafe(
                'ALTER TABLE "AuditLog" ENABLE TRIGGER prevent_audit_log_delete'
            );
        } catch (e) {
            console.warn("Cleanup warning:", e.message);
        }
        await prisma.$disconnect();
    });

    // ------------------------------------------
    // Test 1: createLog() produces a valid hash
    // ------------------------------------------
    test("createLog() should create a record with a non-empty currentHash", async () => {
        const log = await logService.createLog({
            eventType: "LOGIN_SUCCESS",
            userId: "test-user-001",
            ipAddress: "127.0.0.1",
            accessResult: "SUCCESS",
            httpMethod: "POST",
            endpoint: "/api/auth/login",
            statusCode: 200,
        });

        createdLogIds.push(log.id);

        expect(log).toBeDefined();
        expect(log.id).toBeDefined();
        expect(log.currentHash).toBeDefined();
        expect(log.currentHash.length).toBe(64); // SHA-256 hex = 64 chars
        expect(log.eventType).toBe("LOGIN_SUCCESS");
    });

    // ------------------------------------------
    // Test 2: Chain linking — previousHash matches prior record's currentHash
    // ------------------------------------------
    test("createLog() chain links previousHash to the prior record's currentHash", async () => {
        const log1 = await logService.createLog({
            eventType: "LOGIN_FAILED",
            ipAddress: "192.168.1.100",
            accessResult: "DENIED",
            statusCode: 401,
        });
        createdLogIds.push(log1.id);

        const log2 = await logService.createLog({
            eventType: "API_ACCESS",
            userId: "test-user-002",
            ipAddress: "192.168.1.101",
            accessResult: "SUCCESS",
            statusCode: 200,
        });
        createdLogIds.push(log2.id);

        expect(log2.previousHash).toBe(log1.currentHash);
    });

    // ------------------------------------------
    // Test 3: verifyChainIntegrity() returns valid when chain is correct
    // ------------------------------------------
    test("verifyChainIntegrity() should return valid: true for an intact chain", async () => {
        const result = await logService.verifyChainIntegrity(100);

        expect(result).toBeDefined();
        expect(result.valid).toBe(true);
        expect(result.totalChecked).toBeGreaterThan(0);
    });

    // ------------------------------------------
    // Test 4: computeHash() is deterministic
    // ------------------------------------------
    test("computeHash() should produce the same hash for the same input", () => {
        const data = {
            eventType: "LOGIN_SUCCESS",
            userId: "user-hash-test",
            ipAddress: "10.0.0.1",
            httpMethod: "POST",
            endpoint: "/api/auth/login",
            accessResult: "SUCCESS",
            statusCode: 200,
            createdAt: new Date("2025-01-01T00:00:00Z"),
            previousHash: "abc123",
        };

        const hash1 = logService.computeHash(data);
        const hash2 = logService.computeHash(data);

        expect(hash1).toBe(hash2);
        expect(hash1.length).toBe(64);
    });

    // ------------------------------------------
    // Test 5: createLog() sets expiresAt = createdAt + 90 days
    // ------------------------------------------
    test("createLog() should set expiresAt to 90 days from creation", async () => {
        const log = await logService.createLog({
            eventType: "DATA_READ",
            ipAddress: "10.0.0.5",
            accessResult: "SUCCESS",
            statusCode: 200,
        });
        createdLogIds.push(log.id);

        const createdAt = new Date(log.createdAt);
        const expiresAt = new Date(log.expiresAt);
        const diffDays = Math.round((expiresAt - createdAt) / (1000 * 60 * 60 * 24));

        expect(diffDays).toBe(90);
    });

    // ------------------------------------------
    // Test 6: getAllLogs() with date range filter
    // ------------------------------------------
    test("getAllLogs() should filter by date range", async () => {
        const now = new Date();
        const future = new Date(now);
        future.setDate(future.getDate() + 1);

        const result = await logService.getAllLogs({
            startDate: now.toISOString(),
            endDate: future.toISOString(),
            page: 1,
            pageSize: 10,
        });

        expect(result).toBeDefined();
        expect(result.data).toBeInstanceOf(Array);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
    });

    // ------------------------------------------
    // Test 7: getAllLogs() with eventType filter
    // ------------------------------------------
    test("getAllLogs() should filter by eventTypes", async () => {
        const result = await logService.getAllLogs({
            eventTypes: ["LOGIN_SUCCESS"],
            page: 1,
            pageSize: 10,
        });

        expect(result.data).toBeInstanceOf(Array);
        for (const log of result.data) {
            expect(log.eventType).toBe("LOGIN_SUCCESS");
        }
    });

    // ------------------------------------------
    // Test 8: getLogStats() returns statistics
    // ------------------------------------------
    test("getLogStats() should return byEventType and byAccessResult", async () => {
        const stats = await logService.getLogStats();

        expect(stats).toBeDefined();
        expect(stats.byEventType).toBeInstanceOf(Array);
        expect(stats.byAccessResult).toBeInstanceOf(Array);
        expect(stats.totalLogs).toBeGreaterThanOrEqual(0);
        expect(stats.period).toBeDefined();
    });

    // ------------------------------------------
    // Test 9: logsToCSV() generates valid CSV
    // ------------------------------------------
    test("logsToCSV() should generate valid CSV string", () => {
        const mockLogs = [
            {
                id: "test-id",
                createdAt: new Date("2025-06-01T12:00:00Z"),
                eventType: "LOGIN_SUCCESS",
                userId: "user-1",
                userEmail: "test@example.com",
                userRole: "ADMIN",
                ipAddress: "127.0.0.1",
                userAgent: "Mozilla/5.0",
                httpMethod: "POST",
                endpoint: "/api/auth/login",
                resourceType: "AUTH",
                resourceId: null,
                accessResult: "SUCCESS",
                statusCode: 200,
                sessionId: null,
                details: { action: "login" },
            },
        ];

        const csv = logService.logsToCSV(mockLogs, false);
        expect(csv).toContain("ID,Timestamp,Event Type");
        expect(csv).toContain("test-id");
        expect(csv).toContain("LOGIN_SUCCESS");
        expect(csv).not.toContain("National ID Hash"); // not included when false

        const csvWithNid = logService.logsToCSV(mockLogs, true);
        expect(csvWithNid).toContain("National ID Hash");
    });
});
