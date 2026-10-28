<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（思考点呼吸 + 按词模糊淡入 + 光标跟随 + 平滑滚动到底）
    // false = 普通实现（"做一个 AI 聊天，回复用打字机效果"：无思考反馈 + 逐字硬蹦 + 滚动生硬跳步）
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

const userOn = ref(false) // 用户第 6 条消息发出
const thinking = ref(false) // optimized：回复气泡内的 3 个呼吸小点（正在思考）
const streamCount = ref(0) // optimized：已淡入的词段数
const charCount = ref(0) // naive：打字机已蹦出的字符数
const caretOn = ref(false) // optimized：末尾闪烁光标

const scroller = ref(null)

let timers = []
let raf = 0
let follow = false // optimized：平滑跟随到底部
let naiveDone = false
let cur = 0

function later(fn, ms) {
    timers.push(setTimeout(fn, ms))
}

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}

function jumpToBottom() {
    const el = scroller.value
    if (el) {
        el.scrollTop = el.scrollHeight
        cur = el.scrollTop
    }
}

// optimized：rAF 逐帧平滑跟随到底部（气泡长高、页面贴底走）
function tick() {
    const el = scroller.value
    if (el) {
        const max = el.scrollHeight - el.clientHeight
        if (follow) {
            cur += (max - cur) * 0.12
            if (max - cur < 0.5) cur = max
            el.scrollTop = cur
        } else {
            cur = el.scrollTop
        }
    }
    raf = requestAnimationFrame(tick)
}

onMounted(() => {
    // 两侧组件周期一致、相位同步（CYCLE = 9.6s）：
    // t=0.5s   用户发出"用骨架屏还是转圈好？"（气泡弹出）
    // t=1.3s   左(naive)=无任何思考反馈，直接逐字打字机硬蹦 / 右(optimized)=立刻出现回复气泡，3 个小点呼吸跳动
    // t=2.7s   右=按词（2–4 字一段）淡入，每段从透明、4px 模糊变清晰，末尾闪烁光标跟着走，页面平滑跟随
    // t≈5.6s   左=78 字打完（滚动每 0.62s 硬跳一步）
    // t≈6.8s  右=22 段播完，光标再闪 0.7s 消失
    // t=9.6s   复位循环
    const T_SEND = 500
    const T_THINK = 1300
    const T_STREAM = 2700
    const SEG_MS = 185
    const CHAR_MS = 55
    const CYCLE = 9600
    nextTick(jumpToBottom)
    raf = requestAnimationFrame(tick)

    const loop = () => {
        later(() => {
            userOn.value = true
            if (props.optimized) {
                follow = true
            } else {
                jumpToBottom() // naive：发出瞬间硬跳到底
            }
        }, T_SEND)

        if (props.optimized) {
            later(() => { thinking.value = true }, T_THINK)
            later(() => {
                // 思考结束 → 同一气泡内按词淡入，光标出现
                thinking.value = false
                caretOn.value = true
                const step = (n) => later(() => {
                    streamCount.value = n
                    if (n < SEGS.length) {
                        step(n + 1)
                    } else {
                        later(() => {
                            caretOn.value = false
                            follow = false
                        }, 700)
                    }
                }, SEG_MS)
                step(1)
            }, T_STREAM)
        } else {
            later(() => {
                const typeStep = (n) => later(() => {
                    charCount.value = n
                    if (n < REPLY.length) {
                        typeStep(n + 1)
                    } else {
                        naiveDone = true
                    }
                }, CHAR_MS)
                typeStep(1)
                // naive：滚动生硬，每 0.62s 硬跳一步
                const jumpLoop = () => later(() => {
                    if (naiveDone) return
                    jumpToBottom()
                    jumpLoop()
                }, 620)
                jumpLoop()
            }, T_THINK)
        }

        later(() => {
            // 复位
            userOn.value = false
            thinking.value = false
            streamCount.value = 0
            charCount.value = 0
            caretOn.value = false
            follow = false
            naiveDone = false
            nextTick(jumpToBottom)
            loop()
        }, CYCLE)
    }
    loop()
})

onBeforeUnmount(() => {
    clearTimers()
    cancelAnimationFrame(raf)
})

// 历史消息（前 5 条静态，第 6 条用户消息 + AI 回复为动画主角）
const history = [
    { role: 'ai', text: '先看两点：首屏数据是不是太大，加载过程有没有给反馈。建议首屏接口只返回前 10 条，图片走懒加载。' },
    { role: 'user', text: '首页图片很多，第一次打开会一块一块跳出来。' },
    { role: 'ai', text: '给图片框先固定宽高比，用主色或模糊小图占位，原图到了再淡入，布局就不会跳。' },
    { role: 'user', text: '接口拆好了，现在加载时放了一个转圈。' },
    { role: 'ai', text: '转圈只能说明"在忙"，可以试试换成骨架屏，效果会好很多。' },
]
const userQ = '加载的时候，用骨架屏还是转圈好？'
const REPLY = '骨架屏比转圈好，因为它提前告诉你内容长什么样：头像在哪、标题多长、图片多大。眼睛先有了预期，等待就显得更短、更安心；数据到了直接填进去，页面也不会突然跳动。'

// optimized：按词（中文 2–4 个字一段）切分
const SEGS = [
    '骨架屏', '比转圈', '好，', '因为它', '提前', '告诉你', '内容', '长什么样：',
    '头像在哪、', '标题多长、', '图片多大。', '眼睛先', '有了预期，', '等待就',
    '显得更短、', '更安心；', '数据到了', '直接填', '进去，', '页面也', '不会突然', '跳动。',
]
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

        <!-- 会话头部：AI 设计助手（optimized 多一个"在线"在线状态） -->
        <div class="shrink-0 px-4 pt-1.5 pb-2.5 flex items-center gap-2.5 border-b border-white/[0.06]">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0"
                :class="optimized ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white' : 'bg-gray-600 text-gray-200'">
                AI
            </div>
            <div class="flex flex-col">
                <span class="text-[13px] font-semibold text-white leading-tight">AI 设计助手</span>
                <span v-if="optimized" class="text-[9.5px] text-emerald-400 leading-tight mt-0.5">在线</span>
            </div>
        </div>

        <!-- 消息列表 -->
        <div ref="scroller" class="relative flex-1 overflow-y-auto chat-scroll">
            <!-- 顶部留白：保证列表溢出，滚动跟随可见 -->
            <div class="h-[290px]"></div>

            <div class="px-3.5 flex flex-col gap-2.5 pb-3">
            <!-- 历史消息 -->
            <template v-for="(m, i) in history" :key="i">
                <!-- AI -->
                <div v-if="m.role === 'ai'" class="flex items-end gap-1.5">
                    <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0 mb-0.5"
                        :class="optimized ? 'bg-violet-500 text-white' : 'bg-gray-600 text-gray-200'">AI</div>
                    <div class="max-w-[76%] rounded-[14px] rounded-bl-[4px] px-3 py-2 text-[11.5px] leading-[1.55]"
                        :class="optimized ? 'bg-[#23252e] text-gray-200' : 'bg-[#1d1f26] text-gray-300'">{{ m.text }}</div>
                </div>
                <!-- 用户 -->
                <div v-else class="flex items-end gap-1.5 justify-end">
                    <div class="max-w-[76%] rounded-[14px] rounded-br-[4px] px-3 py-2 text-[11.5px] leading-[1.55]"
                        :class="optimized ? 'bg-[#2e6bf6] text-white' : 'bg-[#3a4150] text-gray-300'">{{ m.text }}</div>
                    <svg class="w-[22px] h-[22px] shrink-0 mb-0.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="12" fill="#c98d4f" />
                        <path d="M4 9 L6 3 L10 7 Z" fill="#a86f38" />
                        <path d="M20 9 L18 3 L14 7 Z" fill="#a86f38" />
                        <circle cx="8.2" cy="11" r="1.5" fill="#3a2a1a" />
                        <circle cx="15.8" cy="11" r="1.5" fill="#3a2a1a" />
                        <ellipse cx="12" cy="15.5" rx="3.4" ry="2.6" fill="#efd9bd" />
                        <ellipse cx="12" cy="14.6" rx="1.2" ry="0.9" fill="#3a2a1a" />
                    </svg>
                </div>
            </template>

            <!-- 用户第 6 条消息（发出，弹出动画） -->
            <div v-if="userOn" class="flex items-end gap-1.5 justify-end">
                <div class="pop max-w-[76%] rounded-[14px] rounded-br-[4px] px-3 py-2 text-[11.5px] leading-[1.55]"
                    :class="optimized ? 'bg-[#2e6bf6] text-white' : 'bg-[#3a4150] text-gray-300'">{{ userQ }}</div>
                <svg class="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#c98d4f" />
                    <path d="M4 9 L6 3 L10 7 Z" fill="#a86f38" />
                    <path d="M20 9 L18 3 L14 7 Z" fill="#a86f38" />
                    <circle cx="8.2" cy="11" r="1.5" fill="#3a2a1a" />
                    <circle cx="15.8" cy="11" r="1.5" fill="#3a2a1a" />
                    <ellipse cx="12" cy="15.5" rx="3.4" ry="2.6" fill="#efd9bd" />
                    <ellipse cx="12" cy="14.6" rx="1.2" ry="0.9" fill="#3a2a1a" />
                </svg>
            </div>

            <!-- AI 回复（动画主角） -->
            <div v-if="optimized ? (thinking || streamCount > 0) : charCount > 0" class="flex items-end gap-1.5">
                <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0 mb-0.5"
                    :class="optimized ? 'bg-violet-500 text-white' : 'bg-gray-600 text-gray-200'">AI</div>
                <div class="reply-bubble max-w-[76%] rounded-[14px] rounded-bl-[4px] px-3 py-2 text-[11.5px] leading-[1.6]"
                    :class="optimized ? 'bg-[#23252e] text-gray-200' : 'bg-[#1d1f26] text-gray-300'">
                    <!-- optimized：3 个呼吸小点 → 按词淡入 + 闪烁光标 -->
                    <template v-if="optimized">
                        <div v-if="thinking" class="flex items-center gap-1.5 h-[18px]">
                            <span class="bdot"></span><span class="bdot"></span><span class="bdot"></span>
                        </div>
                        <template v-else>
                            <span v-for="(s, i) in SEGS.slice(0, streamCount)" :key="i" class="wseg">{{ s }}</span><span
                                v-if="caretOn" class="caret"></span>
                        </template>
                    </template>
                    <!-- naive：打字机逐字硬蹦 -->
                    <template v-else>{{ REPLY.slice(0, charCount) }}</template>
                </div>
            </div>
            </div>
        </div>

        <!-- 输入栏 -->
        <div class="shrink-0 px-4 pt-2 pb-4 flex items-center gap-2.5 border-t border-white/[0.06]">
            <div class="flex-1 h-9 rounded-full bg-white/[0.07] flex items-center px-3.5">
                <span class="text-[11px] text-gray-500">输入消息…</span>
            </div>
            <!-- naive：灰字"发送"按钮 / optimized：蓝色渐变圆形发送键 -->
            <span v-if="!optimized" class="text-[12px] text-gray-400 font-medium shrink-0">发送</span>
            <div v-else
                class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(46,107,246,0.45)] shrink-0">
                <span class="material-symbols-outlined text-white text-[15px]">arrow_upward</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 隐藏滚动条（滚动由 JS 驱动） */
.chat-scroll {
    scrollbar-width: none;
}

.chat-scroll::-webkit-scrollbar {
    display: none;
}

/* optimized：词段淡入 —— 从透明、4px 模糊变清晰 */
.wseg {
    animation: wIn 0.3s ease-out both;
}

@keyframes wIn {
    from {
        opacity: 0;
        filter: blur(4px);
    }

    to {
        opacity: 1;
        filter: blur(0);
    }
}

/* optimized：末尾闪烁光标 */
.caret {
    display: inline-block;
    width: 2px;
    height: 13px;
    margin-left: 2px;
    vertical-align: -2px;
    border-radius: 1px;
    background: #60a5fa;
    animation: blink 0.8s steps(1) infinite;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

/* optimized：3 个呼吸跳动的小点（正在思考） */
.bdot {
    width: 5px;
    height: 5px;
    border-radius: 9999px;
    background: #9ca3af;
    animation: breathe 1.1s ease-in-out infinite;
}

.bdot:nth-child(2) {
    animation-delay: 0.18s;
}

.bdot:nth-child(3) {
    animation-delay: 0.36s;
}

@keyframes breathe {

    0%,
    100% {
        transform: translateY(0) scale(0.85);
        opacity: 0.4;
    }

    50% {
        transform: translateY(-4px) scale(1);
        opacity: 1;
    }
}

/* 用户消息发出弹出 */
.pop {
    animation: popIn 0.3s ease-out both;
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.96);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* optimized：回复气泡高度平滑长高（配合词段淡入弱化换行突跳） */
.reply-bubble {
    transition: min-height 0.25s ease;
    min-height: 18px;
}
</style>
