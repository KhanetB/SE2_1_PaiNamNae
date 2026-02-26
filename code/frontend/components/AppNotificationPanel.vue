<template>
    <!-- Bell Button -->
    <div class="relative">
        <button ref="bellBtn" class="relative text-gray-600 hover:text-blue-600" @click="onBellClick"
            aria-haspopup="true" :aria-expanded="openNotif ? 'true' : 'false'">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.918 18 13V9a6 6 0 10-12 0v4c0 .918-.21 1.79-.595 2.595L4 17h5m6 0a3 3 0 11-6 0h6z" />
            </svg>
            <span v-if="unreadCount > 0"
                class="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1"></span>
        </button>

        <transition enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in" leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0">
            <div v-if="openNotif" ref="notifPanel"
                class="absolute top-full right-0 mt-3 w-[360px] max-w-[90vw] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top"
                @click.stop>

                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800">Notification</h3>
                    <button class="p-1 text-gray-500 hover:text-gray-700" @click="openNotif = false">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- List -->
                <div class="max-h-[56vh] overflow-y-auto">
                    <div v-if="notifications.length === 0 && !loading"
                        class="px-4 py-8 text-sm text-center text-gray-500">
                        ไม่มีการแจ้งเตือน
                    </div>
                    <div v-if="loading" class="px-4 py-4 text-sm text-gray-500">
                        กำลังโหลด…
                    </div>

                    <div v-for="(n, idx) in notifications" :key="n.id || idx" class="relative">
                        <div class="px-4 py-3 hover:bg-gray-50">
                            <div class="flex items-start gap-3">
                                <!-- สถานะจุด -->
                                <span class="inline-block w-2 h-2 mt-1 rounded-full"
                                    :class="n.readAt ? 'bg-gray-300' : 'bg-emerald-500'"></span>

                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ n.title }}</p>
                                    <p class="text-sm text-gray-600 line-clamp-2">{{ n.body }}</p>
                                    <p class="mt-1 text-xs text-gray-400">{{ timeAgo(n.createdAt) }}</p>
                                </div>

                                <!-- เมนูสามจุด -->
                                <div class="relative shrink-0">
                                    <button
                                        class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                        @click.stop="toggleItemMenu(n.id)" aria-haspopup="true"
                                        :aria-expanded="openMenuId === n.id ? 'true' : 'false'">
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </button>

                                    <div v-if="openMenuId === n.id"
                                        class="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[70]"
                                        @click.stop>
                                        <button
                                            class="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                            @click="markAsRead(n)">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor">
                                                <circle cx="12" cy="12" r="9" stroke-width="2" />
                                                <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round" />
                                            </svg>
                                            ทำเครื่องหมายอ่านแล้ว
                                        </button>
                                        <button
                                            class="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            @click="removeNotification(n)">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor">
                                                <path stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m3-3h8m-9 3h10M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                            </svg>
                                            ลบการแจ้งเตือนนี้
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mx-4 border-t border-gray-200" v-if="idx !== notifications.length - 1"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-4 py-3 bg-white border-t border-gray-200">
                    <NuxtLink to="/notifications"
                        class="block w-full px-4 py-2 text-sm font-medium text-center text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100"
                        @click="openNotif = false">
                        View All Notification
                    </NuxtLink>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '~/composables/useNotifications'

const {
    openNotif,
    openMenuId,
    loading,
    notifications,
    unreadCount,
    onBellClick,
    toggleItemMenu,
    markAsRead,
    removeNotification,
    timeAgo
} = useNotifications()

const bellBtn = ref(null)
const notifPanel = ref(null)

function onClickOutside(e) {
    if (!openNotif.value) return
    const t = e.target
    if (notifPanel.value?.contains(t) || bellBtn.value?.contains(t)) return
    openNotif.value = false
    openMenuId.value = null
}

function onKey(e) {
    if (e.key === 'Escape') {
        openNotif.value = false
        openMenuId.value = null
    }
}

onMounted(() => {
    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
