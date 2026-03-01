/**
 * Composable for audit log API operations.
 * Used by admin log dashboard and export pages.
 */
export function useAuditLog() {
    const { $api } = useNuxtApp()

    const helperFetch = async (endpoint, options = {}) => {
        const config = useRuntimeConfig()
        const token = useCookie('token').value
        return $fetch(endpoint, {
            baseURL: config.public.apiBase || 'http://localhost:3000/api',
            ...options,
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {})
            }
        })
    }

    /**
     * Fetch paginated audit logs with filters.
     */
    const fetchLogs = async (params = {}) => {
        const query = new URLSearchParams()

        if (params.startDate) query.set('startDate', params.startDate)
        if (params.endDate) query.set('endDate', params.endDate)
        if (params.userId) query.set('userId', params.userId)
        if (params.ipAddress) query.set('ipAddress', params.ipAddress)
        if (params.eventTypes && params.eventTypes.length > 0) {
            query.set('eventTypes', params.eventTypes.join(','))
        }
        if (params.accessResult) query.set('accessResult', params.accessResult)
        if (params.page) query.set('page', String(params.page))
        if (params.pageSize) query.set('pageSize', String(params.pageSize))

        const qs = query.toString()
        return helperFetch(`/logs${qs ? '?' + qs : ''}`)
    }

    /**
     * Fetch log statistics for dashboard charts.
     */
    const fetchStats = async () => {
        return helperFetch('/logs/stats')
    }

    /**
     * Verify hash chain integrity.
     */
    const verifyChain = async (limit = 500) => {
        return helperFetch(`/logs/verify?limit=${limit}`)
    }

    /**
     * Quick export logs (immediate download).
     */
    const quickExport = async (params = {}) => {
        const query = new URLSearchParams()

        if (params.startDate) query.set('startDate', params.startDate)
        if (params.endDate) query.set('endDate', params.endDate)
        if (params.userId) query.set('userId', params.userId)
        if (params.ipAddress) query.set('ipAddress', params.ipAddress)
        if (params.eventTypes && params.eventTypes.length > 0) {
            query.set('eventTypes', params.eventTypes.join(','))
        }
        if (params.accessResult) query.set('accessResult', params.accessResult)
        if (params.includeNationalId) query.set('includeNationalId', 'true')
        query.set('format', params.format || 'csv')

        const qs = query.toString()

        // Use fetch directly for file download
        const token = useCookie('token').value
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBase || 'http://localhost:3000/api'

        const response = await fetch(`${baseURL}/logs/export?${qs}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) throw new Error('Export failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const ext = params.format === 'json' ? 'json' : 'csv'
        a.download = `audit-log-export-${new Date().toISOString().split('T')[0]}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    /**
     * Create an export request with SLA deadline.
     */
    const createExportRequest = async (data) => {
        return helperFetch('/logs/export-requests', {
            method: 'POST',
            body: data,
        })
    }

    /**
     * Fetch all export requests.
     */
    const fetchExportRequests = async () => {
        return helperFetch('/logs/export-requests')
    }

    /**
     * Get a specific export request.
     */
    const getExportRequest = async (id) => {
        return helperFetch(`/logs/export-requests/${id}`)
    }

    /**
     * Download file for a completed export request.
     */
    const downloadExportRequest = async (id, format = 'csv') => {
        const token = useCookie('token').value
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBase || 'http://localhost:3000/api'

        const response = await fetch(`${baseURL}/logs/export-requests/${id}/download`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const ext = format === 'json' ? 'json' : 'csv'
        a.download = `export-request-${id}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    return {
        fetchLogs,
        fetchStats,
        verifyChain,
        quickExport,
        createExportRequest,
        fetchExportRequests,
        getExportRequest,
        downloadExportRequest,
    }
}
