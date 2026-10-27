<script setup>
import { computed, ref } from 'vue'
import { useDeviceView } from '../composables/useDeviceView.js'

const props = defineProps({
    caseMeta: {
        type: Object,
        required: true,
    },
})

const { deviceView, setDeviceView, normalizeDevice } = useDeviceView()

const copied = ref(false)
let copyTimer = null

const promptPlain = computed(() =>
    props.caseMeta.promptSegments.map(s => s.t).join('')
)

const metricTones = {
    indigo: { chip: 'bg-indigo-50 border-indigo-100 text-indigo-600', text: 'text-indigo-700' },
    emerald: { chip: 'bg-emerald-50 border-emerald-100 text-emerald-600', text: 'text-emerald-700' },
    amber: { chip: 'bg-amber-50 border-amber-100 text-amber-600', text: 'text-amber-700' },
}

function metricTone(tone) {
    return metricTones[tone] || metricTones.indigo
}

function copyPromptText() {
    navigator.clipboard.writeText(props.caseMeta.promptText).then(() => {
        copied.value = true
        clearTimeout(copyTimer)
        copyTimer = setTimeout(() => {
            copied.value = false
        }, 2200)
    }).catch(err => {
        console.error('Failed to copy text: ', err)
    })
}

function selectDevice(type) {
    if (props.caseMeta.devices.includes(type)) {
        setDeviceView(type)
    }
}

function deviceUnsupported(type) {
    return !props.caseMeta.devices.includes(type)
}

function deviceHint(type) {
    return deviceUnsupported(type)
        ? (type === 'tablet' ? '该提示词仅支持手机展示' : '该提示词仅支持平板展示')
        : ''
}

// 当前实际生效的设备视图（含回落）
const activeView = computed(() => normalizeDevice(props.caseMeta))
</script>

<template>
    <div class="flex flex-col gap-space-lg">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div class="flex flex-col gap-space-xs max-w-3xl">
                <div class="flex items-center gap-space-sm">
                    <span
                        class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-label-sm text-label-sm tracking-wider uppercase flex items-center gap-1.5 font-medium">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                        Prompt Impact Visualizer v2.4
                    </span>
                    <span class="text-slate-300 font-label-sm text-label-sm">/</span>
                    <router-link :to="{ name: 'library' }"
                        class="text-slate-500 font-label-sm text-label-sm font-medium tracking-wide hover:text-indigo-600 transition-colors">案例库
                        LIBRARY</router-link>
                </div>
                <h1 class="font-headline-xl text-headline-xl font-bold tracking-tight text-slate-900 mt-1">
                    提示词价值直观对比工作台
                </h1>
                <p class="font-body-lg text-body-lg text-slate-600 mt-1">
                    切换不同提示词案例，直观感受同一条指令为 UI 动画体验带来的质感跃升。
                </p>
            </div>
            <!-- Segmented Device Switcher -->
            <div
                class="flex items-center p-1 bg-slate-200/70 border border-slate-200 rounded-xl self-start lg:self-auto shadow-inner">
                <button :disabled="deviceUnsupported('mobile')" :title="deviceHint('mobile')"
                    :class="activeView === 'mobile'
                        ? 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-white text-indigo-600 shadow-sm transition-all duration-200 cursor-pointer font-semibold'
                        : (deviceUnsupported('mobile')
                            ? 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-slate-300 cursor-not-allowed font-medium'
                            : 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer font-medium')"
                    @click="selectDevice('mobile')">
                    <span class="material-symbols-outlined text-[18px]">smartphone</span>
                    <span class="font-label-md text-label-md">手机模型 (Mobile)</span>
                </button>
                <button :disabled="deviceUnsupported('tablet')" :title="deviceHint('tablet')"
                    :class="activeView === 'tablet'
                        ? 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-white text-indigo-600 shadow-sm transition-all duration-200 cursor-pointer font-semibold'
                        : (deviceUnsupported('tablet')
                            ? 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-slate-300 cursor-not-allowed font-medium'
                            : 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer font-medium')"
                    @click="selectDevice('tablet')">
                    <span class="material-symbols-outlined text-[18px]">tablet_mac</span>
                    <span class="font-label-md text-label-md font-medium">平板模型 (Tablet)</span>
                </button>
            </div>
        </div>
        <!-- Prompt Console Card (Hero Command Area) -->
        <div
            class="w-full bg-white rounded-2xl p-space-lg flex flex-col gap-space-md shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-200/80 relative overflow-hidden">
            <div class="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-indigo-50/80 blur-3xl pointer-events-none">
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm z-10">
                <div class="flex flex-wrap items-center gap-space-xs">
                    <span
                        class="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-label-sm text-label-sm font-semibold">PROMPT
                        {{ caseMeta.index }} · {{ caseMeta.title }} {{ caseMeta.codename }}</span>
                    <span v-for="tag in caseMeta.tags" :key="tag"
                        class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-label-sm text-label-sm font-medium">{{
                        tag }}</span>
                </div>
                <div class="flex items-center gap-space-sm">
                    <button
                        :class="copied
                            ? 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-emerald-600 text-white font-label-md text-label-md transition-all shadow-sm shadow-indigo-600/20 active:scale-95 cursor-pointer font-medium'
                            : 'flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-label-md text-label-md transition-all shadow-sm shadow-indigo-600/20 active:scale-95 cursor-pointer font-medium'"
                        @click="copyPromptText">
                        <span class="material-symbols-outlined text-[16px]">{{ copied ? 'check' : 'content_copy'
                            }}</span>
                        <span>{{ copied ? '已复制到剪贴板!' : '复制提示词' }}</span>
                    </button>
                </div>
            </div>
            <!-- Prompt Field (关键词高亮) -->
            <div
                class="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-space-md text-[14px] leading-[1.9] text-slate-800 z-10">
                <template v-for="(seg, i) in caseMeta.promptSegments" :key="i"><span
                        :class="seg.hl ? 'text-indigo-600 font-semibold' : ''"
                        :style="seg.mono ? 'font-family: JetBrains Mono, monospace' : ''">{{ seg.t }}</span></template>
            </div>
            <!-- Real-time Quality Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs z-10">
                <div v-for="m in caseMeta.metrics" :key="m.label"
                    class="flex items-center gap-space-sm p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div class="w-10 h-10 rounded-lg border flex items-center justify-center"
                        :class="metricTone(m.tone).chip">
                        <span class="material-symbols-outlined text-[20px]">{{ m.icon }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-label-sm text-label-sm text-slate-500 font-medium">{{ m.label }}</span>
                        <span class="font-headline-sm text-headline-sm font-bold" :class="metricTone(m.tone).text">{{
                            m.value }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
