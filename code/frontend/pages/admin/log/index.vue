<template>
  <div>
    <AdminHeader />
    <AdminSidebar />

    <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
      <div class="mx-auto max-w-8xl">
        <div
          class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold text-gray-800">System Logs</h1>
            <button
              :id="exportLog"
              @click="onExportLog"
              class="inline-flex items-center gap-2 px-3 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700"
            >
              <i class="fa-solid fa-file-zipper"></i>
              <span class="hidden sm:inline">Export Evidence</span>
            </button>
            <button
              @click="verifyLogIntegrity"
              class="inline-flex items-center gap-2 px-3 py-2 text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-md cursor-pointer hover:bg-emerald-200 transition-colors"
            >
              <i class="fa-solid fa-shield-halved"></i>
              <span class="hidden sm:inline">Verify Integrity</span>
            </button>
          </div>
        </div>

        <div class="mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <div class="px-4 py-4 sm:px-6">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-filter text-gray-600"></i>
              <span class="text-sm font-semibold text-gray-700"
                >ตัวกรองระบบ (Audit Logs)</span
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div class="flex flex-col">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >วันที่เริ่มต้น</label
                >
                <input
                  :id="startDate"
                  v-model="filters.startDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div class="flex flex-col">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >วันที่สิ้นสุด</label
                >
                <input
                  :id="endDate"
                  v-model="filters.endDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div class="flex flex-col">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >Username</label
                >
                <input
                  :id="username"
                  v-model="filters.username"
                  type="text"
                  placeholder="ระบุ Username"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div class="flex flex-col">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >IP Address</label
                >
                <input
                  :id="ipAddress"
                  v-model="filters.ipAddress"
                  type="text"
                  placeholder="เช่น 192.168.1.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div class="flex flex-col">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >ผลลัพธ์ (Access Result)</label
                >
                <select
                  :id="accessResult"
                  v-model="filters.accessResult"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="DENIED">DENIED (401/403)</option>
                  <option value="ERROR">ERROR (400/500+)</option>
                </select>
              </div>

              <div class="flex flex-col lg:col-span-2">
                <label class="mb-1 text-xs font-medium text-gray-600"
                  >หมวดหมู่ Action</label
                >
                <button
                  :id="openAction"
                  @click="openModal"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-left text-sm bg-white truncate focus:outline-none"
                >
                  {{ displayLabel }}
                </button>

                <div
                  v-if="showModal"
                  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                  <div
                    @click.stop
                    class="bg-white w-[480px] p-6 rounded-xl shadow-lg max-h-[80vh] flex flex-col"
                  >
                    <h2 class="text-lg font-semibold text-center mb-4">
                      เลือกกลุ่ม Action Type
                    </h2>
                    <div class="space-y-3 text-sm overflow-y-auto pr-2 flex-1">
                      <label
                        class="flex items-center gap-2 font-semibold border-b pb-2"
                      >
                        <input type="checkbox" v-model="isAllSelected" />
                        เลือกทั้งหมด
                      </label>
                      <label
                        v-for="item in actionGroups"
                        :key="item.value"
                        class="flex items-start gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          :value="item.value"
                          v-model="tempSelected"
                          class="mt-1"
                        />
                        <div class="flex flex-col">
                          <span class="font-medium text-gray-800">{{
                            item.label
                          }}</span>
                          <span class="text-xs text-gray-500">{{
                            item.desc
                          }}</span>
                        </div>
                      </label>
                    </div>
                    <div class="flex justify-between mt-6 pt-4 border-t">
                      <button
                        @click="clearAll"
                        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        ล้างทั้งหมด
                      </button>
                      <button
                        @click="applyActionFilter"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ใช้ตัวกรองนี้
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-4">
              <button
                :id="applyFilters"
                @click="applyFilters"
                class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
              >
                <i class="fa-solid fa-filter mr-1"></i> ค้นหา
              </button>
              <button
                :id="clearFilters"
                @click="clearFilters"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-300 rounded-lg shadow-sm">
          <div
            class="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:px-6"
          >
            <div class="text-sm text-gray-600">
              หน้าที่ {{ pagination.page }} / {{ totalPages }} • ทั้งหมด
              {{ pagination.total }} รายการ
            </div>
          </div>

          <div v-if="isLoading" class="p-8 text-center text-gray-500">
            <i class="fa-solid fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูล...
          </div>
          <div v-else-if="loadError" class="p-8 text-center text-red-600">
            {{ loadError }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    Timestamp
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    User / IP
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    Action
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    Endpoint / Method
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    Result
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase"
                  >
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="log in logsList"
                  :key="log.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {{ formatDate(log.createdAt) }}
                  </td>
                  <td class="px-4 py-3">
                    <div
                      class="text-sm font-medium text-gray-900"
                      :title="log.userId"
                    >
                      {{
                        log.user && log.user.username
                          ? log.user.username
                          : "System/Guest"
                      }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ log.ipAddress || "-" }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">
                    <span
                      class="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium whitespace-nowrap"
                      >{{ log.action }}</span
                    >
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        :class="getMethodClass(log.httpMethod)"
                      >
                        {{ log.httpMethod || "SYS" }}
                      </span>
                      <span
                        class="text-gray-600 truncate max-w-[200px]"
                        :title="log.endpoint"
                      >
                        {{ log.endpoint }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span
                      :class="getResultClass(log.accessResult)"
                      class="px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                    >
                      <i :class="getResultIcon(log.accessResult)"></i>
                      {{ log.accessResult }}
                    </span>
                    <span
                      class="ml-2 text-xs text-gray-500 border-l pl-2 border-gray-300"
                      title="HTTP Status Code"
                    >
                      {{ log.httpStatusCode || "-" }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">
                    <div class="truncate max-w-[200px]" :title="log.userAgent">
                      {{ log.userAgent }}
                    </div>
                  </td>
                </tr>
                <tr v-if="!logsList.length">
                  <td colspan="6" class="px-4 py-10 text-center text-gray-500">
                    ไม่พบข้อมูล Audit Log
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="flex flex-col gap-3 px-4 py-4 border-t border-gray-200 sm:px-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500">แสดง:</span>
              <select
                v-model.number="pagination.limit"
                @change="applyFilters"
                class="px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 outline-none"
              >
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <nav class="flex items-center gap-1">
              <button
                class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-50"
                :disabled="pagination.page <= 1 || isLoading"
                @click="changePage(pagination.page - 1)"
              >
                Previous
              </button>
              <template v-for="(p, idx) in pageButtons" :key="`p-${idx}-${p}`">
                <span v-if="p === '…'" class="px-2 text-sm text-gray-500"
                  >…</span
                >
                <button
                  v-else
                  class="px-3 py-2 text-sm border rounded-md"
                  :class="
                    p === pagination.page
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'hover:bg-gray-50'
                  "
                  :disabled="isLoading"
                  @click="changePage(p)"
                >
                  {{ p }}
                </button>
              </template>
              <button
                class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-50"
                :disabled="pagination.page >= totalPages || isLoading"
                @click="changePage(pagination.page + 1)"
              >
                Next
              </button>
            </nav>
          </div>
        </div>

        <div
          @click="closeExportModal"
          v-if="showExportModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            @click.stop
            class="relative bg-white w-[500px] p-6 rounded-xl shadow-lg"
          >
            <button
              @click="closeExportModal"
              class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
            <h2 class="text-lg font-semibold mb-2">Export Evidence Package</h2>
            <p class="text-sm text-gray-600 mb-4">
              ระบบจะส่งออกข้อมูลตามตัวกรองปัจจุบันที่คุณเลือกไว้ เป็นไฟล์ ZIP
              ซึ่งประกอบด้วยไฟล์ข้อมูล (CSV), ลายมือชื่ออิเล็กทรอนิกส์
              (Signature), กุญแจสาธารณะ (Public Key)
              และคู่มือการตรวจสอบความถูกต้อง
            </p>

            <div class="space-y-4 text-sm">
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label class="block mb-2 font-medium text-gray-800">
                  <i class="fa-solid fa-user-shield mr-2 text-blue-600"></i
                  >เลือกข้อมูลผู้ใช้ที่ต้องการแนบ (User Snapshot)
                </label>
                <div class="grid grid-cols-2 gap-3 mt-3">
                  <label
                    v-for="field in availableUserFields"
                    :key="field.value"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="field.value"
                      v-model="selectedExportUserFields"
                      class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-gray-700">{{ field.label }}</span>
                  </label>
                </div>
                <p
                  class="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200"
                >
                  * ข้อมูล PII บางส่วนจะถูกเข้ารหัส (Masked) ตาม Privacy Policy
                  ของระบบ
                </p>
              </div>
            </div>

            <div class="mt-6 flex gap-3">
              <button
                @click="closeExportModal"
                type="button"
                class="w-1/3 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmExport"
                :disabled="isExporting"
                class="w-2/3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
              >
                <i v-if="isExporting" class="fa-solid fa-spinner fa-spin"></i>
                <span>{{
                  isExporting
                    ? "กำลังสร้างแพ็กเกจ .zip..."
                    : "ดาวน์โหลดไฟล์ (ZIP)"
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      id="overlay"
      class="fixed inset-0 z-40 hidden bg-black bg-opacity-50 lg:hidden"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCookie, useRuntimeConfig } from "#app";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import AdminHeader from "~/components/admin/AdminHeader.vue";
import AdminSidebar from "~/components/admin/AdminSidebar.vue";
import { useToast } from "~/composables/useToast";
import { useAdminSidebar } from "~/composables/useAdminSidebar";

dayjs.locale("th");
dayjs.extend(buddhistEra);
useHead({
  title: "Audit Logs Dashboard",
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    },
  ],
});
definePageMeta({ middleware: ["admin-auth"] });

const { toast } = useToast();
const { closeMobileSidebar } = useAdminSidebar();
const config = useRuntimeConfig();

// --- State ---
const isLoading = ref(false);
const loadError = ref("");
const logsList = ref([]);

const pagination = reactive({ page: 1, limit: 25, total: 0 });

const filters = reactive({
  startDate: "",
  endDate: "",
  userId: "",
  ipAddress: "",
  accessResult: "",
  username: "",
});

// --- Action Type Modal ---
const showModal = ref(false);

const actionGroups = [
  {
    label: "Authentication",
    desc: "เข้าสู่ระบบ, ล็อกเอาท์, เปลี่ยนรหัสผ่าน",
    value: "LOGIN_SUCCESS,LOGIN_FAILED,LOGOUT,PASSWORD_CHANGED",
  },
  {
    label: "User Management",
    desc: "สมัครสมาชิก, จัดการโปรไฟล์, อัปโหลดเอกสาร",
    value:
      "USER_REGISTERED,USER_DELETED,PROFILE_VIEWED,PROFILE_UPDATED,USER_DATA_EXPORT_REQUESTED",
  },
  {
    label: "Vehicle Management",
    desc: "เพิ่ม แก้ไข ลบ ดูข้อมูลรถ",
    value: "VEHICLE_CREATED,VEHICLE_UPDATED,VEHICLE_DELETED,VEHICLE_VIEWED",
  },
  {
    label: "Booking",
    desc: "การสร้าง ตอบรับ และยกเลิกการจอง",
    value: "BOOKING_CREATED,BOOKING_UPDATED,BOOKING_DELETED,BOOKING_VIEWED",
  },
  { label: "Review", desc: "การสร้างรีวิว", value: "REVIEW_CREATED" },
  {
    label: "Route",
    desc: "การจัดการเส้นทางเดินรถ",
    value: "ROUTE_CREATED,ROUTE_UPDATED,ROUTE_VIEWED,ROUTE_DELETE",
  },
  {
    label: "Driver Verification",
    desc: "ตรวจสอบเอกสารคนขับ",
    value:
      "DRIVER_VERIFICATION_SUBMITTED,DRIVER_VERIFICATION_UPDATED,DRIVER_LICENSES_VIEWED",
  },
  {
    label: "Admin Actions",
    desc: "การดำเนินการของผู้ดูแลระบบ",
    value:
      "ADMIN_VIEWED,ADMIN_CREATED,ADMIN_UPDATED,ADMIN_DELETED,ADMIN_LOG_VIEWED,ADMIN_LOG_EXPORTED",
  },
  {
    label: "System",
    desc: "เหตุการณ์ข้อผิดพลาดของระบบ",
    value: "SYSTEM_ERROR",
  },
];

const selectedActions = ref([]);
const tempSelected = ref([]);

const displayLabel = computed(() => {
  if (
    selectedActions.value.length === 0 ||
    selectedActions.value.length === actionGroups.length
  )
    return "ทั้งหมด";
  return `${selectedActions.value.length} หมวดหมู่ที่เลือก`;
});

const isAllSelected = computed({
  get: () => tempSelected.value.length === actionGroups.length,
  set: (val) => {
    tempSelected.value = val ? actionGroups.map((o) => o.value) : [];
  },
});

function openModal() {
  tempSelected.value = [...selectedActions.value];
  showModal.value = true;
}
function applyActionFilter() {
  selectedActions.value = [...tempSelected.value];
  showModal.value = false;
}
function clearAll() {
  tempSelected.value = [];
  selectedActions.value = [];
  showModal.value = false;
}

// --- Export Modal State ---
const showExportModal = ref(false);
const isExporting = ref(false);

const availableUserFields = [
  { label: "Username", value: "username" },
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
  { label: "Email", value: "email" },
  { label: "Phone Number", value: "phoneNumber" },
  { label: "National ID", value: "nationalIdNumber" },
  { label: "User Role", value: "role" },
];
const selectedExportUserFields = ref([]);

function onExportLog() {
  showExportModal.value = true;
}
function closeExportModal() {
  showExportModal.value = false;
}

// --- Pagination Controls ---
const totalPages = computed(() =>
  Math.max(1, Math.ceil(pagination.total / pagination.limit)),
);

const pageButtons = computed(() => {
  const total = totalPages.value;
  const current = pagination.page;
  if (total < 1) return [];
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current]);
  if (current - 1 > 1) set.add(current - 1);
  if (current + 1 < total) set.add(current + 1);
  const pages = Array.from(set).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) out.push("…");
    out.push(pages[i]);
  }
  return out;
});

function changePage(next) {
  if (next < 1 || next > totalPages.value) return;
  pagination.page = next;
  fetchLogs();
}

function applyFilters() {
  pagination.page = 1;
  fetchLogs();
}

function clearFilters() {
  filters.startDate = "";
  filters.endDate = "";
  filters.userId = "";
  filters.ipAddress = "";
  filters.accessResult = "";
  filters.username = "";
  selectedActions.value = [];
  pagination.page = 1;
  fetchLogs();
}

// --- Formatters ---
function formatDate(dateString) {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMM BB HH:mm:ss");
}

function getResultClass(res) {
  if (res === "SUCCESS") return "bg-green-100 text-green-700";
  if (res === "DENIED") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getResultIcon(res) {
  if (res === "SUCCESS") return "fa-solid fa-check-circle";
  if (res === "DENIED") return "fa-solid fa-triangle-exclamation";
  return "fa-solid fa-circle-xmark";
}

function getMethodClass(method) {
  const m = (method || "").toUpperCase();
  if (m === "GET") return "bg-blue-100 text-blue-700";
  if (m === "POST") return "bg-emerald-100 text-emerald-700";
  if (m === "PUT" || m === "PATCH") return "bg-amber-100 text-amber-700";
  if (m === "DELETE") return "bg-red-100 text-red-700";
  return "bg-gray-200 text-gray-700";
}

// --- Helpers to build Query String ---
function buildQueryParams() {
  const params = new URLSearchParams();
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.ipAddress) params.append("ipAddress", filters.ipAddress);
  if (filters.accessResult) params.append("accessResult", filters.accessResult);
  if (filters.username) params.append("username", filters.username);

  if (selectedActions.value.length > 0) {
    const mergedActions = selectedActions.value.join(",");
    params.append("action", mergedActions);
  }
  return params;
}

// --- API Calls ---
// Helper: ป้องกันปัญหา Double Slashes (//) หรือลืมเติม Slash ใน baseUrl
const getSafeBaseUrl = () => {
  const base = config.public.apiBase || "http://localhost:3000/api";
  return base.replace(/\/$/, "");
};

async function fetchLogs() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const token =
      useCookie("token").value ||
      (process.client ? localStorage.getItem("token") : "");
    const baseUrl = getSafeBaseUrl();

    const params = buildQueryParams();
    params.append("page", pagination.page);
    params.append("pageLimit", pagination.limit);

    const res = await fetch(`${baseUrl}/logs?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const body = await res.json();
    if (!res.ok)
      throw new Error(body?.message || `Request failed: ${res.status}`);

    logsList.value = body.data || body.logs || [];
    pagination.total = body.pagination?.total || body.total || 0;
  } catch (err) {
    console.error(err);
    loadError.value = err?.message || "ไม่สามารถโหลดข้อมูล Logs ได้";
    toast.error("เกิดข้อผิดพลาด", loadError.value);
    logsList.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function verifyLogIntegrity() {
  try {
    const token = useCookie("token").value || localStorage.getItem("token");
    const baseUrl = getSafeBaseUrl();

    toast.info("กำลังตรวจสอบ", "ระบบกำลังสแกนความสมบูรณ์ของประวัติ Logs");

    const res = await fetch(`${baseUrl}/logs/verify`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const body = await res.json();

    if (body.success && body.data?.valid) {
      toast.success(
        "ตรวจสอบสำเร็จ",
        `ข้อมูล Logs ล่าสุดสมบูรณ์ ไม่ถูกดัดแปลง (ตรวจสอบ ${body.data.totalChecked} รายการ)`,
      );
    } else {
      toast.error(
        "พบความผิดปกติ!",
        body.message || "โครงสร้างข้อมูลอาจถูกแทรกแซง",
      );
    }
  } catch (err) {
    toast.error("ผิดพลาด", "ไม่สามารถเชื่อมต่อระบบตรวจสอบได้");
  }
}

async function confirmExport() {
  isExporting.value = true;
  try {
    const token = useCookie("token").value || localStorage.getItem("token");
    const baseUrl = getSafeBaseUrl();

    const params = buildQueryParams();

    if (selectedExportUserFields.value.length > 0) {
      params.append("userFields", selectedExportUserFields.value.join(","));
    }

    const res = await fetch(`${baseUrl}/logs/export?${params.toString()}`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const dateStr = dayjs().format("YYYY-MM-DD");
    a.download = `audit-evidence-${dateStr}.zip`; // บังคับดาวน์โหลดเป็น .zip เสมอ

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(
      "ส่งออกสำเร็จ",
      "ดาวน์โหลดแพ็กเกจพยานหลักฐาน (ZIP) เรียบร้อย",
    );
    closeExportModal();
  } catch (err) {
    toast.error("ส่งออกข้อมูลล้มเหลว", "เกิดข้อผิดพลาดขณะสร้างไฟล์ดาวน์โหลด");
  } finally {
    isExporting.value = false;
  }
}

onMounted(() => {
  fetchLogs();
});
</script>
