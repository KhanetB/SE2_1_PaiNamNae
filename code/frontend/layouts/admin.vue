<template>
    <div>
        <AdminHeader />
        <AdminSidebar />
        <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
            <slot />
        </main>
        <!-- Mobile Overlay -->
        <div id="overlay" class="fixed inset-0 z-40 hidden bg-black bg-opacity-50 lg:hidden"
            @click="closeMobileSidebar"></div>
    </div>
</template>

<script setup>
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import { useAdminSidebar } from '~/composables/useAdminSidebar'

// Initialize sidebar toggle mechanics
const { closeMobileSidebar } = useAdminSidebar()
</script>

<style>
/* Global styles for admin layout */
.sidebar {
    transition: width 0.3s ease;
}
.sidebar.collapsed {
    width: 80px;
}
.sidebar:not(.collapsed) {
    width: 280px;
}
.sidebar-item {
    transition: all 0.3s ease;
}
.sidebar-item:hover {
    background-color: rgba(59, 130, 246, 0.05);
}
.sidebar.collapsed .sidebar-text {
    display: none;
}
.sidebar.collapsed .sidebar-item {
    justify-content: center;
}
.main-content {
    transition: margin-left 0.3s ease;
}
@media (max-width: 1024px) {
    .sidebar {
        position: fixed;
        z-index: 1000;
        transform: translateX(-100%);
    }
    .sidebar.mobile-open {
        transform: translateX(0);
    }
    .main-content {
        margin-left: 0 !important;
    }
}
</style>
