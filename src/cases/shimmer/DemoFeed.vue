<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（骨架屏 + 微光扫过 + 错峰浮现）
    // false = 普通实现（转圈加载 + 内容瞬间弹出 + 闪白跳动）
    optimized: {
        type: Boolean,
        default: false,
    },
    // 展示设备：mobile | tablet（当前案例布局自适应，暂未区分，预留）
    device: {
        type: String,
        default: 'mobile',
    },
})

const isLoaded = ref(false) // optimized 模式：数据已到达
const naiveLoading = ref(true) // naive 模式：正在转圈
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
    if (props.optimized) {
        // 循环：骨架屏(微光每1.5s扫过) -> 数据到达、60ms错峰浮现 -> 保持 -> 回到骨架
        const loop = () => {
            later(() => {
                isLoaded.value = true
                later(() => {
                    isLoaded.value = false
                    loop()
                }, 4200)
            }, 2300)
        }
        loop()
    } else {
        // 循环：白屏转圈 -> 内容瞬间弹出(跳动+闪白) -> 保持 -> 回到转圈
        const loop = () => {
            later(() => {
                naiveLoading.value = false
                flashOn.value = true
                later(() => { flashOn.value = false }, 340)
                later(() => {
                    naiveLoading.value = true
                    loop()
                }, 4860)
            }, 1600)
        }
        loop()
    }
})

onBeforeUnmount(clearTimers)

// 微博式信息流数据（与截图中 App 布局一致）
const posts = [
    {
        id: 1,
        user: '阿伊莎',
        avatarChar: '阿',
        avatarGrad: 'linear-gradient(135deg,#fcd34d 0%,#f97316 55%,#ef4444 100%)',
        meta: '12分钟前 · 撒哈拉',
        text: '在梅尔祖卡驿站驼队看日出，沙丘十分钟就从紫色变成金色。清晨很冷，记得带件外套。',
        media: 'desert',
        likes: '1.2k',
        comments: '86',
    },
    {
        id: 2,
        user: '周屿',
        avatarChar: '周',
        avatarGrad: 'linear-gradient(135deg,#60a5fa 0%,#6366f1 55%,#8b5cf6 100%)',
        meta: '38分钟前 · 舍夫沙万',
        text: '整座城都是蓝色的，随便一条台阶都能出片。早上八点的人最少，猫比游客还多。',
        media: 'blue',
        likes: '963',
        comments: '47',
    },
]

// optimized 模式下每块的错峰序号（头像 0 / 正文 1 / 图片 2 / 操作栏 3，第二条 +4）
function stag(n) {
    return props.optimized ? { '--i': String(n) } : null
}
</script>

<template>
    <div class="w-full h-full bg-[#0d0e12] flex flex-col select-none overflow-hidden">
        <!-- 状态栏 -->
        <div class="shrink-0 pt-3 px-6 h-9 flex items-center justify-between text-white">
            <span class="text-[12px] font-semibold tracking-wide">9:41</span>
            <div class="flex items-center gap-1 text-gray-200">
                <span class="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span class="material-symbols-outlined text-[13px]">wifi</span>
                <span class="material-symbols-outlined text-[14px]">battery_5_bar</span>
            </div>
        </div>

        <!-- 顶部频道 Tab：关注 / 推荐 / 同城 / 旅行 -->
        <div class="shrink-0 px-4 h-10 flex items-end gap-5 border-b border-white/[0.07]">
            <span class="pb-2 text-[13px] text-gray-500">关注</span>
            <span class="relative pb-2 text-[13.5px] font-semibold text-white">
                推荐
                <span class="absolute left-1/2 -translate-x-1/2 bottom-0 w-5 h-[2.5px] rounded-full bg-orange-500"></span>
            </span>
            <span class="pb-2 text-[13px] text-gray-500">同城</span>
            <span class="pb-2 text-[13px] text-gray-500">旅行</span>
            <span class="ml-auto pb-1.5 material-symbols-outlined text-[17px] text-gray-300">search</span>
        </div>

        <!-- 信息流区域 -->
        <div class="relative flex-1 overflow-y-auto feed-scroll" :class="{ 'is-loaded': optimized && isLoaded }">
            <!-- 真实内容（naive 模式加载中整体隐藏；optimized 模式由 oblock 控制错峰浮现） -->
            <div v-show="optimized || !naiveLoading">
                <article v-for="(post, p) in posts" :key="post.id"
                    class="px-4 pt-4 pb-1.5 border-b border-white/[0.06]">
                    <!-- 头像 + 昵称 + 时间地点 -->
                    <div class="flex items-center" :class="{ oblock: optimized }" :style="stag(p * 4 + 0)">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                            :style="{ background: post.avatarGrad }">
                            {{ post.avatarChar }}
                        </div>
                        <div class="flex flex-col ml-2.5 min-w-0">
                            <span class="text-[13px] font-semibold text-gray-100 leading-tight">{{ post.user }}</span>
                            <span class="text-[10px] text-gray-500 mt-[3px]">{{ post.meta }}</span>
                        </div>
                    </div>
                    <!-- 正文 -->
                    <p class="mt-2.5 text-[12.5px] leading-[1.7] text-gray-200" :class="{ oblock: optimized }"
                        :style="stag(p * 4 + 1)">
                        {{ post.text }}
                    </p>
                    <!-- 图片 / 视频块 -->
                    <div class="mt-2.5" :class="{ oblock: optimized }" :style="stag(p * 4 + 2)">
                        <div class="w-full h-40 rounded-xl overflow-hidden relative bg-[#1a1c22]">
                            <!-- 撒哈拉沙漠 · SVG 场景 -->
                            <svg v-if="post.media === 'desert'" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice"
                                class="w-full h-full block">
                                <defs>
                                    <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#9fb2c3" />
                                        <stop offset="55%" stop-color="#cfc3ab" />
                                        <stop offset="100%" stop-color="#e3cfa4" />
                                    </linearGradient>
                                    <linearGradient id="dune1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#e0c084" />
                                        <stop offset="100%" stop-color="#c8a463" />
                                    </linearGradient>
                                    <linearGradient id="dune2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#caa768" />
                                        <stop offset="100%" stop-color="#a8854a" />
                                    </linearGradient>
                                </defs>
                                <rect width="400" height="250" fill="url(#dsky)" />
                                <circle cx="298" cy="58" r="34" fill="#fdf3dd" opacity="0.25" />
                                <circle cx="298" cy="58" r="24" fill="#fdf3dd" opacity="0.9" />
                                <path d="M0 152 C 90 118, 180 118, 250 148 C 310 172, 360 168, 400 150 L 400 250 L 0 250 Z"
                                    fill="url(#dune1)" />
                                <path d="M0 152 C 90 118, 180 118, 250 148" stroke="#f2ddb0" stroke-width="2" fill="none"
                                    opacity="0.6" />
                                <path d="M0 196 C 110 158, 230 158, 320 192 C 355 204, 380 202, 400 196 L 400 250 L 0 250 Z"
                                    fill="url(#dune2)" />
                                <!-- 驼队剪影 -->
                                <g fill="#3f3218">
                                    <ellipse cx="148" cy="143" rx="5" ry="3.2" />
                                    <circle cx="153" cy="139" r="1.8" />
                                    <ellipse cx="164" cy="145" rx="5" ry="3.2" />
                                    <circle cx="169" cy="141" r="1.8" />
                                    <ellipse cx="180" cy="147" rx="5" ry="3.2" />
                                    <circle cx="185" cy="143" r="1.8" />
                                    <ellipse cx="196" cy="149" rx="5" ry="3.2" />
                                    <circle cx="201" cy="145" r="1.8" />
                                </g>
                            </svg>
                            <!-- 舍夫沙万蓝城 · SVG 场景（视频封面） -->
                            <svg v-else viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice"
                                class="w-full h-full block">
                                <rect width="400" height="250" fill="#31598c" />
                                <rect width="400" height="132" fill="#3e6ba3" />
                                <rect x="252" width="148" height="250" fill="#2a4d7c" />
                                <rect x="248" y="0" width="4" height="250" fill="#1d3a5f" opacity="0.6" />
                                <!-- 门洞 -->
                                <rect x="52" y="70" width="46" height="92" fill="#1f3d63" />
                                <rect x="58" y="78" width="34" height="84" fill="#16294a" />
                                <!-- 蓝色台阶 -->
                                <rect x="96" y="182" width="212" height="16" fill="#8fb4de" />
                                <rect x="110" y="166" width="184" height="16" fill="#7fa8d6" />
                                <rect x="124" y="150" width="156" height="16" fill="#6f9bcd" />
                                <rect x="138" y="134" width="128" height="16" fill="#5f8ec4" />
                                <rect x="152" y="118" width="100" height="16" fill="#5283bc" />
                                <rect x="166" y="102" width="72" height="16" fill="#4677b2" />
                                <rect x="238" y="92" width="7" height="150" rx="3" fill="#1d3a5f" />
                                <!-- 盆栽与猫 -->
                                <g>
                                    <circle cx="82" cy="192" r="11" fill="#2e7d5b" />
                                    <circle cx="74" cy="200" r="8" fill="#256b4d" />
                                    <rect x="72" y="202" width="16" height="12" rx="2" fill="#8a5a33" />
                                    <ellipse cx="206" cy="176" rx="8" ry="4.5" fill="#12161d" />
                                    <circle cx="213" cy="172" r="3" fill="#12161d" />
                                </g>
                            </svg>
                            <!-- 视频播放按钮 -->
                            <div v-if="post.media === 'blue'"
                                class="absolute inset-0 flex items-center justify-center bg-black/10">
                                <span
                                    class="material-symbols-outlined ms-fill text-[64px] text-white/80 drop-shadow-lg">play_arrow</span>
                            </div>
                        </div>
                    </div>
                    <!-- 操作栏：点赞 / 评论 / 分享 -->
                    <div class="flex items-center gap-7 py-2.5 text-gray-500" :class="{ oblock: optimized }"
                        :style="stag(p * 4 + 3)">
                        <span class="flex items-center gap-1.5 text-[11px]">
                            <span class="material-symbols-outlined text-[15px]">favorite</span>{{ post.likes }}
                        </span>
                        <span class="flex items-center gap-1.5 text-[11px]">
                            <span class="material-symbols-outlined text-[15px]">mode_comment</span>{{ post.comments }}
                        </span>
                        <span class="flex items-center gap-1.5 text-[11px]">
                            <span class="material-symbols-outlined text-[14px]">north_east</span>分享
                        </span>
                    </div>
                </article>
            </div>

            <!-- ── naive 模式：普通实现 = 居中转圈，内容瞬间弹出 ── -->
            <div v-if="!optimized && naiveLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                <div class="spin w-7 h-7 rounded-full border-[2.5px] border-white/10 border-t-gray-400"></div>
                <span class="text-[11px] text-gray-600">加载中…</span>
            </div>
            <!-- naive 模式：内容出现瞬间的整页闪白 -->
            <div v-if="!optimized && flashOn" class="absolute inset-0 z-20 pointer-events-none flash"></div>

            <!-- ── optimized 模式：与真实内容同形状的骨架屏 + 共用一道斜向光带 ── -->
            <div v-if="optimized" class="absolute inset-0 z-10 skel overflow-hidden" :class="{ 'skel-hide': isLoaded }">
                <div class="shimmer-band"></div>
                <div class="relative px-4 pt-4">
                    <div v-for="p in 2" :key="p" class="pb-4 border-b border-white/[0.06]">
                        <!-- 圆头像 + 标题条 -->
                        <div class="flex items-center">
                            <div class="sk w-9 h-9 rounded-full shrink-0"></div>
                            <div class="ml-2.5 flex flex-col gap-[7px]">
                                <div class="sk h-2.5 w-14 rounded"></div>
                                <div class="sk h-2 w-24 rounded"></div>
                            </div>
                        </div>
                        <!-- 正文两条 -->
                        <div class="sk h-3 w-full rounded mt-3.5"></div>
                        <div class="sk h-3 w-3/5 rounded mt-2"></div>
                        <!-- 图片块 -->
                        <div class="sk w-full h-40 rounded-xl mt-3"></div>
                        <!-- 操作栏 -->
                        <div class="flex items-center gap-7 mt-3.5">
                            <div class="sk h-2.5 w-10 rounded"></div>
                            <div class="sk h-2.5 w-10 rounded"></div>
                            <div class="sk h-2.5 w-14 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* optimized：内容块初始隐藏 + 下移 8px；浮现时淡入 + 上移，逐块错开 60ms */
.oblock {
    opacity: 0;
    transform: translateY(8px);
}

.is-loaded .oblock {
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity 0.45s ease-out,
        transform 0.45s ease-out;
    transition-delay: calc(var(--i, 0) * 60ms);
}

/* optimized：骨架屏随数据到达同步淡出 */
.skel {
    background-color: #0d0e12;
    transition: opacity 0.35s ease;
}

.skel-hide {
    opacity: 0;
    pointer-events: none;
}

/* 骨架块底色 */
.sk {
    background: rgba(255, 255, 255, 0.09);
}

/* 所有骨架共用的一道柔和斜向光带，每 1.5s 从左往右扫过 */
.shimmer-band {
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 45%;
    pointer-events: none;
    background: linear-gradient(100deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 35%,
            rgba(255, 255, 255, 0.11) 50%,
            rgba(255, 255, 255, 0.05) 65%,
            rgba(255, 255, 255, 0) 100%);
    transform: translateX(-130%) skewX(-8deg);
    animation: shimmerSweep 1.5s linear infinite;
}

@keyframes shimmerSweep {
    from {
        transform: translateX(-130%) skewX(-8deg);
    }

    to {
        transform: translateX(350%) skewX(-8deg);
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

.ms-fill {
    font-variation-settings: 'FILL' 1, 'wght' 500;
}
</style>
