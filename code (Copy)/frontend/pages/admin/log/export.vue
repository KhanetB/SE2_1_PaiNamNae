<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">📦 Export Management</h1>
          <p class="mt-1 text-sm text-gray-500">ส่งออกข้อมูล Log ตามคำสั่งเจ้าหน้าที่ (SLA 7-15 วัน)</p>
        </div>
        <NuxtLink to="/admin/log"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50">
          <i class="fas fa-arrow-left"></i> Back to Logs
        </NuxtLink>
      </div>

      <!-- Quick Export Card -->
      <div class="p-6 mb-6 bg-white border rounded-lg shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-800">⚡ Quick Export</h2>
        <p class="mb-4 text-sm text-gray-500">ดาวน์โหลดข้อมูล Log ทันทีตาม filter ที่กำหนด</p>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">Start Date</label>
            <input v-model="quickFilters.startDate" type="datetime-local"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">End Date</label>
            <input v-model="quickFilters.endDate" type="datetime-local"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">User ID / Email</label>
            <input v-model="quickFilters.userId" type="text" placeholder="ค้นหา..."
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">IP Address</label>
            <input v-model="quickFilters.ipAddress" type="text" placeholder="เช่น 192.168.1.1"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4 mt-3">
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">Format</label>
            <select v-model="quickFilters.format"
              class="px-3 py-2 text-sm border rounded-lg focus:outline-none">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="quickFilters.includeNationalId" id="qIncludeNid"
              class="w-4 h-4 text-blue-600 rounded" />
            <label for="qIncludeNid" class="text-xs text-gray-600">Include National ID Hash</label>
          </div>
          <button @click="handleQuickExport" :disabled="exportLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <span v-if="exportLoading">⏳ Exporting...</span>
            <span v-else>📥 Download Now</span>
          </button>
        </div>
      </div>

      <!-- New Export Request Form -->
      <div class="p-6 mb-6 bg-white border rounded-lg shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-800">📋 New Export Request (SLA)</h2>
        <p class="mb-4 text-sm text-gray-500">สร้างคำร้องขอ Export ตามคำสั่งเจ้าหน้าที่พนักงาน — Deadline ต้องอยู่ระหว่าง 7-15 วัน</p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">ชื่อเจ้าหน้าที่ *</label>
            <input v-model="requestForm.officerName" type="text" placeholder="ชื่อ-นามสกุล"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">หน่วยงาน *</label>
            <input v-model="requestForm.officerOrganization" type="text" placeholder="หน่วยงาน / องค์กร"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">Deadline (7-15 วัน) *</label>
            <input v-model="requestForm.deadline" type="date" :min="minDeadline" :max="maxDeadline"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">Format</label>
            <select v-model="requestForm.format"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <!-- Filters for request -->
        <div class="p-4 mt-4 rounded-lg bg-gray-50">
          <h3 class="mb-2 text-sm font-semibold text-gray-700">Filter Options (optional)</h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="block mb-1 text-xs text-gray-500">Start Date</label>
              <input v-model="requestForm.filters.startDate" type="datetime-local"
                class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none" />
            </div>
            <div>
              <label class="block mb-1 text-xs text-gray-500">End Date</label>
              <input v-model="requestForm.filters.endDate" type="datetime-local"
                class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none" />
            </div>
            <div>
              <label class="block mb-1 text-xs text-gray-500">User ID / Email</label>
              <input v-model="requestForm.filters.userId" type="text"
                class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none" />
            </div>
            <div>
              <label class="block mb-1 text-xs text-gray-500">IP Address</label>
              <input v-model="requestForm.filters.ipAddress" type="text"
                class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none" />
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="handleCreateRequest" :disabled="requestLoading"
            class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
            <span v-if="requestLoading">⏳ Creating...</span>
            <span v-else>✅ Create Export Request</span>
          </button>
        </div>

        <p v-if="requestError" class="mt-2 text-sm text-red-600">{{ requestError }}</p>
        <p v-if="requestSuccess" class="mt-2 text-sm text-green-600">{{ requestSuccess }}</p>
      </div>

      <!-- Export Request List -->
      <div class="p-6 bg-white border rounded-lg shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">📄 Export Requests</h2>
          <button @click="loadRequests" class="text-sm text-blue-600 hover:text-blue-800">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <div v-if="requestsLoading" class="flex items-center justify-center py-8">
          <div class="w-6 h-6 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>

        <div v-else-if="exportRequests.length === 0" class="py-8 text-center text-gray-400">
          No export requests yet
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Created</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Officer</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Organization</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Deadline</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Format</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="req in exportRequests" :key="req.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                  {{ formatDate(req.createdAt) }}
                </td>
                <td class="px-4 py-3 text-xs text-gray-700">{{ req.officerName }}</td>
                <td class="px-4 py-3 text-xs text-gray-700">{{ req.officerOrganization }}</td>
                <td class="px-4 py-3 text-xs whitespace-nowrap"
                  :class="isOverdue(req.deadline) ? 'text-red-600 font-semibold' : 'text-gray-600'">
                  {{ formatDate(req.deadline) }}
                </td>
                <td class="px-4 py-3 text-xs text-gray-600 uppercase">{{ req.format }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="statusBadge(req.status)">
                    {{ req.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button v-if="req.status === 'COMPLETED'" @click="handleDownloadRequest(req)"
                    class="text-xs text-blue-600 hover:text-blue-800">
                    📥 Download
                  </button>
                  <button v-else-if="req.status === 'PENDING'" @click="handleProcessRequest(req)"
                    class="text-xs text-green-600 hover:text-green-800">
                    ⚡ Process
                  </button>
                  <span v-else class="text-xs text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuditLog } from '~/composables/useAuditLog'

definePageMeta({ middleware: 'auth' })

const {
  quickExport,
  createExportRequest,
  fetchExportRequests,
  getExportRequest,
  downloadExportRequest,
} = useAuditLog()

// Quick Export state
const exportLoading = ref(false)
const quickFilters = reactive({
  startDate: '',
  endDate: '',
  userId: '',
  ipAddress: '',
  format: 'csv',
  includeNationalId: false,
})

// Export Request form
const requestLoading = ref(false)
const requestError = ref('')
const requestSuccess = ref('')
const requestForm = reactive({
  officerName: '',
  officerOrganization: '',
  deadline: '',
  format: 'csv',
  filters: {
    startDate: '',
    endDate: '',
    userId: '',
    ipAddress: '',
  },
})

// Request list
const requestsLoading = ref(false)
const exportRequests = ref([])

// Deadline helpers (7-15 days from now)
const minDeadline = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
})
const maxDeadline = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toISOString().split('T')[0]
})

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function isOverdue(deadline) {
  return new Date(deadline) < new Date()
}

function statusBadge(status) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-700'
    case 'PROCESSING': return 'bg-blue-100 text-blue-700'
    case 'COMPLETED': return 'bg-green-100 text-green-700'
    case 'EXPIRED': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// Actions
async function handleQuickExport() {
  exportLoading.value = true
  try {
    const params = { ...quickFilters }
    if (params.startDate) params.startDate = new Date(params.startDate).toISOString()
    if (params.endDate) params.endDate = new Date(params.endDate).toISOString()
    await quickExport(params)
  } catch (err) {
    console.error('Quick export failed:', err)
    alert('Export failed: ' + err.message)
  } finally {
    exportLoading.value = false
  }
}

async function handleCreateRequest() {
  requestError.value = ''
  requestSuccess.value = ''

  if (!requestForm.officerName || !requestForm.officerOrganization || !requestForm.deadline) {
    requestError.value = 'กรุณากรอกชื่อเจ้าหน้าที่ หน่วยงาน และ deadline'
    return
  }

  requestLoading.value = true
  try {
    const filters = {}
    if (requestForm.filters.startDate) filters.startDate = new Date(requestForm.filters.startDate).toISOString()
    if (requestForm.filters.endDate) filters.endDate = new Date(requestForm.filters.endDate).toISOString()
    if (requestForm.filters.userId) filters.userId = requestForm.filters.userId
    if (requestForm.filters.ipAddress) filters.ipAddress = requestForm.filters.ipAddress

    await createExportRequest({
      officerName: requestForm.officerName,
      officerOrganization: requestForm.officerOrganization,
      deadline: new Date(requestForm.deadline).toISOString(),
      filters,
      format: requestForm.format,
    })

    requestSuccess.value = 'สร้าง Export Request สำเร็จ!'
    requestForm.officerName = ''
    requestForm.officerOrganization = ''
    requestForm.deadline = ''
    await loadRequests()
  } catch (err) {
    requestError.value = err.message || 'Failed to create export request'
  } finally {
    requestLoading.value = false
  }
}

async function handleProcessRequest(req) {
  try {
    await getExportRequest(req.id)
    await loadRequests()
  } catch (err) {
    console.error('Process failed:', err)
  }
}

async function handleDownloadRequest(req) {
  try {
    await downloadExportRequest(req.id, req.format)
  } catch (err) {
    console.error('Download failed:', err)
    alert('Download failed: ' + err.message)
  }
}

async function loadRequests() {
  requestsLoading.value = true
  try {
    const result = await fetchExportRequests()
    exportRequests.value = result.data || []
  } catch (err) {
    console.error('Failed to load requests:', err)
  } finally {
    requestsLoading.value = false
  }
}

onMounted(() => {
  loadRequests()
})
</script>
