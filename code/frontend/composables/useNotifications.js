import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig, useCookie, useNuxtApp } from '#app'
import { timeAgo } from '~/utils/date'

/**
 * useNotifications — จัดการ notification bell ใน navbar
 *
 * ดึงข้อมูล notification อัตโนมัติตอน mount (ถ้า token มีอยู่)
 * และ expose state + actions ให้ component ใช้งาน
 */
export function useNotifications() {
    const { $api } = useNuxtApp()
    const token = useCookie('token')

    const openNotif = ref(false)
    const openMenuId = ref(null)
    const loading = ref(false)
    const notifications = ref([]) // [{ id, title, body, createdAt, readAt }]

    const unreadCount = computed(
        () => notifications.value.filter((n) => !n.readAt).length
    )

    function toggleNotif() {
        openNotif.value = !openNotif.value
        if (!openNotif.value) openMenuId.value = null
    }

    async function onBellClick() {
        toggleNotif()
        if (openNotif.value && notifications.value.length === 0) {
            await fetchNotifications()
        }
    }

    async function fetchNotifications() {
        if (!token.value) return
        loading.value = true
        try {
            const res = await $api('/notifications', {
                query: { page: 1, limit: 20 }
            })
            // plugin unwraps .data อัตโนมัติ — แต่ notifications ส่งกลับที่ root
            const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
            notifications.value = raw.map((it) => ({
                id: it.id,
                title: it.title || '-',
                body: it.body || '',
                createdAt: it.createdAt || Date.now(),
                readAt: it.readAt || null
            }))
        } catch (e) {
            console.error('fetchNotifications:', e)
            notifications.value = []
        } finally {
            loading.value = false
        }
    }

    function toggleItemMenu(id) {
        openMenuId.value = openMenuId.value === id ? null : id
    }

    async function markAsRead(n) {
        try {
            await $api(`/notifications/${n.id}/read`, { method: 'PATCH' })
            const i = notifications.value.findIndex((x) => x.id === n.id)
            if (i > -1) notifications.value[i].readAt = new Date().toISOString()
        } finally {
            openMenuId.value = null
        }
    }

    async function removeNotification(n) {
        try {
            await $api(`/notifications/${n.id}`, { method: 'DELETE' })
            notifications.value = notifications.value.filter((x) => x.id !== n.id)
        } finally {
            openMenuId.value = null
        }
    }

    onMounted(() => {
        if (token.value) fetchNotifications()
    })

    return {
        openNotif,
        openMenuId,
        loading,
        notifications,
        unreadCount,
        toggleNotif,
        onBellClick,
        fetchNotifications,
        toggleItemMenu,
        markAsRead,
        removeNotification,
        timeAgo
    }
}
