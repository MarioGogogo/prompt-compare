<script setup>
import { cases, deviceBadge } from '../data/cases.js'

const badgeTones = {
    slate: 'bg-slate-100 border-slate-200 text-slate-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
}
</script>

<template>
    <div class="flex flex-col w-full">
        <div class="relative w-full max-w-[1440px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
            <!-- Library Header -->
            <div class="flex flex-col gap-space-xs max-w-3xl">
                <div class="flex items-center gap-space-sm">
                    <span
                        class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-label-sm text-label-sm tracking-wider uppercase flex items-center gap-1.5 font-medium">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                        Prompt Impact Visualizer v2.4
                    </span>
                    <span class="text-slate-300 font-label-sm text-label-sm">/</span>
                    <span class="text-slate-500 font-label-sm text-label-sm font-medium tracking-wide">案例库
                        LIBRARY</span>
                </div>
                <h1 class="font-headline-xl text-headline-xl font-bold tracking-tight text-slate-900 mt-1">
                    提示词案例库
                </h1>
                <p class="font-body-lg text-body-lg text-slate-600 mt-1">
                    每条提示词一个可交互的动画对比演示，选择一个案例，直观看它带来的体验跃升。
                </p>
            </div>
            <!-- Case Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
                <router-link v-for="c in cases" :key="c.id" :to="{ name: 'case', params: { id: c.id } }"
                    class="group p-space-lg rounded-2xl bg-white border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-space-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all cursor-pointer">
                    <div class="flex items-center justify-between">
                        <span
                            class="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-label-sm text-label-sm font-bold tracking-wider">PROMPT
                            {{ c.index }}</span>
                        <span class="flex items-center gap-1 px-2 py-0.5 rounded-full border font-label-sm text-label-sm font-medium"
                            :class="badgeTones[deviceBadge(c.devices).tone]">
                            <span class="material-symbols-outlined text-[13px]">{{ deviceBadge(c.devices).icon
                                }}</span>
                            {{ deviceBadge(c.devices).text }}
                        </span>
                    </div>
                    <h2 class="font-headline-md text-headline-md font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {{ c.title }}
                        <span class="ml-1.5 font-label-md text-label-md text-slate-400 font-semibold tracking-widest align-middle">{{
                            c.codename }}</span>
                    </h2>
                    <p class="font-body-sm text-body-sm text-slate-600 leading-relaxed line-clamp-3">
                        {{ c.promptText }}
                    </p>
                    <div class="flex flex-wrap items-center gap-space-xs mt-auto pt-space-sm border-t border-slate-100">
                        <span v-for="tag in c.tags" :key="tag"
                            class="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 font-label-sm text-label-sm">{{
                            tag }}</span>
                    </div>
                    <div
                        class="flex items-center gap-1 text-indigo-600 font-label-md text-label-md font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        查看演示 <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                </router-link>
                <!-- Placeholder card for future cases -->
                <div
                    class="p-space-lg rounded-2xl border-2 border-dashed border-slate-200 flex flex-col gap-space-sm items-start justify-center text-slate-400">
                    <span class="material-symbols-outlined text-[28px]">add_circle</span>
                    <span class="font-body-sm text-body-sm font-medium">下一个案例占位</span>
                    <span class="font-label-sm text-label-sm">在 src/cases/ 新增文件夹并注册即可</span>
                </div>
            </div>
        </div>
    </div>
</template>
