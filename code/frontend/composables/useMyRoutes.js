/**
 * useMyRoutes — fetch and manage routes + booking requests for drivers
 */
import { ref, computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const REASON_LABEL_MAP = {
  CHANGE_OF_PLAN: "เปลี่ยนแผน/มีธุระกะทันหัน",
  FOUND_ALTERNATIVE: "พบวิธีเดินทางอื่นแล้ว",
  DRIVER_DELAY: "คนขับล่าช้าหรือเลื่อนเวลา",
  PRICE_ISSUE: "ราคาหรือค่าใช้จ่ายไม่เหมาะสม",
  WRONG_LOCATION: "เลือกจุดรับ–ส่งผิด",
  DUPLICATE_OR_WRONG_DATE: "จองซ้ำหรือจองผิดวัน",
  SAFETY_CONCERN: "กังวลด้านความปลอดภัย",
  WEATHER_OR_FORCE_MAJEURE: "สภาพอากาศ/เหตุสุดวิสัย",
  COMMUNICATION_ISSUE: "สื่อสารไม่สะดวก/ติดต่อไม่ได้",
};

export function reasonLabel(v) {
  return REASON_LABEL_MAP[v] || v;
}

function cleanAddr(a) {
  return (a || "")
    .replace(/,?\s*(Thailand|ไทย|ประเทศ)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatDistance(input) {
  if (typeof input !== "string") return input;
  const parts = input.split("+");
  if (parts.length <= 1) return input;
  let meters = 0;
  for (const seg of parts) {
    const n = parseFloat(seg.replace(/[^\d.]/g, ""));
    if (Number.isNaN(n)) continue;
    if (/กม/.test(seg)) meters += n * 1000;
    else if (/เมตร|ม\./.test(seg)) meters += n;
    else meters += n;
  }
  if (meters >= 1000) {
    const km = Math.round((meters / 1000) * 10) / 10;
    return `${km % 1 === 0 ? km.toFixed(0) : km} กม.`;
  }
  return `${Math.round(meters)} ม.`;
}

function formatDuration(input) {
  if (typeof input !== "string") return input;
  const parts = input.split("+");
  if (parts.length <= 1) return input;
  let minutes = 0;
  for (const seg of parts) {
    const n = parseFloat(seg.replace(/[^\d.]/g, ""));
    if (Number.isNaN(n)) continue;
    if (/ชม/.test(seg)) minutes += n * 60;
    else minutes += n;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? (m ? `${h} ชม. ${m} นาที` : `${h} ชม.`) : `${m} นาที`;
}

export function useMyRoutes() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { $api } = useNuxtApp();
  const config = useRuntimeConfig();

  const allTrips = ref([]); // booking requests
  const myRoutes = ref([]); // driver's own routes
  const isLoading = ref(false);
  const activeTab = ref("pending");

  const tabs = [
    { status: "pending", label: "รอดำเนินการ" },
    { status: "passenger_confirmed_arrival", label: "รอยืนยันการถึงจุดหมาย" },
    { status: "confirmed", label: "ยืนยันแล้ว" },
    { status: "rejected", label: "ปฏิเสธ" },
    { status: "cancelled", label: "ยกเลิก" },
    { status: "all", label: "ทั้งหมด" },
    { status: "myRoutes", label: "เส้นทางของฉัน" },
  ];

  const filteredTrips = computed(() => {
    if (activeTab.value === "all") return allTrips.value;
    return allTrips.value.filter((t) => t.status === activeTab.value);
  });

  const getTripCount = (status) => {
    if (status === "all") return allTrips.value.length;
    if (status === "myRoutes") return myRoutes.value.length;
    return allTrips.value.filter((t) => t.status === status).length;
  };

  function buildWaypointLists(r) {
    const wp = r.waypoints || {};
    const baseList =
      Array.isArray(wp.used) && wp.used.length
        ? wp.used
        : Array.isArray(wp.requested)
          ? wp.requested
          : [];
    const orderedList =
      Array.isArray(wp.optimizedOrder) &&
      wp.optimizedOrder.length === baseList.length
        ? wp.optimizedOrder.map((i) => baseList[i])
        : baseList;
    const stops = orderedList
      .map((p) => {
        const name = p?.name || "";
        const address = cleanAddr(p?.address || "");
        const fallback =
          p?.lat != null && p?.lng != null
            ? `(${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})`
            : "";
        const title = name || fallback;
        return address ? `${title} — ${address}` : title;
      })
      .filter(Boolean);
    const stopsCoords = orderedList
      .map((p) =>
        p && typeof p.lat === "number" && typeof p.lng === "number"
          ? {
              lat: p.lat,
              lng: p.lng,
              name: p.name || "",
              address: p.address || "",
            }
          : null,
      )
      .filter(Boolean);
    return { stops, stopsCoords };
  }

  function buildCarDetails(vehicle) {
    if (!vehicle) return ["ไม่มีข้อมูลรถ"];
    const d = [`${vehicle.vehicleModel} (${vehicle.vehicleType})`];
    if (Array.isArray(vehicle.amenities) && vehicle.amenities.length)
      d.push(...vehicle.amenities);
    return d;
  }

  function buildDurationDistance(r) {
    return {
      durationText:
        (typeof r.duration === "string"
          ? formatDuration(r.duration)
          : r.duration) ||
        (r.durationSeconds
          ? `${Math.round(r.durationSeconds / 60)} นาที`
          : "-"),
      distanceText:
        (typeof r.distance === "string"
          ? formatDistance(r.distance)
          : r.distance) ||
        (r.distanceMeters
          ? `${(r.distanceMeters / 1000).toFixed(1)} กม.`
          : "-"),
    };
  }

  async function fetchMyRoutes(reverseGeocodeCallback) {
    isLoading.value = true;
    try {
      const routes = await $api("/routes/me");
      const allowedStatuses = new Set([
        "AVAILABLE",
        "FULL",
        "IN_TRANSIT",
        "COMPLETED",
      ]);
      const formatted = [];
      const ownRoutes = [];

      for (const r of routes) {
        const routeStatus = String(r.status || "").toUpperCase();
        if (!allowedStatuses.has(routeStatus)) continue;
        const carDetails = buildCarDetails(r.vehicle);
        const start = r.startLocation;
        const end = r.endLocation;
        const coords = [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ];
        const { stops, stopsCoords } = buildWaypointLists(r);
        const { durationText, distanceText } = buildDurationDistance(r);
        const baseItem = {
          origin:
            start?.name ||
            `(${Number(start.lat).toFixed(2)}, ${Number(start.lng).toFixed(2)})`,
          destination:
            end?.name ||
            `(${Number(end.lat).toFixed(2)}, ${Number(end.lng).toFixed(2)})`,
          originHasName: !!start?.name,
          destinationHasName: !!end?.name,
          originAddress: start?.address ? cleanAddr(start.address) : null,
          destinationAddress: end?.address ? cleanAddr(end.address) : null,
          coords,
          polyline: r.routePolyline || null,
          stops,
          stopsCoords,
          carDetails,
          conditions: r.conditions || "",
          photos: r.vehicle?.photos || [],
          date: dayjs(r.departureTime).format("D MMMM BBBB"),
          time: dayjs(r.departureTime).format("HH:mm น."),
          durationText,
          distanceText,
        };

        // booking requests per route
        for (const b of r.bookings || []) {
          formatted.push({
            ...baseItem,
            id: b.id,
            status: (b.status || "").toLowerCase(),
            pickupPoint: b.pickupLocation?.name || "-",
            price: (r.pricePerSeat || 0) * (b.numberOfSeats || 0),
            seats: b.numberOfSeats || 0,
            cancelReason: b.cancelReason || null,
            routeStatus: routeStatus.toLowerCase(),
            passenger: {
              name:
                `${b.passenger?.firstName || ""} ${b.passenger?.lastName || ""}`.trim() ||
                "ผู้โดยสาร",
              image:
                b.passenger?.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(b.passenger?.firstName || "P")}&background=random&size=64`,
              email: b.passenger?.email || "",
              isVerified: !!b.passenger?.isVerified,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 50) + 5,
            },
          });
        }

        // own route entry
        const confirmedBookings = (r.bookings || []).filter(
          (b) => (b.status || "").toUpperCase() === "CONFIRMED",
        );
        ownRoutes.push({
          ...baseItem,
          id: r.id,
          status: (r.status || "").toLowerCase(),
          pricePerSeat: r.pricePerSeat || 0,
          availableSeats: r.availableSeats ?? 0,
          passengers: confirmedBookings.map((b) => ({
            id: b.id,
            seats: b.numberOfSeats || 0,
            status: "confirmed",
            name:
              `${b.passenger?.firstName || ""} ${b.passenger?.lastName || ""}`.trim() ||
              "ผู้โดยสาร",
            image:
              b.passenger?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(b.passenger?.firstName || "P")}&background=random&size=64`,
            email: b.passenger?.email || "",
            isVerified: !!b.passenger?.isVerified,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 5,
          })),
        });
      }

      allTrips.value = formatted;
      myRoutes.value = ownRoutes;

      if (reverseGeocodeCallback) await reverseGeocodeCallback(allTrips.value);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      allTrips.value = [];
      myRoutes.value = [];
      toast.error(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถโหลดข้อมูลได้",
      );
    } finally {
      isLoading.value = false;
    }
  }

  async function updateBookingStatus(bookingId, status, successMsg) {
    await $api(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: { status },
    });
    toast.success("สำเร็จ", successMsg);
    await fetchMyRoutes();
  }

  async function deleteBooking(bookingId) {
    await $api(`/bookings/${bookingId}`, { method: "DELETE" });
    toast.success("ลบรายการสำเร็จ", "ลบคำขอออกจากรายการแล้ว");
    await fetchMyRoutes();
  }

  async function confirmDropoff(tripId) {
    try {
      await $fetch(`/bookings/${tripId}/driver-confirm-dropoff`, {
        method: "PATCH",
        baseURL: config.public.apiBase,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      });
      toast.success("สำเร็จ", "คนขับยืนยันเรียบร้อย");
      await fetchMyRoutes();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", `${error}`);
    }
  }

  async function confirmTrip(routeId) {
    try {
      await $api(`/routes/${routeId}/start`, { method: "PATCH" });
      toast.success("สำเร็จ", "แจ้งผู้โดยสารว่ากำลังเดินทางแล้ว");
      await fetchMyRoutes();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", `${error}`);
    }
  }

  async function completedRoute(routeId) {
    try {
      await $fetch(`/routes/${routeId}/complete`, {
        method: "PATCH",
        baseURL: config.public.apiBase,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      });
      toast.success("สำเร็จ", "Route complete successfully");
      await fetchMyRoutes();
    } catch (error) {
      toast.error(
        "เกิดข้อผิดพลาด",
        error?.response?._data?.message || `${error}`,
      );
    }
  }

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("คัดลอกแล้ว", email);
    } catch {
      toast.error("คัดลอกไม่สำเร็จ", "ลองใหม่อีกครั้ง");
    }
  }

  return {
    allTrips,
    myRoutes,
    isLoading,
    activeTab,
    tabs,
    filteredTrips,
    getTripCount,
    fetchMyRoutes,
    confirmTrip,
    completedRoute,
    confirmDropoff,
    updateBookingStatus,
    deleteBooking,
    copyEmail,
  };
}
