-- ============================================================
-- Audit Log Immutability Triggers (พรบ.คอมพิวเตอร์ Compliance)
-- ============================================================
-- These triggers prevent ANY modification or deletion of audit log records.
-- Even database administrators cannot bypass these without dropping the triggers first.

-- Trigger function: raises exception on UPDATE or DELETE
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit Log is immutable: % operation not allowed on AuditLog table', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Prevent UPDATE on AuditLog
CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON "AuditLog"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Prevent DELETE on AuditLog (except expired records via app-level cron)
-- Note: The cron job must temporarily disable this trigger to clean expired logs.
-- ALTER TABLE "AuditLog" DISABLE TRIGGER prevent_audit_log_delete;
-- ... perform delete ...
-- ALTER TABLE "AuditLog" ENABLE TRIGGER prevent_audit_log_delete;
CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON "AuditLog"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================================
-- Access Control (Recommended for production)
-- ============================================================
-- REVOKE UPDATE, DELETE ON "AuditLog" FROM PUBLIC;
-- CREATE ROLE log_writer;
-- GRANT INSERT ON "AuditLog" TO log_writer;
-- CREATE ROLE log_reader;
-- GRANT SELECT ON "AuditLog" TO log_reader;

-- ============================================================
-- NTP Clock Synchronization Requirement
-- ============================================================
-- IMPORTANT: All server clocks MUST be synchronized via NTP
-- to UTC+7 (Asia/Bangkok) for legally admissible timestamps.
-- Docker: use --cap-add SYS_TIME or sync host NTP.
-- Linux: sudo timedatectl set-ntp true
