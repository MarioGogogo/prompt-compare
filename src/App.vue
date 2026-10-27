<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
    <AppHeader />
    <main class="w-full pt-16 bg-slate-50 min-h-screen">
        <router-view />
    </main>
    <AppFooter />
</template>
