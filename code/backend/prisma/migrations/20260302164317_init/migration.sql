-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASSENGER', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('AVAILABLE', 'FULL', 'COMPLETED', 'CANCELLED', 'IN_TRANSIT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'PASSENGER_CONFIRMED_ARRIVAL', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CancelReason" AS ENUM ('CHANGE_OF_PLAN', 'FOUND_ALTERNATIVE', 'DRIVER_DELAY', 'PRICE_ISSUE', 'WRONG_LOCATION', 'DUPLICATE_OR_WRONG_DATE', 'SAFETY_CONCERN', 'WEATHER_OR_FORCE_MAJEURE', 'COMMUNICATION_ISSUE');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PRIVATE_CAR_TEMPORARY', 'PRIVATE_CAR', 'PUBLIC_CAR', 'LIFETIME');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'VERIFICATION', 'BOOKING', 'ROUTE');

-- CreateEnum
CREATE TYPE "ReviewLabel" AS ENUM ('SAFE_DRIVING', 'CLEAN_CAR', 'FRIENDLY_DRIVER', 'GOOD_MUSIC');

-- CreateEnum
CREATE TYPE "ReviewFileType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_EXPIRED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'VERIFY_PASSWORD_FAILED', 'VERIFY_PASSWORD_SUCCESS', 'USER_REGISTERED', 'USER_DELETED', 'PROFILE_VIEWED', 'PROFILE_UPDATED', 'PROFILE_PICTURE_UPLOADED', 'NATIONAL_ID_UPLOADED', 'NATIONAL_ID_VIEWED', 'SELFIE_UPLOADED', 'USER_DATA_EXPORT_REQUESTED', 'VEHICLE_CREATED', 'VEHICLE_UPDATED', 'VEHICLE_DELETED', 'VEHICLE_VIEWED', 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'BOOKING_VIEWED', 'ROUTE_CREATED', 'ROUTE_UPDATED', 'ROUTE_VIEWED', 'ROUTE_CANCELLED', 'ROUTE_STARTED', 'ROUTE_COMPLETED', 'REVIEW_CREATED', 'DRIVER_VERIFICATION_SUBMITTED', 'DRIVER_VERIFICATION_APPROVED', 'DRIVER_VERIFICATION_REJECTED', 'DRIVER_LICENSES_VIEWED', 'ADMIN_USER_VIEWED', 'ADMIN_USER_SUSPENDED', 'ADMIN_USER_UNSUSPENDED', 'ADMIN_USER_DELETED', 'ADMIN_BOOKING_VIEWED', 'ADMIN_ROUTE_VIEWED', 'ADMIN_VERIFICATION_VIEWED', 'ADMIN_LOG_VIEWED', 'ADMIN_LOG_EXPORTED', 'ADMIN_EXPORT_REQUEST_CREATED', 'SYSTEM_ERROR', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'RATE_LIMIT_EXCEEDED');

-- CreateEnum
CREATE TYPE "AccessResult" AS ENUM ('SUCCESS', 'ERROR', 'DENIED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userSnapshot" TEXT,
    "action" "ActionType" NOT NULL,
    "actionTimeStamp" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "httpMethod" TEXT,
    "endpoint" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "accessResult" "AccessResult" NOT NULL,
    "httpStatusCode" TEXT NOT NULL,
    "metaData" JSON,
    "errorMessage" TEXT,
    "integrityHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "phoneNumber" TEXT,
    "profilePicture" TEXT,
    "nationalIdNumber" TEXT,
    "nationalIdPhotoUrl" TEXT,
    "nationalIdExpiryDate" TIMESTAMP(3),
    "selfiePhotoUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PASSENGER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "otpCode" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passengerSuspendedUntil" TIMESTAMP(3),
    "driverSuspendedUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "firstNameOnLicense" TEXT NOT NULL,
    "lastNameOnLicense" TEXT NOT NULL,
    "licenseIssueDate" TIMESTAMP(3) NOT NULL,
    "licenseExpiryDate" TIMESTAMP(3) NOT NULL,
    "licensePhotoUrl" TEXT NOT NULL,
    "selfiePhotoUrl" TEXT NOT NULL,
    "typeOnLicense" "LicenseType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSON,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminReviewedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "amenities" TEXT[],
    "photos" JSON,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "startLocation" JSON NOT NULL,
    "endLocation" JSON NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "pricePerSeat" DOUBLE PRECISION NOT NULL,
    "conditions" TEXT,
    "status" "RouteStatus" NOT NULL DEFAULT 'AVAILABLE',
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "routePolyline" TEXT,
    "distanceMeters" INTEGER,
    "durationSeconds" INTEGER,
    "routeSummary" TEXT,
    "distance" TEXT,
    "duration" TEXT,
    "waypoints" JSON,
    "landmarks" JSON,
    "steps" JSON,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "routeId" TEXT,
    "passengerId" TEXT,
    "numberOfSeats" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancelReason" "CancelReason",
    "pickupLocation" JSON NOT NULL,
    "dropoffLocation" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inTransitAt" TIMESTAMP(3),
    "passengerComfirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT,
    "passengerId" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "files" JSONB,
    "labels" "ReviewLabel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_accessResult_idx" ON "AuditLog"("accessResult");

-- CreateIndex
CREATE INDEX "AuditLog_expiresAt_idx" ON "AuditLog"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalIdNumber_key" ON "User"("nationalIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalIdPhotoUrl_key" ON "User"("nationalIdPhotoUrl");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "User"("isVerified");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverVerification_userId_key" ON "DriverVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverVerification_licenseNumber_key" ON "DriverVerification"("licenseNumber");

-- CreateIndex
CREATE INDEX "DriverVerification_status_idx" ON "DriverVerification"("status");

-- CreateIndex
CREATE INDEX "DriverVerification_createdAt_idx" ON "DriverVerification"("createdAt");

-- CreateIndex
CREATE INDEX "DriverVerification_licenseIssueDate_idx" ON "DriverVerification"("licenseIssueDate");

-- CreateIndex
CREATE INDEX "DriverVerification_licenseExpiryDate_idx" ON "DriverVerification"("licenseExpiryDate");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_adminReviewedAt_idx" ON "Notification"("adminReviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "Vehicle_createdAt_idx" ON "Vehicle"("createdAt");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleType_idx" ON "Vehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "Vehicle_seatCapacity_idx" ON "Vehicle"("seatCapacity");

-- CreateIndex
CREATE INDEX "Route_driverId_idx" ON "Route"("driverId");

-- CreateIndex
CREATE INDEX "Route_vehicleId_idx" ON "Route"("vehicleId");

-- CreateIndex
CREATE INDEX "Route_status_idx" ON "Route"("status");

-- CreateIndex
CREATE INDEX "Route_createdAt_idx" ON "Route"("createdAt");

-- CreateIndex
CREATE INDEX "Route_departureTime_idx" ON "Route"("departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_driverId_createdAt_idx" ON "Review"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_passengerId_createdAt_idx" ON "Review"("passengerId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVerification" ADD CONSTRAINT "DriverVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
