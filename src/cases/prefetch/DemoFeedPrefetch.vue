<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（距底一屏预取 + 3 点跳动 + 50ms 错峰传送带上滑 + 没有更多了）
    // false = 普通实现（"做一个滑到底自动加载更多的列表"：底部转圈 + 内容瞬间弹出 + 位置跳动 + 闪白）
    optimized: {
        type: Boolean,
        default: false,
    },
    // 展示设备：mobile | tablet（本案例仅适配手机）
    device: {
        type: String,
        default: 'mobile',
    },
})

const dots = ref(false) // optimized：底部 3 个依次跳动的小圆点
const arrived = ref(false) // optimized：下一页卡片传送带进场
const noMore = ref(false) // optimized：底部"没有更多了"
const naiveLoading = ref(false) // naive：底部转圈"加载中…"
const naiveLoaded = ref(false) // naive：下一页瞬间弹出
const flashOn = ref(false) // naive：内容出现瞬间的整页闪白
const jerkOn = ref(false) // naive：内容出现瞬间列表位置猛跳

const scroller = ref(null)

let timers = []
let raf = 0
let t0 = 0

function later(fn, ms) {
    timers.push(setTimeout(fn, ms))
}

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}

// 自动滚动（逐帧向相位目标平滑趋近，与下方 JS 定时器同周期 7.8s）：
// 0~1.6s 下滑接近底部（圆点紧贴最后一行露出）→ 1.6~2.6s 缓慢爬行(加载中)
// 2.6s 下一页插入（列表变高，max 突增）→ 之后滚动继续，把新卡片从底部"传送上来" → 停住
let cur = 0
let prevT = 0

function tick(now) {
    if (!t0) t0 = now
    const CYCLE = 7800
    const t = (now - t0) % CYCLE
    if (t < prevT) cur = 0 // 循环复位：回到顶部
    prevT = t
    const el = scroller.value
    if (el) {
        const max = el.scrollHeight - el.clientHeight
        let target
        let k
        if (t < 1600) {
            target = max * 0.94
            k = 0.08
        } else if (t < 2600) {
            target = max * 0.99
            k = 0.03
        } else if (t < 5300) {
            target = max
            k = 0.035
        } else {
            target = max
            k = 0.2
        }
        cur += (target - cur) * k
        if (Math.abs(target - cur) < 0.5) cur = target
        el.scrollTop = cur
    }
    raf = requestAnimationFrame(tick)
}

onMounted(() => {
    // 两侧组件周期一致、相位同步：
    // t=1.6s   左(naive)=底部转圈"加载中…" / 右(optimized)=3 个依次跳动的小圆点（紧贴最后一行）
    // t=2.6s   下一页插入列表（此前 0 高度不占空间）：左=瞬间弹出(位置猛跳+闪白) / 右=新卡片 50ms 错峰滑上淡入，滚动继续把新内容从底部传送上来
    // t=5.4s   右=滑到底部，"没有更多了"淡入 / 左=到底部无任何交代
    // t=7.8s   复位循环
    const PRE = 1600
    const ARRIVE = 2600
    const END = 5400
    const CYCLE = 7800
    raf = requestAnimationFrame(tick)
    if (props.optimized) {
        const loop = () => {
            later(() => { dots.value = true }, PRE)
            later(() => {
                dots.value = false
                arrived.value = true
            }, ARRIVE)
            later(() => { noMore.value = true }, END)
            later(() => {
                dots.value = false
                arrived.value = false
                noMore.value = false
                loop()
            }, CYCLE)
        }
        loop()
    } else {
        const loop = () => {
            later(() => { naiveLoading.value = true }, PRE)
            later(() => {
                naiveLoading.value = false
                naiveLoaded.value = true
                jerkOn.value = true
                flashOn.value = true
                later(() => { flashOn.value = false }, 340)
                later(() => { jerkOn.value = false }, 420)
            }, ARRIVE)
            later(() => {
                naiveLoaded.value = false
                jerkOn.value = false
                loop()
            }, CYCLE)
        }
        loop()
    }
})

onBeforeUnmount(() => {
    clearTimers()
    cancelAnimationFrame(raf)
})

// 商品数据：pageA 初始 8 件，pageB 预取的下一页 4 件（与截图商品一致 + 同主题补充）
const pageA = [
    { id: 1, title: '红色跑鞋 · 轻量缓震 夜跑反光款', price: '¥479', sold: '已售 2.3万', tags: ['包邮', '7天退'], art: 'shoe', bg: '#7a1414', body: '#c22a20', sole: '#f3e9dc', accent: '#ffffff' },
    { id: 2, title: '荧光绿竞速跑鞋 · 碳板回弹', price: '¥929', sold: '已售 8640', tags: ['新品', '包邮'], art: 'shoe', bg: '#9dc41f', body: '#cbe84a', sole: '#ffffff', accent: '#1c1c1c' },
    { id: 3, title: '双杯拿铁礼盒 · 挂耳 20 包', price: '¥149', sold: '已售 5120', tags: ['第二件半价', '包邮'], art: 'latte', bg: '#2a1c12', cup: '#e8ddcf', crema: '#b98146' },
    { id: 4, title: '莓果燕麦碗 · 早餐套装', price: '¥89', sold: '已售 3870', tags: ['冷藏', '包邮'], art: 'bowl', bg: '#1d2430', porridge: '#e7d9bd' },
    { id: 5, title: '雾霾蓝慢跑鞋 · 轻弹中底', price: '¥399', sold: '已售 4520', tags: ['包邮'], art: 'shoe', bg: '#243a52', body: '#6d8fb4', sole: '#eef2f6', accent: '#dfe8f2' },
    { id: 6, title: '生椰拿铁 · 冷萃基底 12 瓶', price: '¥129', sold: '已售 2760', tags: ['冷藏', '包邮'], art: 'latte', bg: '#efe4d2', cup: '#ffffff', crema: '#a96f3c' },
    { id: 7, title: '全麦贝果 · 6 个装 每日现烤', price: '¥39', sold: '已售 9830', tags: ['新鲜烘焙'], art: 'bowl', bg: '#3a2c1a', porridge: '#d8a75c' },
    { id: 8, title: '黑白复古跑鞋 · 德训风', price: '¥559', sold: '已售 6100', tags: ['爆款', '包邮'], art: 'shoe', bg: '#3c3c40', body: '#eceff2', sole: '#f8f8f8', accent: '#232326' },
]
const pageB = [
    { id: 9, title: '马卡龙配色板鞋 · 奶油厚底', price: '¥369', sold: '已售 1.2万', tags: ['包邮', '百搭'], art: 'shoe', bg: '#d9d3ea', body: '#cfd9f0', sole: '#fdf6ea', accent: '#f4c6d8' },
    { id: 10, title: '经典白色板鞋 · 百搭小白鞋', price: '¥269', sold: '已售 960', tags: ['爆款', '7天退'], art: 'shoe', bg: '#4a4d52', body: '#f5f5f2', sole: '#ffffff', accent: '#c9ced4' },
    { id: 11, title: '椰奶厚乳拿铁 · 0 蔗糖', price: '¥199', sold: '已售 3450', tags: ['第二件半价'], art: 'latte', bg: '#241a14', cup: '#f2e9dc', crema: '#c08a4e' },
    { id: 12, title: '草莓酸奶碗 · 低卡轻食', price: '¥59', sold: '已售 1580', tags: ['冷藏'], art: 'bowl', bg: '#33202a', porridge: '#f3e7ef' },
]

// optimized 模式下下一页每张卡片的错峰序号
function stag(i) {
    return props.optimized ? { '--i': String(i) } : null
}
</script>

<template>
    <div class="relative w-full h-full bg-[#0d0e12] flex flex-col select-none overflow-hidden">
        <!-- 状态栏 -->
        <div class="shrink-0 pt-3 px-6 h-9 flex items-center justify-between text-white">
            <span class="text-[12px] font-semibold tracking-wide">9:41</span>
            <div class="flex items-center gap-1 text-gray-200">
                <span class="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span class="material-symbols-outlined text-[13px]">wifi</span>
                <span class="material-symbols-outlined text-[14px]">battery_5_bar</span>
            </div>
        </div>

        <!-- 搜索框 -->
        <div class="shrink-0 px-4 pt-1 pb-2">
            <div class="h-8 rounded-full bg-white/[0.08] flex items-center px-3 gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-gray-500">search</span>
                <span class="text-[11px] text-gray-500">搜索 球鞋 / 耳机 / 咖啡</span>
            </div>
        </div>

        <!-- 频道 Tab：推荐 / 运动鞋 / 数码 / 咖啡 / 早餐 -->
        <div class="shrink-0 px-4 h-8 flex items-center gap-4 border-b border-white/[0.06]">
            <span class="relative text-[12.5px] font-semibold text-white">
                推荐
                <span
                    class="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-4 h-[2.5px] rounded-full bg-orange-500"></span>
            </span>
            <span class="text-[12px] text-gray-500">运动鞋</span>
            <span class="text-[12px] text-gray-500">数码</span>
            <span class="text-[12px] text-gray-500">咖啡</span>
            <span class="text-[12px] text-gray-500">早餐</span>
        </div>

        <!-- 商品列表：JS 逐帧驱动自动滚动（与加载相位同步） -->
        <div ref="scroller" class="relative flex-1 overflow-y-auto feed-scroll">
            <div class="jolt" :class="{ 'is-jerk': !optimized && jerkOn }">
                <!-- 商品网格 -->
                <div class="px-3 pt-2.5">
                    <div class="grid grid-cols-2 gap-x-2.5 gap-y-2.5">
                    <!-- 首页 8 件 -->
                    <div v-for="p in pageA" :key="p.id" class="min-w-0">
                        <div class="h-[104px] rounded-xl overflow-hidden relative">
                            <svg v-if="p.art === 'shoe'" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice"
                                class="w-full h-full block">
                                <rect width="200" height="130" :fill="p.bg" />
                                <ellipse cx="102" cy="106" rx="64" ry="6" fill="#000" opacity="0.25" />
                                <path
                                    d="M34 94 C 34 87, 48 83, 70 81 L 152 77 C 167 77, 172 84, 170 92 C 168 100, 150 104, 100 104 C 55 104, 34 101, 34 94 Z"
                                    :fill="p.sole" />
                                <path d="M38 90 L 166 86" :stroke="p.bg" stroke-width="2" opacity="0.35" />
                                <path
                                    d="M42 88 C 44 66, 60 47, 88 41 C 100 38, 107 44, 115 53 C 127 66, 146 72, 158 76 C 165 79, 164 85, 156 87 L 62 90 Z"
                                    :fill="p.body" />
                                <path d="M118 50 C 130 62, 146 69, 158 76" :stroke="p.bg" stroke-width="2" fill="none"
                                    opacity="0.3" />
                                <ellipse cx="106" cy="47" rx="12" ry="6" :fill="p.bg" opacity="0.55" />
                                <g :stroke="p.accent" stroke-width="2.2" opacity="0.8">
                                    <line x1="76" y1="52" x2="87" y2="58" />
                                    <line x1="70" y1="60" x2="82" y2="66" />
                                    <line x1="66" y1="68" x2="78" y2="73" />
                                </g>
                                <circle cx="152" cy="82" r="3" fill="#fff" opacity="0.85" />
                            </svg>
                            <svg v-else-if="p.art === 'latte'" viewBox="0 0 200 130"
                                preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
                                <rect width="200" height="130" :fill="p.bg" />
                                <rect y="86" width="200" height="44" fill="#000" opacity="0.25" />
                                <g>
                                    <ellipse cx="72" cy="70" rx="34" ry="13" fill="#000" opacity="0.3" />
                                    <path d="M42 32 L102 32 L96 74 C 95 79, 49 79, 48 74 Z" :fill="p.cup" />
                                    <ellipse cx="72" cy="32" rx="30" ry="9" :fill="p.crema" />
                                    <ellipse cx="72" cy="32" rx="18" ry="5.5" fill="#fff" opacity="0.55" />
                                    <path d="M100 40 C 114 38, 116 52, 103 56" fill="none" :stroke="p.cup"
                                        stroke-width="5" />
                                </g>
                                <g>
                                    <ellipse cx="138" cy="82" rx="30" ry="11" fill="#000" opacity="0.3" />
                                    <path d="M112 48 L164 48 L159 86 C 158 90, 118 90, 117 86 Z" :fill="p.cup" />
                                    <ellipse cx="138" cy="48" rx="26" ry="8" :fill="p.crema" />
                                    <ellipse cx="138" cy="48" rx="15" ry="4.5" fill="#fff" opacity="0.5" />
                                    <path d="M162 55 C 174 53, 176 65, 165 68" fill="none" :stroke="p.cup"
                                        stroke-width="5" />
                                </g>
                            </svg>
                            <svg v-else viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice"
                                class="w-full h-full block">
                                <rect width="200" height="130" :fill="p.bg" />
                                <ellipse cx="100" cy="112" rx="70" ry="8" fill="#000" opacity="0.25" />
                                <path d="M40 62 C 40 92, 66 106, 100 106 C 134 106, 160 92, 160 62 Z"
                                    :fill="p.porridge" />
                                <ellipse cx="100" cy="62" rx="60" ry="18" fill="#fff" opacity="0.35" />
                                <ellipse cx="100" cy="62" rx="60" ry="18" :fill="p.porridge" opacity="0.9" />
                                <g>
                                    <circle cx="78" cy="58" r="7" fill="#b23a48" />
                                    <circle cx="104" cy="52" r="6" fill="#3d5a9e" />
                                    <circle cx="126" cy="60" r="6.5" fill="#7c3aed" />
                                    <circle cx="92" cy="68" r="5.5" fill="#2e7d5b" />
                                    <circle cx="116" cy="68" r="5" fill="#d97706" />
                                    <ellipse cx="66" cy="66" rx="7" ry="4" fill="#f5deb3" />
                                    <ellipse cx="138" cy="68" rx="7" ry="4" fill="#f5deb3" />
                                </g>
                                <rect x="96" y="18" width="8" height="30" rx="4" fill="#ddd" opacity="0.7"
                                    transform="rotate(14 100 33)" />
                            </svg>
                        </div>
                        <p class="mt-1.5 text-[11px] leading-[1.35] text-gray-200">{{ p.title }}</p>
                        <div class="mt-1 flex flex-wrap gap-1">
                            <span v-for="t in p.tags" :key="t"
                                class="px-1 py-px rounded-[3px] border border-orange-500/45 text-orange-400/90 text-[8px] leading-[13px]">{{
                                    t }}</span>
                        </div>
                        <div class="mt-0.5 flex items-center justify-between">
                            <span class="text-[13px] font-bold text-orange-500">{{ p.price }}</span>
                            <span class="text-[9px] text-gray-500">{{ p.sold }}</span>
                        </div>
                    </div>

                    </div>

                    <!-- 下一页 4 件：加载前完全不占高度（圆点紧贴最后一行）
                         optimized=容器收起为 0 高、到达瞬间放开并 50ms 错峰滑上；naive=隐藏、加载完瞬间显现 -->
                    <div v-show="optimized || naiveLoaded"
                        :class="optimized ? ['pb-clipped', { 'pb-open': arrived }] : ''">
                        <div class="grid grid-cols-2 gap-x-2.5 gap-y-2.5 pt-2.5"
                            :class="{ 'arrived-on': optimized && arrived }">
                            <template v-for="(p, i) in pageB" :key="p.id">
                                <div class="min-w-0" :class="optimized ? 'pcard' : ''" :style="stag(i)">
                            <div class="h-[104px] rounded-xl overflow-hidden relative">
                                <svg v-if="p.art === 'shoe'" viewBox="0 0 200 130"
                                    preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
                                    <rect width="200" height="130" :fill="p.bg" />
                                    <ellipse cx="102" cy="106" rx="64" ry="6" fill="#000" opacity="0.25" />
                                    <path
                                        d="M34 94 C 34 87, 48 83, 70 81 L 152 77 C 167 77, 172 84, 170 92 C 168 100, 150 104, 100 104 C 55 104, 34 101, 34 94 Z"
                                        :fill="p.sole" />
                                    <path d="M38 90 L 166 86" :stroke="p.bg" stroke-width="2" opacity="0.35" />
                                    <path
                                        d="M42 88 C 44 66, 60 47, 88 41 C 100 38, 107 44, 115 53 C 127 66, 146 72, 158 76 C 165 79, 164 85, 156 87 L 62 90 Z"
                                        :fill="p.body" />
                                    <path d="M118 50 C 130 62, 146 69, 158 76" :stroke="p.bg" stroke-width="2"
                                        fill="none" opacity="0.3" />
                                    <ellipse cx="106" cy="47" rx="12" ry="6" :fill="p.bg" opacity="0.55" />
                                    <g :stroke="p.accent" stroke-width="2.2" opacity="0.8">
                                        <line x1="76" y1="52" x2="87" y2="58" />
                                        <line x1="70" y1="60" x2="82" y2="66" />
                                        <line x1="66" y1="68" x2="78" y2="73" />
                                    </g>
                                    <circle cx="152" cy="82" r="3" fill="#fff" opacity="0.85" />
                                </svg>
                                <svg v-else-if="p.art === 'latte'" viewBox="0 0 200 130"
                                    preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
                                    <rect width="200" height="130" :fill="p.bg" />
                                    <rect y="86" width="200" height="44" fill="#000" opacity="0.25" />
                                    <g>
                                        <ellipse cx="72" cy="70" rx="34" ry="13" fill="#000" opacity="0.3" />
                                        <path d="M42 32 L102 32 L96 74 C 95 79, 49 79, 48 74 Z" :fill="p.cup" />
                                        <ellipse cx="72" cy="32" rx="30" ry="9" :fill="p.crema" />
                                        <ellipse cx="72" cy="32" rx="18" ry="5.5" fill="#fff" opacity="0.55" />
                                        <path d="M100 40 C 114 38, 116 52, 103 56" fill="none" :stroke="p.cup"
                                            stroke-width="5" />
                                    </g>
                                    <g>
                                        <ellipse cx="138" cy="82" rx="30" ry="11" fill="#000" opacity="0.3" />
                                        <path d="M112 48 L164 48 L159 86 C 158 90, 118 90, 117 86 Z" :fill="p.cup" />
                                        <ellipse cx="138" cy="48" rx="26" ry="8" :fill="p.crema" />
                                        <ellipse cx="138" cy="48" rx="15" ry="4.5" fill="#fff" opacity="0.5" />
                                        <path d="M162 55 C 174 53, 176 65, 165 68" fill="none" :stroke="p.cup"
                                            stroke-width="5" />
                                    </g>
                                </svg>
                                <svg v-else viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice"
                                    class="w-full h-full block">
                                    <rect width="200" height="130" :fill="p.bg" />
                                    <ellipse cx="100" cy="112" rx="70" ry="8" fill="#000" opacity="0.25" />
                                    <path d="M40 62 C 40 92, 66 106, 100 106 C 134 106, 160 92, 160 62 Z"
                                        :fill="p.porridge" />
                                    <ellipse cx="100" cy="62" rx="60" ry="18" :fill="p.porridge" opacity="0.9" />
                                    <g>
                                        <circle cx="78" cy="58" r="7" fill="#b23a48" />
                                        <circle cx="104" cy="52" r="6" fill="#3d5a9e" />
                                        <circle cx="126" cy="60" r="6.5" fill="#7c3aed" />
                                        <circle cx="92" cy="68" r="5.5" fill="#2e7d5b" />
                                        <circle cx="116" cy="68" r="5" fill="#d97706" />
                                        <ellipse cx="66" cy="66" rx="7" ry="4" fill="#f5deb3" />
                                        <ellipse cx="138" cy="68" rx="7" ry="4" fill="#f5deb3" />
                                    </g>
                                </svg>
                            </div>
                            <p class="mt-1.5 text-[11px] leading-[1.35] text-gray-200">{{ p.title }}</p>
                            <div class="mt-1 flex flex-wrap gap-1">
                                <span v-for="t in p.tags" :key="t"
                                    class="px-1 py-px rounded-[3px] border border-orange-500/45 text-orange-400/90 text-[8px] leading-[13px]">{{
                                        t }}</span>
                            </div>
                            <div class="mt-0.5 flex items-center justify-between">
                                <span class="text-[13px] font-bold text-orange-500">{{ p.price }}</span>
                                <span class="text-[9px] text-gray-500">{{ p.sold }}</span>
                            </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 列表底部状态（加载指示区紧贴最后一行，高度很小） -->
                <div class="h-10 flex items-center justify-center">
                    <!-- optimized：3 个依次跳动的小圆点 -->
                    <div v-if="optimized && dots" class="flex items-center gap-1.5">
                        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                    </div>
                    <!-- optimized：最后一页 -->
                    <span v-else-if="optimized" class="no-more text-[10px] text-gray-500"
                        :class="{ 'no-more-on': noMore }">— 没有更多了 —</span>
                    <!-- naive：转圈"加载中…" -->
                    <div v-else-if="naiveLoading" class="flex items-center gap-2">
                        <div class="spin w-4 h-4 rounded-full border-2 border-white/10 border-t-gray-400"></div>
                        <span class="text-[11px] text-gray-500">加载中…</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- naive：内容出现瞬间的整页闪白 -->
        <div v-if="!optimized && flashOn" class="absolute inset-0 z-20 pointer-events-none flash"></div>
    </div>
</template>

<style scoped>
/* 隐藏滚动条（自动滚动由 JS 驱动） */
.feed-scroll {
    scrollbar-width: none;
}

.feed-scroll::-webkit-scrollbar {
    display: none;
}

/* optimized：下一页容器加载前收起为 0 高（加载指示紧贴最后一行），到达瞬间放开插入 */
.pb-clipped {
    max-height: 0;
    overflow: hidden;
}

.pb-open {
    max-height: none;
}

/* optimized：下一页卡片初始隐藏 + 下移 24px；到达时 50ms 错峰滑上淡入（0.45s） */
.pcard {
    opacity: 0;
    transform: translateY(24px);
}

.arrived-on .pcard {
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity 0.45s ease-out,
        transform 0.45s ease-out;
    transition-delay: calc(var(--i, 0) * 50ms);
}

/* optimized：3 个依次跳动的小圆点 */
.dot {
    width: 5px;
    height: 5px;
    border-radius: 9999px;
    background: #9ca3af;
    animation: dotJump 0.9s ease-in-out infinite;
}

.dot:nth-child(2) {
    animation-delay: 0.15s;
}

.dot:nth-child(3) {
    animation-delay: 0.3s;
}

@keyframes dotJump {

    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.45;
    }

    30% {
        transform: translateY(-6px);
        opacity: 1;
    }
}

/* optimized："没有更多了"淡入 */
.no-more {
    opacity: 0;
    transition: opacity 0.6s ease;
}

.no-more-on {
    opacity: 1;
}

/* naive：下一页内容瞬间弹出时列表位置猛跳一下 */
.is-jerk {
    animation: jerk 0.42s ease-out;
}

@keyframes jerk {
    0% {
        transform: translateY(0);
    }

    18% {
        transform: translateY(-22px);
    }

    55% {
        transform: translateY(7px);
    }

    100% {
        transform: translateY(0);
    }
}

/* naive：转圈 spinner */
.spin {
    animation: spin 0.9s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* naive：整页闪白（瞬间亮起再快速消退） */
.flash {
    background: #ffffff;
    animation: flashOut 0.34s ease-out forwards;
}

@keyframes flashOut {
    from {
        opacity: 0.45;
    }

    to {
        opacity: 0;
    }
}
</style>
