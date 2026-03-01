<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Header -->
      <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">📋 Audit Log Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">ระบบบันทึกข้อมูลจราจรทางคอมพิวเตอร์ตาม พรบ.คอมพิวเตอร์</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Chain Integrity Badge -->
          <button @click="checkIntegrity" :disabled="integrityLoading"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border rounded-lg shadow-sm"
            :class="integrityBadgeClass">
            <span v-if="integrityLoading" class="animate-spin">⏳</span>
            <span v-else>{{ integrityIcon }}</span>
            {{ integrityLabel }}
          </button>
          <!-- Export Button -->
          <NuxtLink to="/admin/log/export"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
            <i class="fas fa-download"></i>
            Export
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <div class="p-4 bg-white border rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">Total Logs (30d)</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.totalLogs?.toLocaleString() || 0 }}</p>
        </div>
        <div class="p-4 bg-white border rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">Success</p>
          <p class="text-2xl font-bold text-green-600">{{ getResultCount('SUCCESS') }}</p>
        </div>
        <div class="p-4 bg-white border rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">Denied</p>
          <p class="text-2xl font-bold text-orange-600">{{ getResultCount('DENIED') }}</p>
        </div>
        <div class="p-4 bg-white border rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">Error</p>
          <p class="text-2xl font-bold text-red-600">{{ getResultCount('ERROR') }}</p>
        </div>
      </div>

      <!-- Filter Panel -->
      <div class="p-4 mb-6 bg-white border rounded-lg shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-700">
            <i class="mr-1 fas fa-filter"></i> Filters
          </h2>
          <button @click="resetFilters" class="text-sm text-blue-600 hover:text-blue-800">Reset</button>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <!-- Date Range -->
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">📅 Start Date</label>
            <input v-model="filters.startDate" type="datetime-local"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">📅 End Date</label>
            <input v-model="filters.endDate" type="datetime-local"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>

          <!-- User / IP -->
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">👤 User ID / Email</label>
            <input v-model="filters.userId" type="text" placeholder="ค้นหา User..."
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">🌐 IP Address</label>
            <input v-model="filters.ipAddress" type="text" placeholder="เช่น 192.168.1.1"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
        </div>

        <!-- Event Type Multi-Select -->
        <div class="mt-3">
          <label class="block mb-1 text-xs font-medium text-gray-600">🎯 Event Types</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="et in eventTypeOptions" :key="et"
              class="flex items-center gap-1 px-2 py-1 text-xs border rounded-full cursor-pointer"
              :class="filters.eventTypes.includes(et) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'">
              <input type="checkbox" :value="et" v-model="filters.eventTypes" class="hidden" />
              {{ formatEventType(et) }}
            </label>
          </div>
        </div>

        <!-- Access Result + National ID Toggle -->
        <div class="flex flex-wrap items-end gap-4 mt-3">
          <div>
            <label class="block mb-1 text-xs font-medium text-gray-600">✅ Access Result</label>
            <select v-model="filters.accessResult"
              class="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none">
              <option value="">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="DENIED">DENIED</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="showNationalId" class="sr-only peer" />
              <div
                class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
            <span class="text-xs text-gray-600">🆔 Show National ID</span>
          </div>
          <button @click="applyFilters"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Log Table -->
      <div class="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <span class="ml-3 text-gray-500">Loading logs...</span>
        </div>

        <table v-else class="min-w-full text-sm divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Timestamp</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Event Type</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">User</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">IP Address</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Method</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Endpoint</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Result</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Status</th>
              <th v-if="showNationalId" class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">National ID</th>
              <th class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="logs.length === 0">
              <td :colspan="showNationalId ? 10 : 9" class="px-4 py-8 text-center text-gray-400">
                No log records found
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="transition-colors hover:bg-gray-50">
              <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="eventTypeBadge(log.eventType)">
                  {{ formatEventType(log.eventType) }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                {{ log.userEmail || log.userId || '-' }}
              </td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                {{ log.ipAddress }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-0.5 text-xs font-mono rounded" :class="methodBadge(log.httpMethod)">
                  {{ log.httpMethod || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" :title="log.endpoint">
                {{ log.endpoint || '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="resultBadge(log.accessResult)">
                  {{ log.accessResult }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                {{ log.statusCode || '-' }}
              </td>
              <td v-if="showNationalId" class="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                {{ log.nationalIdHash ? log.nationalIdHash.substring(0, 12) + '...' : '-' }}
              </td>
              <td class="px-4 py-3">
                <button v-if="log.details" @click="showDetails(log)"
                  class="text-xs text-blue-600 hover:text-blue-800">
                  View
                </button>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col items-center justify-between gap-3 mt-4 sm:flex-row">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Show</span>
          <select v-model="filters.pageSize" @change="applyFilters"
            class="px-2 py-1 text-sm border rounded-lg focus:outline-none">
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="text-sm text-gray-500">per page</span>
        </div>

        <div class="flex items-center gap-1">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">
            ← Prev
          </button>
          <template v-for="btn in pageButtons" :key="btn">
            <span v-if="btn === '…'" class="px-2 text-gray-400">…</span>
            <button v-else @click="changePage(btn)"
              class="px-3 py-1 text-sm border rounded-lg"
              :class="btn === pagination.page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'">
              {{ btn }}
            </button>
          </template>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= totalPages"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">
            Next →
          </button>
        </div>

        <span class="text-sm text-gray-500">
          Total: {{ pagination.total?.toLocaleString() || 0 }} records
        </span>
      </div>

      <!-- Details Modal -->
      <div v-if="selectedLog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="selectedLog = null">
        <div class="w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Log Details</h3>
            <button @click="selectedLog = null" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="space-y-2 text-sm">
            <div><strong>ID:</strong> {{ selectedLog.id }}</div>
            <div><strong>Event:</strong> {{ selectedLog.eventType }}</div>
            <div><strong>Time:</strong> {{ formatDate(selectedLog.createdAt) }}</div>
            <div><strong>User:</strong> {{ selectedLog.userEmail || selectedLog.userId || '-' }}</div>
            <div><strong>Role:</strong> {{ selectedLog.userRole || '-' }}</div>
            <div><strong>IP:</strong> {{ selectedLog.ipAddress }}</div>
            <div><strong>User Agent:</strong> {{ selectedLog.userAgent || '-' }}</div>
            <div><strong>Session:</strong> {{ selectedLog.sessionId || '-' }}</div>
            <div v-if="selectedLog.errorMessage"><strong>Error:</strong> <span class="text-red-500">{{ selectedLog.errorMessage }}</span></div>
            <div><strong>Hash:</strong> <span class="font-mono text-xs text-gray-500">{{ selectedLog.currentHash }}</span></div>
          </div>
          <div v-if="selectedLog.details" class="mt-4">
            <strong class="text-sm">Details (JSON):</strong>
            <pre class="p-3 mt-1 overflow-auto text-xs bg-gray-100 rounded-lg max-h-60">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuditLog } from '~/composables/useAuditLog'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ middleware: 'auth' })

const { fetchLogs, fetchStats, verifyChain } = useAuditLog()
const { pagination, totalPages, pageButtons, setPagination, changePage: paginationChange } = usePagination(25)

const logs = ref([])
const stats = ref(null)
const loading = ref(false)
const selectedLog = ref(null)
const showNationalId = ref(false)

// Integrity state
const integrityLoading = ref(false)
const integrityResult = ref(null)

const integrityIcon = computed(() => {
  if (!integrityResult.value) return '🔍'
  return integrityResult.value.valid ? '✅' : '❌'
})
const integrityLabel = computed(() => {
  if (!integrityResult.value) return 'Check Integrity'
  return integrityResult.value.valid
    ? `Chain Intact (${integrityResult.value.totalChecked} checked)`
    : `Chain BROKEN at ${integrityResult.value.corruptAt}`
})
const integrityBadgeClass = computed(() => {
  if (!integrityResult.value) return 'border-gray-300 text-gray-600 hover:bg-gray-50'
  return integrityResult.value.valid
    ? 'border-green-400 text-green-700 bg-green-50'
    : 'border-red-400 text-red-700 bg-red-50'
})

// Filters
const filters = reactive({
  startDate: '',
  endDate: '',
  userId: '',
  ipAddress: '',
  eventTypes: [],
  accessResult: '',
  pageSize: 25,
})

const eventTypeOptions = [
  'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
  'PAGE_ACCESS', 'API_ACCESS',
  'DATA_CREATE', 'DATA_READ', 'DATA_UPDATE', 'DATA_DELETE',
  'FILE_ACCESS', 'FILE_UPLOAD', 'FILE_DOWNLOAD',
  'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'ACCOUNT_DEACTIVATED',
  'ADMIN_ACTION', 'ADMIN_LOG_VIEWED', 'ADMIN_LOG_EXPORTED',
  'DRIVER_VERIFICATION', 'BOOKING_ACTION', 'ROUTE_ACTION',
  'SYSTEM_EVENT',
]

// Helpers
function formatEventType(et) {
  return et.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/ /g, ' ')
    .split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function eventTypeBadge(et) {
  if (et.includes('LOGIN_SUCCESS')) return 'bg-green-100 text-green-700'
  if (et.includes('LOGIN_FAILED')) return 'bg-red-100 text-red-700'
  if (et.includes('DENIED') || et.includes('ERROR')) return 'bg-red-100 text-red-700'
  if (et.includes('ADMIN')) return 'bg-purple-100 text-purple-700'
  if (et.includes('DELETE') || et.includes('DEACTIVATED')) return 'bg-red-100 text-red-700'
  if (et.includes('CREATE') || et.includes('UPLOAD')) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function resultBadge(result) {
  switch (result) {
    case 'SUCCESS': return 'bg-green-100 text-green-700'
    case 'DENIED': return 'bg-orange-100 text-orange-700'
    case 'ERROR': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function methodBadge(method) {
  switch (method) {
    case 'GET': return 'bg-blue-50 text-blue-600'
    case 'POST': return 'bg-green-50 text-green-600'
    case 'PUT': case 'PATCH': return 'bg-yellow-50 text-yellow-700'
    case 'DELETE': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-50 text-gray-600'
  }
}

function getResultCount(result) {
  if (!stats.value?.byAccessResult) return 0
  const found = stats.value.byAccessResult.find(s => s.accessResult === result)
  return found ? found.count.toLocaleString() : '0'
}

function showDetails(log) {
  selectedLog.value = log
}

// Data fetching
async function loadLogs(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      pageSize: filters.pageSize,
    }
    if (filters.startDate) params.startDate = new Date(filters.startDate).toISOString()
    if (filters.endDate) params.endDate = new Date(filters.endDate).toISOString()
    if (filters.userId) params.userId = filters.userId
    if (filters.ipAddress) params.ipAddress = filters.ipAddress
    if (filters.eventTypes.length > 0) params.eventTypes = filters.eventTypes
    if (filters.accessResult) params.accessResult = filters.accessResult

    const result = await fetchLogs(params)
    logs.value = result.data || []
    setPagination(result.pagination, page, logs.value.length)
  } catch (err) {
    console.error('Failed to load logs:', err)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const result = await fetchStats()
    stats.value = result.data || null
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

async function checkIntegrity() {
  integrityLoading.value = true
  try {
    const result = await verifyChain()
    integrityResult.value = result.data
  } catch (err) {
    console.error('Integrity check failed:', err)
    integrityResult.value = { valid: false, error: err.message }
  } finally {
    integrityLoading.value = false
  }
}

function applyFilters() {
  loadLogs(1)
}

function resetFilters() {
  filters.startDate = ''
  filters.endDate = ''
  filters.userId = ''
  filters.ipAddress = ''
  filters.eventTypes = []
  filters.accessResult = ''
  filters.pageSize = 25
  loadLogs(1)
}

function changePage(newPage) {
  paginationChange(newPage, loadLogs)
}

onMounted(() => {
  loadLogs(1)
  loadStats()
  checkIntegrity()
})
</script>
