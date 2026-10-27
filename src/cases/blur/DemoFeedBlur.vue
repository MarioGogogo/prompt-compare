<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（同色调模糊占位 + 模糊变清晰 + 1.04→1，500ms）
    // false = 普通实现（"做一个图片墙，加载图片"：图片框缺失，加载完瞬间弹出 + 布局跳动 + 闪白）
    optimized: {
        type: Boolean,
        default: false,
    },
    // 展示设备：mobile | tablet（本案例仅适配平板）
    device: {
        type: String,
        default: 'tablet',
    },
})

const sharp = ref(false) // optimized 模式：进入锐化阶段
const loaded = ref(false) // naive 模式：原图加载完瞬间弹出
const flashOn = ref(false) // naive 模式：内容出现瞬间的整页闪白

let timers = []

function later(fn, ms) {
    timers.push(setTimeout(fn, ms))
}

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}

onMounted(() => {
    // 两侧组件周期一致、相位同步：
    // t=0~1.6s  左(naive)=灰色占位块 / 右(optimized)=主色模糊占位
    // t=1.6s    左=原图瞬间替换灰块(生硬弹出+闪白) / 右=逐张错峰合焦(500ms)
    // t=1.6~5.8s 双方清晰保持 -> 复位循环
    const PRE = 1600
    const HOLD = 4200
    if (props.optimized) {
        const loop = () => {
            later(() => {
                sharp.value = true
                later(() => {
                    sharp.value = false
                    loop()
                }, HOLD)
            }, PRE)
        }
        loop()
    } else {
        const loop = () => {
            later(() => {
                loaded.value = true
                flashOn.value = true
                later(() => { flashOn.value = false }, 340)
                later(() => {
                    loaded.value = false
                    loop()
                }, HOLD)
            }, PRE)
        }
        loop()
    }
})

onBeforeUnmount(clearTimers)

// 发现页瀑布流数据（3 列，图片框尺寸提前固定）
const tiles = [
    { id: 't1', col: 0, i: 0, h: 165, art: 'desert', base: '#c9a25e', title: '撒哈拉的清晨，驼队刚出发', user: '阿伊莎', grad: 'linear-gradient(135deg,#fcd34d,#f97316)', likes: '2.1k' },
    { id: 't2', col: 0, i: 3, h: 145, art: 'breakfast', base: '#96774f', title: '沙漠营地的早餐', user: '橙光', grad: 'linear-gradient(135deg,#fbbf24,#ea580c)', likes: '673' },
    { id: 't3', col: 0, i: 6, h: 135, art: 'bluestairs', base: '#3f6ea6', title: '蓝色台阶和一只猫', user: '何小舟', grad: 'linear-gradient(135deg,#93c5fd,#4f46e5)', likes: '528' },
    { id: 't4', col: 1, i: 1, h: 130, art: 'souk', base: '#a8542f', title: '马拉喀什集市的灯', user: 'Lina', grad: 'linear-gradient(135deg,#fda4af,#be123c)', likes: '966' },
    { id: 't5', col: 1, i: 4, h: 122, art: 'latte', base: '#6b4a33', title: '两杯拿铁，每日基本', user: '仔恩', grad: 'linear-gradient(135deg,#d6b896,#78350f)', likes: '642' },
    { id: 't6', col: 1, i: 7, h: 118, art: 'beach', base: '#79aec6', title: '海岸线的下午', user: '南屿', grad: 'linear-gradient(135deg,#a5f3fc,#0284c7)', likes: '486' },
    { id: 't7', col: 2, i: 2, h: 175, art: 'bluecity', base: '#4f7db3', title: '舍夫沙万，整座城都是蓝的', user: '月亮塔', grad: 'linear-gradient(135deg,#7dd3fc,#1d4ed8)', likes: '1.5k' },
    { id: 't8', col: 2, i: 5, h: 155, art: 'redcity', base: '#b05a2e', title: '红土古城，像在火星', user: '陈一鸣', grad: 'linear-gradient(135deg,#fdba74,#c2410c)', likes: '1.1k' },
    { id: 't9', col: 2, i: 8, h: 140, art: 'coffee', base: '#46311f', title: '手冲前的咖啡豆', user: '仔恩', grad: 'linear-gradient(135deg,#d6b896,#451a03)', likes: '394' },
]

const cols = computed(() => [0, 1, 2].map((c) => tiles.filter((t) => t.col === c)))

// 错峰序号（仅 optimized 用）
function stag(tile) {
    return props.optimized ? { '--i': String(tile.i) } : null
}
</script>

<template>
    <div class="w-full h-full bg-[#0e0f13] flex flex-col select-none overflow-hidden">
        <!-- 状态栏 -->
        <div class="shrink-0 pt-3 px-6 h-9 flex items-center justify-between text-white">
            <div class="flex items-baseline gap-2">
                <span class="text-[12px] font-semibold tracking-wide">9:41</span>
                <span class="text-[10px] text-gray-400">10月9日 周四</span>
            </div>
            <div class="flex items-center gap-1 text-gray-200">
                <span class="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span class="material-symbols-outlined text-[13px]">wifi</span>
                <span class="material-symbols-outlined text-[14px]">battery_5_bar</span>
            </div>
        </div>

        <!-- 发现页头 -->
        <div class="shrink-0 px-5 pt-1.5 pb-2.5 flex items-center gap-3.5 border-b border-white/[0.06]">
            <span class="text-[19px] font-bold text-white tracking-wide">发现</span>
            <span class="px-3 py-[5px] rounded-full bg-gray-100 text-[12px] font-semibold text-gray-900">沙漠</span>
            <span class="text-[12.5px] text-gray-400">城市</span>
            <span class="text-[12.5px] text-gray-400">美食</span>
            <span class="text-[12.5px] text-gray-400">咖啡</span>
            <span class="ml-auto material-symbols-outlined text-[18px] text-gray-300">search</span>
        </div>

        <!-- 瀑布流图片墙 -->
        <div class="relative flex-1 overflow-hidden wall" :class="{ 'is-sharp': optimized && sharp }">
            <div class="px-3.5 pt-3 flex gap-2.5 items-start">
                <div v-for="(col, c) in cols" :key="c" class="flex-1 min-w-0 flex flex-col gap-3">
                    <figure v-for="tile in col" :key="tile.id">
                        <!-- 图片框：尺寸提前固定；naive 加载中是灰色占位块，optimized 是主色模糊占位 -->
                        <div class="relative rounded-xl overflow-hidden"
                            :style="{ height: tile.h + 'px', background: optimized ? tile.base : '#1a1c22' }">
                            <svg v-if="optimized || loaded" :class="optimized ? 'blur-up' : ''"
                                class="absolute inset-0 w-full h-full block"
                                :style="stag(tile)" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
                                <template v-if="tile.art === 'desert'">
                                    <defs>
                                        <linearGradient id="bzSky" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#a8b8c6" />
                                            <stop offset="100%" stop-color="#e6d2a8" />
                                        </linearGradient>
                                        <linearGradient id="bzD1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#dcc088" />
                                            <stop offset="100%" stop-color="#c3a061" />
                                        </linearGradient>
                                        <linearGradient id="bzD2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#c19c5c" />
                                            <stop offset="100%" stop-color="#9d7c44" />
                                        </linearGradient>
                                    </defs>
                                    <rect width="200" height="200" fill="url(#bzSky)" />
                                    <circle cx="150" cy="50" r="26" fill="#fdf3dd" opacity="0.9" />
                                    <path d="M0 118 C 50 94, 110 94, 160 120 C 180 130, 192 128, 200 124 L200 200 L0 200 Z"
                                        fill="url(#bzD1)" />
                                    <path d="M0 118 C 50 94, 110 94, 160 120" stroke="#f2ddb0" stroke-width="1.6"
                                        fill="none" opacity="0.6" />
                                    <path d="M0 156 C 60 130, 130 132, 200 158 L200 200 L0 200 Z" fill="url(#bzD2)" />
                                    <g fill="#3f3218">
                                        <ellipse cx="72" cy="128" rx="4.5" ry="3" />
                                        <circle cx="76" cy="124" r="1.6" />
                                        <ellipse cx="84" cy="130" rx="4.5" ry="3" />
                                        <circle cx="88" cy="126" r="1.6" />
                                        <ellipse cx="96" cy="132" rx="4.5" ry="3" />
                                        <circle cx="100" cy="128" r="1.6" />
                                        <ellipse cx="108" cy="134" rx="4.5" ry="3" />
                                        <circle cx="112" cy="130" r="1.6" />
                                    </g>
                                </template>

                                <template v-else-if="tile.art === 'breakfast'">
                                    <rect width="200" height="200" fill="#8a6b45" />
                                    <circle cx="66" cy="82" r="62" fill="#e9e1d0" opacity="0.92" />
                                    <circle cx="66" cy="82" r="46" fill="#f7f3ea" />
                                    <circle cx="52" cy="70" r="10" fill="#d9483b" />
                                    <circle cx="72" cy="62" r="8" fill="#e8a33d" />
                                    <circle cx="80" cy="82" r="9" fill="#7fae52" />
                                    <circle cx="60" cy="94" r="8" fill="#c96f3a" />
                                    <circle cx="150" cy="52" r="26" fill="#f3ede0" />
                                    <circle cx="150" cy="52" r="12" fill="#f0b429" />
                                    <circle cx="152" cy="150" r="22" fill="#4a3524" />
                                    <circle cx="152" cy="150" r="16" fill="#2c1f14" />
                                    <rect x="30" y="156" width="52" height="14" rx="7" fill="#5f4630" />
                                </template>

                                <template v-else-if="tile.art === 'bluestairs'">
                                    <rect width="200" height="200" fill="#35619a" />
                                    <rect y="0" width="200" height="46" fill="#2c517f" />
                                    <rect y="46" width="200" height="36" fill="#4a7ab2" />
                                    <rect y="82" width="200" height="36" fill="#3d6ba3" />
                                    <rect y="118" width="200" height="36" fill="#2f5c90" />
                                    <rect y="154" width="200" height="46" fill="#27508a" />
                                    <rect x="12" y="118" width="26" height="24" rx="4" fill="#8a5a33" />
                                    <circle cx="25" cy="112" r="12" fill="#2e7d5b" />
                                    <circle cx="19" cy="104" r="7" fill="#3c9168" />
                                    <rect x="162" y="82" width="24" height="22" rx="4" fill="#8a5a33" />
                                    <circle cx="174" cy="76" r="11" fill="#7c4a9e" />
                                    <ellipse cx="96" cy="142" rx="15" ry="7" fill="#12161d" />
                                    <circle cx="113" cy="136" r="6" fill="#12161d" />
                                    <path d="M107 130 l4 -5 l2 5 Z" fill="#12161d" />
                                </template>

                                <template v-else-if="tile.art === 'souk'">
                                    <rect width="200" height="200" fill="#a34a28" />
                                    <g>
                                        <rect v-for="n in 10" :key="n" :x="(n - 1) * 20" y="0" width="20" height="52"
                                            :fill="n % 2 ? '#e8ddc8' : '#1f6f54'" />
                                    </g>
                                    <path d="M0 52 Q 25 66 50 52 T 100 52 T 150 52 T 200 52 L200 62 Q 175 76 150 62 T 100 62 T 50 62 T 0 62 Z"
                                        fill="#7c351b" opacity="0.55" />
                                    <rect x="26" y="108" width="42" height="66" rx="4" fill="#5f2a14" />
                                    <circle cx="128" cy="92" r="10" fill="#f2b134" />
                                    <rect x="126.5" y="60" width="3" height="24" fill="#3d1c0d" />
                                    <circle cx="164" cy="112" r="8" fill="#f2b134" />
                                    <rect x="163" y="86" width="2.6" height="20" fill="#3d1c0d" />
                                    <circle cx="128" cy="92" r="16" fill="#f2b134" opacity="0.25" />
                                </template>

                                <template v-else-if="tile.art === 'latte'">
                                    <rect width="200" height="200" fill="#5d4633" />
                                    <rect width="200" height="200" fill="#4a3728" opacity="0.5" />
                                    <circle cx="72" cy="74" r="44" fill="#efe6da" />
                                    <circle cx="72" cy="74" r="36" fill="#b98a5e" />
                                    <path d="M72 52 C 60 62, 60 78, 72 92 C 84 78, 84 62, 72 52 Z" fill="#f3ead9"
                                        opacity="0.9" />
                                    <circle cx="140" cy="140" r="38" fill="#efe6da" />
                                    <circle cx="140" cy="140" r="31" fill="#a97c50" />
                                    <circle cx="140" cy="140" r="10" fill="#f3ead9" opacity="0.9" />
                                    <path d="M126 126 L154 154" stroke="#f3ead9" stroke-width="5" stroke-linecap="round"
                                        opacity="0.85" />
                                </template>

                                <template v-else-if="tile.art === 'beach'">
                                    <rect width="200" height="200" fill="#cfe3ec" />
                                    <rect y="64" width="200" height="80" fill="#5b9bb8" />
                                    <rect y="64" width="200" height="26" fill="#6fa9c4" />
                                    <path d="M0 96 Q 25 90 50 96 T 100 96 T 150 96 T 200 96" stroke="#e9f4f7"
                                        stroke-width="3" fill="none" opacity="0.8" />
                                    <path d="M0 144 Q 30 138 60 144 T 130 144 T 200 142 L200 200 L0 200 Z" fill="#e5d3ae" />
                                    <path d="M0 150 Q 30 146 60 150" stroke="#f5ecd6" stroke-width="4" fill="none" />
                                    <circle cx="156" cy="34" r="18" fill="#fdf3dd" opacity="0.9" />
                                </template>

                                <template v-else-if="tile.art === 'bluecity'">
                                    <rect width="200" height="200" fill="#8fb4de" />
                                    <path d="M0 60 L46 34 L92 58 L140 30 L200 62 L200 96 L0 96 Z" fill="#6d94c4" />
                                    <g>
                                        <rect x="6" y="92" width="52" height="108" fill="#3d6ba8" />
                                        <rect x="54" y="112" width="48" height="88" fill="#2f5a96" />
                                        <rect x="98" y="88" width="54" height="112" fill="#4a7db8" />
                                        <rect x="148" y="104" width="52" height="96" fill="#27508a" />
                                        <rect x="0" y="150" width="200" height="50" fill="#1d3f70" />
                                    </g>
                                    <g fill="#dbe9f8">
                                        <rect x="16" y="104" width="9" height="12" rx="4.5" />
                                        <rect x="34" y="104" width="9" height="12" rx="4.5" />
                                        <rect x="64" y="124" width="9" height="12" rx="4.5" />
                                        <rect x="110" y="100" width="9" height="12" rx="4.5" />
                                        <rect x="128" y="100" width="9" height="12" rx="4.5" />
                                        <rect x="162" y="116" width="9" height="12" rx="4.5" />
                                        <rect x="24" y="162" width="9" height="12" rx="4.5" />
                                        <rect x="108" y="162" width="9" height="12" rx="4.5" />
                                        <rect x="170" y="162" width="9" height="12" rx="4.5" />
                                    </g>
                                </template>

                                <template v-else-if="tile.art === 'redcity'">
                                    <rect width="200" height="200" fill="#d9c9a8" />
                                    <path d="M0 54 L60 34 L120 56 L200 40 L200 90 L0 90 Z" fill="#b98d5f" />
                                    <g>
                                        <rect x="4" y="92" width="46" height="108" fill="#a34e26" />
                                        <rect x="48" y="112" width="52" height="88" fill="#8f4020" />
                                        <rect x="98" y="86" width="50" height="114" fill="#b55c30" />
                                        <rect x="146" y="108" width="54" height="92" fill="#9a4822" />
                                    </g>
                                    <g fill="#5f2a12">
                                        <rect x="14" y="104" width="10" height="14" rx="5" />
                                        <rect x="60" y="124" width="10" height="14" rx="5" />
                                        <rect x="112" y="98" width="10" height="14" rx="5" />
                                        <rect x="160" y="120" width="10" height="14" rx="5" />
                                    </g>
                                    <g>
                                        <rect x="168" y="150" width="6" height="50" fill="#4a3316" />
                                        <circle cx="171" cy="146" r="14" fill="#3c6b3f" />
                                        <circle cx="160" cy="152" r="9" fill="#2f5531" />
                                        <circle cx="182" cy="152" r="9" fill="#2f5531" />
                                    </g>
                                </template>

                                <template v-else>
                                    <rect width="200" height="200" fill="#3a2a1c" />
                                    <g fill="#6b4a2e">
                                        <ellipse cx="40" cy="36" rx="17" ry="12" transform="rotate(18 40 36)" />
                                        <ellipse cx="104" cy="28" rx="17" ry="12" transform="rotate(-24 104 28)" />
                                        <ellipse cx="166" cy="44" rx="17" ry="12" transform="rotate(10 166 44)" />
                                        <ellipse cx="66" cy="92" rx="18" ry="13" transform="rotate(-12 66 92)" />
                                        <ellipse cx="140" cy="100" rx="18" ry="13" transform="rotate(26 140 100)" />
                                        <ellipse cx="30" cy="150" rx="17" ry="12" transform="rotate(32 30 150)" />
                                        <ellipse cx="100" cy="158" rx="18" ry="13" transform="rotate(-18 100 158)" />
                                        <ellipse cx="168" cy="156" rx="17" ry="12" transform="rotate(8 168 156)" />
                                    </g>
                                    <g stroke="#2c1d10" stroke-width="2.4" stroke-linecap="round">
                                        <path d="M28 30 Q 40 40 52 40" fill="none" />
                                        <path d="M92 22 Q 104 32 116 32" fill="none" />
                                        <path d="M54 86 Q 66 96 78 96" fill="none" />
                                        <path d="M128 94 Q 140 104 152 104" fill="none" />
                                        <path d="M88 152 Q 100 162 112 162" fill="none" />
                                        <path d="M156 150 Q 168 160 180 160" fill="none" />
                                    </g>
                                </template>
                            </svg>
                        </div>
                        <!-- naive 模式：图片未加载时只有文字（图片一到整列被瞬间撑开 = 布局跳动） -->
                        <figcaption class="mt-1.5 px-0.5 text-[12px] font-medium leading-snug text-gray-100">
                            {{ tile.title }}
                        </figcaption>
                        <div class="flex items-center mt-1 px-0.5 gap-1.5">
                            <span class="w-4 h-4 rounded-full shrink-0" :style="{ background: tile.grad }"></span>
                            <span class="text-[10px] text-gray-500 truncate">{{ tile.user }}</span>
                            <span
                                class="ml-auto flex items-center gap-0.5 text-[10px] text-gray-500 shrink-0">
                                <span class="material-symbols-outlined text-[11px]">favorite</span>{{ tile.likes }}
                            </span>
                        </div>
                    </figure>
                </div>
            </div>

            <!-- naive 模式：内容出现瞬间的整页闪白 -->
            <div v-if="!optimized && flashOn" class="absolute inset-0 z-20 pointer-events-none flash"></div>
        </div>
    </div>
</template>

<style scoped>
/* optimized：每张图初始为主色调模糊小图（主色底 + 20px 高斯模糊 + 1.04）；加载完从模糊慢慢变清晰 */
.blur-up {
    filter: blur(20px);
    opacity: 0.85;
    transform: scale(1.04);
}

.is-sharp .blur-up {
    filter: blur(0);
    opacity: 1;
    transform: scale(1);
    transition:
        filter 0.5s ease-out,
        opacity 0.5s ease-out,
        transform 0.5s ease-out;
    transition-delay: calc(var(--i, 0) * 60ms);
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
