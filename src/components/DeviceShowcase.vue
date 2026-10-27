<script setup>
import { computed } from 'vue'

const props = defineProps({
    // 'baseline'（左·无提示词，银色边框）/ 'optimized'（右·加提示词，深色边框）
    variant: {
        type: String,
        default: 'baseline',
    },
    // 'mobile' | 'tablet'
    device: {
        type: String,
        default: 'mobile',
    },
    caseMeta: {
        type: Object,
        required: true,
    },
})

const isTablet = computed(() => props.device === 'tablet')
const isOptimized = computed(() => props.variant === 'optimized')

const demoComponent = computed(() => props.caseMeta.demo)
</script>

<template>
    <div :class="isTablet ? 'max-w-[540px]' : 'max-w-[420px]'"
        class="flex flex-col items-center w-full transition-all duration-300 stage-pod">
        <!-- Status Pill -->
        <div class="w-full mb-space-sm flex items-center justify-between px-space-xs">
            <div v-if="isOptimized"
                class="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-label-sm text-label-sm font-semibold">
                <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>{{ caseMeta.pills.optimized }}</span>
            </div>
            <div v-else
                class="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-label-sm text-label-sm font-medium">
                <span class="material-symbols-outlined text-[14px]">cancel</span>
                <span>{{ caseMeta.pills.baseline }}</span>
            </div>
            <span :class="isOptimized
                ? 'font-label-sm text-label-sm text-emerald-700 font-bold'
                : 'font-label-sm text-label-sm text-slate-400 font-medium'">
                {{ isOptimized ? 'Optimized V2' : 'Baseline V1' }}
            </span>
        </div>

        <!-- Phone / Tablet Hardware Frame -->
        <div :class="[
            isTablet ? 'w-[520px] h-[680px] rounded-[32px]' : 'w-[380px] h-[780px] rounded-[48px]',
            isOptimized
                ? 'bg-slate-900 border-slate-300 shadow-[0_20px_50px_rgba(79,70,229,0.15),0_4px_16px_rgba(0,0,0,0.06)]'
                : 'bg-slate-200 border-slate-300 shadow-xl shadow-slate-300/40',
        ]" class="border-4 p-2.5 relative transition-all duration-300 flex flex-col device-box">
            <!-- Hardware Edge Ring Inner Fill -->
            <div :class="isOptimized
                ? 'bg-black shadow-inner'
                : 'bg-black border border-slate-400/60 shadow-inner'"
                class="w-full h-full rounded-[38px] flex flex-col overflow-hidden relative">
                <!-- Sensor Notch / Dynamic Island -->
                <div
                    class="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-[18px] bg-black rounded-full z-30 border border-white/10">
                </div>
                <!-- 案例动画演示组件（props: optimized / device） -->
                <component :is="demoComponent" :optimized="isOptimized" :device="device" />
            </div>
        </div>

        <!-- Analysis Card -->
        <div :class="isOptimized
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-rose-50/80 border-rose-200'"
            class="w-full mt-space-md p-space-md border rounded-xl flex flex-col gap-space-xs shadow-sm">
            <div :class="isOptimized ? 'text-emerald-700' : 'text-rose-700'"
                class="flex items-center gap-space-xs font-label-md text-label-md font-bold">
                <span class="material-symbols-outlined text-[16px]">{{ isOptimized ? 'verified' : 'report_problem'
                    }}</span>
                <span>{{ isOptimized ? '优势分析' : '痛点分析' }}</span>
            </div>
            <p class="font-body-sm text-body-sm text-slate-700 leading-relaxed">
                {{ isOptimized ? caseMeta.analysis.gain : caseMeta.analysis.pain }}
            </p>
        </div>
    </div>
</template>
