<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cases, getCase, nextCase, prevCase } from '../data/cases.js'
import { useDeviceView, normalizeDevice } from '../composables/useDeviceView.js'
import CaseConsole from '../components/CaseConsole.vue'
import DeviceShowcase from '../components/DeviceShowcase.vue'

const route = useRoute()
const router = useRouter()
const { deviceView, setDeviceView } = useDeviceView()

const caseMeta = computed(() => getCase(route.params.id))
const nextMeta = computed(() => nextCase(route.params.id))
const prevMeta = computed(() => prevCase(route.params.id))

// 当前案例不支持当前设备视图时，回落到案例支持的第一个设备
watch(
    () => route.params.id,
    () => {
        const meta = caseMeta.value
        if (meta) {
            setDeviceView(normalizeDevice(meta))
        }
    },
    { immediate: true }
)

const valueTones = {
    indigo: { chip: 'bg-indigo-50 border-indigo-100 text-indigo-600', hl: 'text-indigo-600 font-semibold' },
    emerald: { chip: 'bg-emerald-50 border-emerald-100 text-emerald-600', hl: 'text-emerald-600 font-semibold' },
    amber: { chip: 'bg-amber-50 border-amber-100 text-amber-600', hl: 'text-amber-600 font-semibold' },
}

function tone(t) {
    return valueTones[t] || valueTones.indigo
}
</script>

<template>
    <div v-if="caseMeta" class="flex flex-col w-full">
        <div class="relative w-full max-w-[1440px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl overflow-hidden">
            <!-- Workspace Top Header & Control Center -->
            <CaseConsole :case-meta="caseMeta" />
            <!-- Comparison Arena (Dual Device Mockups) -->
            <div
                class="w-full flex flex-col lg:flex-row items-center justify-center gap-space-xl transition-all duration-300">
                <DeviceShowcase variant="baseline" :device="deviceView" :case-meta="caseMeta" />
                <DeviceShowcase variant="optimized" :device="deviceView" :case-meta="caseMeta" />
            </div>
            <!-- Value Summary Cards (meta-driven) -->
            <div class="w-full mt-space-md flex flex-col gap-space-md">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-space-sm">
                        <span class="w-1.5 h-4 rounded-full bg-indigo-600"></span>
                        <h2 class="font-headline-md text-headline-md font-bold text-slate-900">这条提示词到底好在哪</h2>
                    </div>
                    <span class="font-label-md text-label-md text-slate-400 font-semibold">3 DIMENSIONAL
                        EVALUATION</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    <div v-for="card in caseMeta.valueCards" :key="card.title"
                        class="p-space-lg rounded-2xl bg-white border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-space-sm hover:shadow-md hover:border-slate-300 transition-all">
                        <div class="w-10 h-10 rounded-xl border flex items-center justify-center"
                            :class="tone(card.tone).chip">
                            <span class="material-symbols-outlined text-[24px]">{{ card.icon }}</span>
                        </div>
                        <h3 class="font-headline-sm text-headline-sm font-bold text-slate-900">{{ card.title }}</h3>
                        <p class="font-body-sm text-body-sm text-slate-600 leading-relaxed">
                            <template v-for="(part, i) in card.bodyParts" :key="i"><span
                                    :class="part.hl ? tone(part.tone).hl : ''"
                                    :style="part.mono ? 'font-family: JetBrains Mono, monospace' : ''">{{ part.t
                                }}</span></template>
                        </p>
                        <div
                            class="mt-auto pt-2 flex items-center gap-2 text-slate-400 font-label-sm text-label-sm border-t border-slate-100">
                            <span class="material-symbols-outlined text-[14px]">{{ card.foot.icon }}</span>
                            <span>{{ card.foot.text }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Case Navigation Footer -->
            <div class="w-full flex flex-col items-center gap-space-md pt-space-sm">
                <span class="font-label-md text-label-md text-slate-400">
                    下一个：{{ nextMeta ? `PROMPT ${nextMeta.index} ${nextMeta.title}` : '敬请期待' }}
                </span>
                <div class="flex items-center gap-space-sm">
                    <button
                        class="flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all font-body-sm text-body-sm font-medium cursor-pointer"
                        @click="router.push({ name: 'case', params: { id: prevMeta.id } })">
                        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                        上一案 · {{ prevMeta.title }}
                    </button>
                    <router-link :to="{ name: 'library' }"
                        class="flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-body-sm text-body-sm font-medium cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">grid_view</span>
                        案例库（{{ cases.length }} 个案例）
                    </router-link>
                    <button
                        class="flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all font-body-sm text-body-sm font-medium cursor-pointer"
                        @click="router.push({ name: 'case', params: { id: nextMeta.id } })">
                        下一案 · {{ nextMeta.title }}
                        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
