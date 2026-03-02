import { onMounted, onUnmounted } from 'vue'

/**
 * useAdminSidebar — จัดการ Admin sidebar toggle, mobile sidebar, submenu และ resize
 *
 * ใช้ใน onMounted/onUnmounted อัตโนมัติ:
 *   const { } = useAdminSidebar()
 */
export function useAdminSidebar() {
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar')
        const mainContent = document.getElementById('main-content')
        const toggleIcon = document.getElementById('toggle-icon')
        if (!sidebar || !mainContent || !toggleIcon) return

        sidebar.classList.toggle('collapsed')
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '80px'
            toggleIcon.classList.replace('fa-chevron-left', 'fa-chevron-right')
        } else {
            mainContent.style.marginLeft = '280px'
            toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left')
        }
    }

    function toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar')
        const overlay = document.getElementById('overlay')
        if (!sidebar || !overlay) return
        sidebar.classList.toggle('mobile-open')
        overlay.classList.toggle('hidden')
    }

    function closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar')
        const overlay = document.getElementById('overlay')
        if (!sidebar || !overlay) return
        sidebar.classList.remove('mobile-open')
        overlay.classList.add('hidden')
    }

    function toggleSubmenu(menuId) {
        const menu = document.getElementById(menuId)
        const icon = document.getElementById(menuId + '-icon')
        if (!menu || !icon) return
        menu.classList.toggle('hidden')
        if (menu.classList.contains('hidden')) {
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down')
        } else {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up')
        }
    }

    function handleResize() {
        const sidebar = document.getElementById('sidebar')
        const mainContent = document.getElementById('main-content')
        const overlay = document.getElementById('overlay')
        if (!sidebar || !mainContent || !overlay) return

        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('mobile-open')
            overlay.classList.add('hidden')
            mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '80px' : '280px'
        } else {
            mainContent.style.marginLeft = '0'
        }
    }

    onMounted(() => {
        // expose ให้ AdminHeader/AdminSidebar HTML onclick ใช้ได้
        window.toggleSidebar = toggleSidebar
        window.toggleMobileSidebar = toggleMobileSidebar
        window.closeMobileSidebar = closeMobileSidebar
        window.toggleSubmenu = toggleSubmenu

        window.addEventListener('resize', handleResize)
        handleResize()
    })

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
        delete window.toggleSidebar
        delete window.toggleMobileSidebar
        delete window.closeMobileSidebar
        delete window.toggleSubmenu
    })

    return { toggleSidebar, toggleMobileSidebar, closeMobileSidebar, toggleSubmenu }
}
