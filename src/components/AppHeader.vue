<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCase } from '../data/cases.js'

const route = useRoute()
const currentCase = computed(() =>
    route.name === 'case' ? getCase(route.params.id) : null
)
</script>

<template>
    <header
        class="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div class="h-16 max-w-[1440px] mx-auto px-gutter flex items-center justify-between gap-space-md">
            <div class="flex items-center gap-space-md">
                <router-link :to="{ name: 'case', params: { id: 'shimmer' } }" class="flex items-center gap-space-sm cursor-pointer">
                    <div
                        class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                        <span class="material-symbols-outlined text-[20px]">auto_awesome</span></div>
                    <div class="flex flex-col"><span
                            class="font-headline-sm text-headline-sm font-bold tracking-tight text-slate-900">PromptCraft</span><span
                            class="font-label-sm text-label-sm text-slate-500 tracking-wider uppercase -mt-0.5">Studio
                            Sandbox</span></div>
                </router-link>
                <!-- Current Case Chip -->
                <span v-if="currentCase"
                    class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-label-sm text-label-sm font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    PROMPT {{ currentCase.index }} · {{ currentCase.title }} {{ currentCase.codename }}
                </span>
            </div>
            <nav class="hidden lg:flex items-center gap-space-xs p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl">
                <router-link :to="{ name: 'case', params: { id: 'shimmer' } }"
                    class="px-space-md py-1.5 rounded-lg font-body-sm text-body-sm transition-all"
                    :class="route.name === 'case'
                        ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'">
                    工作台
                </router-link>
                <router-link :to="{ name: 'library' }"
                    class="px-space-md py-1.5 rounded-lg font-body-sm text-body-sm transition-all"
                    :class="route.name === 'library'
                        ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'">
                    案例库
                </router-link>
            </nav>
            <div class="flex items-center gap-space-md">
                <div
                    class="hidden sm:flex items-center gap-space-xs px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span
                        class="font-label-sm text-label-sm font-medium text-slate-700">v2.4 Engine</span></div>
            </div>
        </div>
    </header>
</template>
