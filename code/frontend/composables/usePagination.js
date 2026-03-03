import { reactive, computed } from 'vue'

/**
 * usePagination — จัดการ pagination state + pageButtons
 * @param {number} defaultLimit
 * @returns {{ pagination, totalPages, pageButtons, changePage, applyPage }}
 */
export function usePagination(defaultLimit = 20) {
    const pagination = reactive({
        page: 1,
        limit: defaultLimit,
        total: 0,
        totalPages: 1
    })

    const totalPages = computed(() =>
        Math.max(1, pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || defaultLimit)))
    )

    const pageButtons = computed(() => {
        const total = totalPages.value
        const current = pagination.page
        if (!total || total < 1) return []
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
        const set = new Set([1, total, current])
        if (current - 1 > 1) set.add(current - 1)
        if (current + 1 < total) set.add(current + 1)
        const pages = Array.from(set).sort((a, b) => a - b)
        const out = []
        for (let i = 0; i < pages.length; i++) {
            if (i > 0 && pages[i] - pages[i - 1] > 1) out.push('…')
            out.push(pages[i])
        }
        return out
    })

    /**
     * อัปเดต pagination จาก API response
     * @param {{ page?, limit?, total?, totalPages? }} paginationData
     * @param {number} requestedPage
     * @param {number} listLength
     */
    function setPagination(paginationData = {}, requestedPage = 1, listLength = 0) {
        pagination.page = Number(paginationData.page ?? requestedPage)
        pagination.limit = Number(paginationData.limit ?? pagination.limit)
        pagination.total = Number(paginationData.total ?? listLength)
        pagination.totalPages = Number(paginationData.totalPages ?? Math.ceil(pagination.total / pagination.limit))
    }

    function changePage(next, fetchFn) {
        if (next < 1 || next > totalPages.value) return
        fetchFn(next)
    }

    return { pagination, totalPages, pageButtons, setPagination, changePage }
}
