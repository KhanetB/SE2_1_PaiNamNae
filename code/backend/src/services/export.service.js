const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.generateUserData = async (userId) => {
    // 1. ดึงข้อมูลจาก Database พร้อมกันเพื่อประสิทธิภาพ (Parallel Fetching)
    const [user, driverVerification, vehicles, driverRoutes, passengerBookings] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.driverVerification.findUnique({ where: { userId: userId } }),
        prisma.vehicle.findMany({ where: { userId: userId } }),
        prisma.route.findMany({ where: { driverId: userId }, orderBy: { createdAt: 'desc' } }),
        prisma.booking.findMany({ where: { passengerId: userId }, orderBy: { createdAt: 'desc' } })
    ]);

    if (!user) {
        throw new Error('User not found');
    }

    // 2. จัดรูปแบบข้อมูล (Data Mapping) & ตัดข้อมูล Sensitive ออก
    const exportData = {
        meta: {
            request_id: `exp-${userId}-${Date.now()}`,
            generated_at: new Date().toISOString(),
            description: "Personal Data Export (PDPA Compliance)"
        },
        identity: {
            basic_info: {
                username: user.username,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                gender: user.gender,
                phone_number: user.phoneNumber,
                profile_picture: user.profilePicture
            },
            // ข้อมูลที่มีความละเอียดอ่อนสูง (Sensitive PII)
            national_id_verification: {
                // ซ่อนข้อมูล National ID ทั้งหมด ยกเว้น 4 ตัวสุดท้าย
                //national_id_number: user.nationalIdNumber ? "XXXXXXXXX" + user.nationalIdNumber.slice(-4) : null,
                national_id_number: user.nationalIdNumber,
                national_id_photo_url: user.nationalIdPhotoUrl,
                selfie_photo_url: user.selfiePhotoUrl // รูปเซลฟี่สำหรับยืนยันตัวตน User
            },
            // ข้อมูลใบขับขี่ (จะมีค่าเป็น null ถ้าเขาไม่ใช่คนขับ)
            driver_license_verification: driverVerification ? {
                license_number: driverVerification.licenseNumber,
                first_name_on_license: driverVerification.firstNameOnLicense,
                last_name_on_license: driverVerification.lastNameOnLicense,
                license_issue_date: driverVerification.licenseIssueDate,
                license_expiry_date: driverVerification.licenseExpiryDate,
                license_type: driverVerification.typeOnLicense,
                documents: {
                    license_photo_url: driverVerification.licensePhotoUrl,
                    selfie_with_license_url: driverVerification.selfiePhotoUrl // รูปเซลฟี่คู่ใบขับขี่
                }
            } : null
        },

        // --- ส่วนที่ 2: ข้อมูลทรัพย์สิน (Assets) ---
        assets: {
            registered_vehicles: vehicles.map(vehicle => ({
                vehicle_model: vehicle.vehicleModel,
                license_plate: vehicle.licensePlate,
                vehicle_type: vehicle.vehicleType,
                color: vehicle.color,
                seat_capacity: vehicle.seatCapacity,
                amenities: vehicle.amenities, // เช่น ['Wifi', 'Water']
                photos: vehicle.photos
            }))
        },

        // --- ส่วนที่ 3: ประวัติการใช้งาน (Activity History) ---
        activity_history: {
            // ประวัติการเป็นคนขับ (Driver Routes)
            as_driver: driverRoutes.map(route => ({
                route_id: route.id, // แนะนำให้ใส่ ID เผื่อตรวจสอบ
                start_location: route.startLocation,
                end_location: route.endLocation,
                departure_time: route.departureTime,
                available_seats: route.availableSeats,
                price_per_seat: route.pricePerSeat,
                conditions: route.conditions,
                status: route.status,
                created_at: route.createdAt
            })),
            
            // ประวัติการเป็นผู้โดยสาร (Passenger Bookings)
            as_passenger: passengerBookings.map(booking => ({
                booking_id: booking.id, // แนะนำให้ใส่ ID เผื่อตรวจสอบ
                pickup_location: booking.pickupLocation,
                dropoff_location: booking.dropoffLocation,
                number_of_seats: booking.numberOfSeats,
                status: booking.status,
                cancel_reason: booking.cancelReason || null, // แสดง null ถ้าไม่มีเหตุผล
                booked_at: booking.createdAt
            }))
        }
    };

    return exportData;
};