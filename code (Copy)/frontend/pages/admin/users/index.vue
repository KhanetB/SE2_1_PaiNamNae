<template>
    <div class="">
        <!-- Page Title -->
        <div class="mx-auto max-w-8xl">
                <!-- Title + Controls -->
                <div class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <!-- Left: Title + Create Button -->
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-semibold text-gray-800">User Management</h1>
                        <button @click="onCreateUser"
                            class="inline-flex items-center gap-2 px-3 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                            <i class="fa-solid fa-plus"></i>
                            <span class="hidden sm:inline">สร้างผู้ใช้ใหม่</span>
                        </button>
                    </div>

                    <!-- Right: Quick Search -->
                    <div class="flex items-center gap-2">
                        <input v-model.trim="filters.q" @keyup.enter="applyFilters" type="text"
                            placeholder="ค้นหา : Email / User / Name"
                            class="max-w-full px-3 py-2 border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="applyFilters"
                            class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                            ค้นหา
                        </button>
                    </div>
                </div>

                <!-- Advanced Filters -->
                <div class="mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="grid grid-cols-1 gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[repeat(24,minmax(0,1fr))]">

                        <!-- Start (3/24) -->
                        <div class="lg:col-span-3">
                            <label class="block mb-1 text-xs font-medium text-gray-600">จุดเริ่มต้น</label>
                            <input v-model="filters.startName" type="text"
                                placeholder="ชื่อสถานที่เริ่มต้น (ใช้ key: name)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- End (3/24) -->
                        <div class="lg:col-span-3">
                            <label class="block mb-1 text-xs font-medium text-gray-600">ปลายทาง</label>
                            <input v-model="filters.endName" type="text" placeholder="ชื่อปลายทาง (ใช้ key: name)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- status (3/24) -->
                        <div class="lg:col-span-3">
                            <label class="block mb-1 text-xs font-medium text-gray-600">สถานะ</label>
                            <select v-model="filters.status"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">ทั้งหมด</option>
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="FULL">FULL</option>
                            </select>
                        </div>

                        <!-- Departure From (4/24) -->
                        <div class="lg:col-span-4">
                            <label class="block mb-1 text-xs font-medium text-gray-600">ออกเดินทางตั้งแต่
                                (YYYY-MM-DD)</label>
                            <input v-model="filters.departureFrom" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- Departure To (4/24) -->
                        <div class="lg:col-span-4">
                            <label class="block mb-1 text-xs font-medium text-gray-600">ถึงวันที่</label>
                            <input v-model="filters.departureTo" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- Sort (รวม sortBy + sortOrder) (3/24) -->
                        <div class="lg:col-span-3">
                            <label class="block mb-1 text-xs font-medium text-gray-600">เรียงตาม</label>
                            <select v-model="filters.sort"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">(ค่าเริ่มต้น)</option>
                                <option value="departureTime:desc">departureTime desc</option>
                                <option value="departureTime:asc">departureTime asc</option>
                                <option value="createdAt:desc">createdAt desc</option>
                                <option value="createdAt:asc">createdAt asc</option>
                                <option value="updatedAt:desc">updatedAt desc</option>
                                <option value="updatedAt:asc">updatedAt asc</option>
                            </select>
                        </div>

                        <!-- Actions (2/24) -->
                        <div class="flex items-end justify-end gap-2 mt-1 lg:col-span-4 lg:mt-0">
                            <button @click="clearFilters"
                                class="px-3 py-2 text-gray-700 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                ล้างตัวกรอง
                            </button>
                            <button @click="applyFilters"
                                class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                                ใช้ตัวกรอง
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Card -->
                <div class="bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:px-6">
                        <div class="text-sm text-gray-600">
                            หน้าที่ {{ pagination.page }} / {{ totalPages }} • ทั้งหมด {{ pagination.total }} ผู้ใช้
                        </div>
                    </div>

                    <!-- Loading / Error -->
                    <div v-if="isLoading" class="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                    <div v-else-if="loadError" class="p-8 text-center text-red-600">
                        {{ loadError }}
                    </div>

                    <!-- Table -->
                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ผู้ใช้
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">อีเมล
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                        ชื่อผู้ใช้</th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">บทบาท
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                        ยืนยันตัวตน</th>
                                    <!-- เปลี่ยนคอลัมน์สถานะเป็นสวิตช์ -->
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">สถานะ
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                        สร้างเมื่อ</th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">การกระทำ
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="u in users" :key="u.id" class="transition-opacity hover:bg-gray-50"
                                    :class="!u.isActive ? 'opacity-60' : ''">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <img :src="u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName || 'U')}&background=random&size=64`"
                                                class="object-cover rounded-full w-9 h-9" alt="avatar" />
                                            <div>
                                                <div class="font-medium text-gray-900">
                                                    {{ u.firstName }} {{ u.lastName }}
                                                </div>
                                                <div class="text-xs text-gray-500">
                                                    {{ u.gender || '-' }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-gray-700">{{ u.email }}</td>
                                    <td class="px-4 py-3 text-gray-700">{{ u.username }}</td>
                                    <td class="px-4 py-3">
                                        <span
                                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                            :class="roleBadge(u.role)">
                                            <i class="mr-1 fa-solid fa-shield-halved" v-if="u.role === 'ADMIN'"></i>
                                            {{ u.role }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                            :class="u.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                                            <i class="mr-1 fa-solid fa-circle-check" v-if="u.isVerified"></i>
                                            {{ u.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}
                                        </span>
                                    </td>

                                    <!-- สวิตช์เปิด/ปิดการใช้งาน -->
                                    <td class="px-4 py-3">
                                        <div class="flex items-center">
                                            <ToggleSwitch :model-value="u.isActive"
                                                :disabled="isLoading || togglingIds.has(u.id)"
                                                @update:model-value="onToggleActive(u, $event)" />
                                            <span class="ml-2 text-sm "
                                                :class="u.isActive ? 'text-green-700' : 'text-gray-500'">
                                                {{ u.isActive ? 'Active' : 'Inactive' }}
                                            </span>
                                        </div>
                                    </td>

                                    <td class="px-4 py-3 text-gray-700">
                                        <div class="text-sm">{{ formatDate(u.createdAt) }}</div>
                                        <div class="text-xs text-gray-500">อัปเดต {{ formatDate(u.updatedAt) }}</div>
                                    </td>

                                    <td class="px-4 py-3 ">
                                        <button @click="onViewUser(u)"
                                            class="p-2 text-gray-500 transition-colors cursor-pointer hover:text-emerald-600"
                                            title="ดูรายละเอียด" aria-label="ดูรายละเอียด">
                                            <i class="text-lg fa-regular fa-eye"></i>
                                        </button>
                                        <button @click="onEditUser(u)"
                                            class="p-2 text-gray-500 transition-colors cursor-pointer hover:text-blue-600"
                                            title="แก้ไข" aria-label="แก้ไข">
                                            <i class="text-lg fa-regular fa-pen-to-square"></i>
                                        </button>
                                        <button @click="askDelete(u)"
                                            class="p-2 text-gray-500 transition-colors cursor-pointer hover:text-red-600"
                                            title="ลบ" aria-label="ลบ">
                                            <i class="text-lg fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>

                                <tr v-if="!users.length">
                                    <td colspan="8" class="px-4 py-10 text-center text-gray-500">ไม่มีข้อมูลผู้ใช้</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div
                        class="flex flex-col gap-3 px-4 py-4 border-t border-gray-200 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-wrap items-center gap-3 text-sm">
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Limit:</span>
                                <select v-model.number="pagination.limit" @change="applyFilters"
                                    class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500">
                                    <option :value="10">10</option>
                                    <option :value="20">20</option>
                                    <option :value="50">50</option>
                                </select>
                            </div>
                        </div>

                        <nav class="flex items-center gap-1">
                            <button class="px-3 py-2 text-sm border rounded-md disabled:opacity-50"
                                :disabled="pagination.page <= 1 || isLoading" @click="changePage(pagination.page - 1)">
                                Previous
                            </button>

                            <template v-for="(p, idx) in pageButtons" :key="`p-${idx}-${p}`">
                                <span v-if="p === '…'" class="px-2 text-sm text-gray-500">…</span>
                                <button v-else class="px-3 py-2 text-sm border rounded-md"
                                    :class="p === pagination.page ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-gray-50'"
                                    :disabled="isLoading" @click="changePage(p)">
                                    {{ p }}
                                </button>
                            </template>

                            <button class="px-3 py-2 text-sm border rounded-md disabled:opacity-50"
                                :disabled="pagination.page >= totalPages || isLoading"
                                @click="changePage(pagination.page + 1)">
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

        <!-- Confirm Delete Modal -->
        <ConfirmModal :show="showDelete" :title="`ลบผู้ใช้${deletingUser?.email ? ' : ' + deletingUser.email : ''}`"
            message="การลบนี้เป็นการลบถาวร ข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?"
            confirmText="ลบถาวร" cancelText="ยกเลิก" variant="danger" @confirm="confirmDelete" @cancel="cancelDelete" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/composables/useToast'
import { formatDate } from '~/utils/date'

dayjs.locale('th')
dayjs.extend(buddhistEra)

definePageMeta({ layout: 'admin', middleware: ['admin-auth'] })

const { toast } = useToast()

const isLoading = ref(false)
const loadError = ref('')
const users = ref([])

// เก็บ id ที่กำลัง toggle อยู่ เพื่อ disable สวิตช์/กันคลิกซ้ำ
const togglingIds = ref(new Set())

import { usePagination } from '~/composables/usePagination'
const { pagination, totalPages, pageButtons, setPagination } = usePagination(20)

const filters = reactive({
    q: '',
    role: '',
    createdFrom: '',
    createdTo: '',
    sort: '',
    isVerified: '',
    isActive: ''
})

function roleBadge(role) {
    if (role === 'ADMIN') return 'bg-purple-100 text-purple-700'
    if (role === 'DRIVER') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
}

function parseSort(s) {
    const [by, order] = (s || '').split(':')
    if (!by || !['asc', 'desc'].includes(order)) return { sortBy: undefined, sortOrder: undefined }
    return { sortBy: by, sortOrder: order }
}

function asTriBool(v) {
    if (v === '' || v === undefined || v === null) return undefined
    if (v === true || v === 'true') return true
    if (v === false || v === 'false') return false
    return undefined
}


async function fetchUsers(page = 1) {
    isLoading.value = true
    loadError.value = ''
    try {
        const config = useRuntimeConfig()
        const token = useCookie('token').value || (process.client ? localStorage.getItem('token') : '')

        const { sortBy, sortOrder } = parseSort(filters.sort)

        const res = await $fetch('/users/admin', {
            baseURL: config.public.apiBase,
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            query: {
                page,
                limit: pagination.limit,
                q: filters.q || undefined,
                role: filters.role || undefined,
                createdFrom: filters.createdFrom || undefined,
                createdTo: filters.createdTo || undefined,
                sortBy,                      // ได้จาก parseSort()
                sortOrder,                   // ได้จาก parseSort()
                isVerified: asTriBool(filters.isVerified),
                isActive: asTriBool(filters.isActive),
            },
        })

        const list = res?.data || res?.items || []
        users.value = list
        setPagination(res?.pagination || {}, page, list.length)
    } catch (err) {
        console.error(err)
        loadError.value = err?.data?.message || 'ไม่สามารถโหลดข้อมูลได้'
        toast.error('เกิดข้อผิดพลาด', loadError.value)
        users.value = []
    } finally {
        isLoading.value = false
    }
}

function changePage(next) {
    if (next < 1 || next > totalPages.value) return
    fetchUsers(next)
}

function applyFilters() {
    pagination.page = 1
    fetchUsers(1)
}

function clearFilters() {
    filters.q = ''
    filters.role = ''
    filters.createdFrom = ''
    filters.createdTo = ''
    filters.sort = ''
    filters.isVerified = ''
    filters.isActive = ''
    pagination.page = 1
    fetchUsers(1)
}

function onEditUser(u) {
    navigateTo(`/admin/users/${u.id}/edit`).catch(() => { })
}

/* ---------- Toggle Active Status ---------- */
async function onToggleActive(user, nextActive) {
    const prev = user.isActive
    if (prev === nextActive) return

    // optimistic UI
    user.isActive = nextActive
    togglingIds.value.add(user.id)

    const config = useRuntimeConfig()
    const token = useCookie('token').value || (process.client ? localStorage.getItem('token') : '')

    try {
        const res = await fetch(`${config.public.apiBase}/users/admin/${user.id}/status`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ isActive: nextActive }),
            credentials: 'include',
        })

        let body
        try { body = await res.json() } catch {
            const text = await res.text()
            const err = new Error(text || 'Unexpected response from server')
            err.status = res.status
            throw err
        }

        if (!res.ok) {
            const err = new Error(body?.message || `Request failed with status ${res.status}`)
            err.status = res.status
            err.payload = body
            throw err
        }

        // success
        toast.success('อัปเดตสถานะแล้ว', nextActive ? 'เปิดใช้งานบัญชีสำเร็จ' : 'ปิดการใช้งานบัญชีสำเร็จ')
    } catch (err) {
        // rollback
        user.isActive = prev
        console.error(err)
        toast.error('อัปเดตสถานะไม่สำเร็จ', err?.message || 'เกิดข้อผิดพลาด')
    } finally {
        togglingIds.value.delete(user.id)
    }
}
/* ----------------------------------------- */

/* ---------- Delete with Confirm Modal ---------- */
const showDelete = ref(false)
const deletingUser = ref(null)

function askDelete(u) {
    deletingUser.value = u
    showDelete.value = true
}

function cancelDelete() {
    showDelete.value = false
    deletingUser.value = null
}

async function confirmDelete() {
    if (!deletingUser.value) return
    const user = deletingUser.value
    try {
        await deleteUser(user.id)
        toast.success('ลบผู้ใช้เรียบร้อย', `${user.email || user.username || user.id} ถูกลบถาวรแล้ว`)
        cancelDelete()
        fetchUsers(Math.min(pagination.page, totalPages.value))
    } catch (err) {
        console.error(err)
        const msg = err?.message || err?.data?.message || 'ลบไม่สำเร็จ'
        toast.error('ลบไม่สำเร็จ', msg)
    }
}

async function deleteUser(id) {
    const config = useRuntimeConfig()
    const token = useCookie('token').value || (process.client ? localStorage.getItem('token') : '')
    const res = await fetch(`${config.public.apiBase}/users/admin/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
    })

    let body
    try { body = await res.json() } catch {
        const text = await res.text()
        const err = new Error(text || 'Unexpected response from server')
        err.status = res.status
        throw err
    }

    if (!res.ok) {
        const err = new Error(body?.message || `Request failed with status ${res.status}`)
        err.status = res.status
        err.payload = body
        throw err
    }

    return body
}
/* --------------------------------------------- */

useHead({
    title: 'TailAdmin Dashboard',
    link: [{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }]
})

function onCreateUser() {
    navigateTo('/admin/users/create').catch(() => { })
}

function onViewUser(u) {
    navigateTo(`/admin/users/${u.id}`).catch(() => { })
}

onMounted(() => {
    fetchUsers(1)
})
</script>


