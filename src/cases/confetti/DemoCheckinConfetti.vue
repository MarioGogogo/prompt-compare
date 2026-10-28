<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（按钮锚点 ±35° 锥形喷发 + 重力/翻面/空气阻力 + 2.5s 起错峰淡出）
    // false = 普通实现（"做一个打卡按钮，打卡成功后撒花"：全屏中心炸开 + 无物理细节 + 同时消失、长时间挡字）
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

const pressed = ref(false) // optimized：按钮"先压一下再弹起"
const done = ref(false) // 打卡成功：29→30 天 / 徽章解锁 / 按钮变"已打卡 ✓"

const wrap = ref(null)
const btn = ref(null)
const canvas = ref(null)

let timers = []
let raf = 0
let particles = []
let ctx = null
let dpr = 1
let last = 0

function later(fn, ms) {
    timers.push(setTimeout(fn, ms))
}

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}

// 5 种主题色（正面 / 背面变暗）
const COLORS = [
    { front: '#f6c445', back: '#8a6a1d' },
    { front: '#34d399', back: '#16694d' },
    { front: '#38bdf8', back: '#155e80' },
    { front: '#a78bfa', back: '#4c3d84' },
    { front: '#fb7185', back: '#83384a' },
]

function makeParticle(x, y, W, H) {
    const c = COLORS[(Math.random() * COLORS.length) | 0]
    const shape = (Math.random() * 3) | 0 // 0 长条 / 1 圆片 / 2 小方块
    if (props.optimized) {
        // 锥形喷发：正上方左右 35° 内，速度随机；重力回落 + 空气阻力 + 左右飘 + 绕自身翻面（背面变暗）
        const spread = (35 * Math.PI) / 180
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2 * spread
        const sp = 6.5 + Math.random() * 6.5
        return {
            x, y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            g: 0.22,
            drag: 0.988,
            shape,
            front: c.front,
            back: c.back,
            w: shape === 0 ? 9 : 0,
            h: shape === 0 ? 3.5 : 0,
            r: shape === 1 ? 2.4 : shape === 2 ? 3.4 : 0,
            spin: Math.random() * Math.PI * 2,
            spinV: (0.12 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1),
            tilt: (Math.random() - 0.5) * 0.6,
            swayPhase: Math.random() * Math.PI * 2,
            swayAmp: 0.25 + Math.random() * 0.45,
            swayFreq: 0.05 + Math.random() * 0.06,
            born: performance.now(),
            fadeStart: 2500 + Math.random() * 900, // 2.5s 起各自错峰淡出
            fadeDur: 450,
        }
    }
    // naive：从屏幕上部向四面八方炸开，片更大、慢速满屏乱飘，寿命一致 → 最后同时消失
    const ang = Math.random() * Math.PI * 2
    const sp = 0.8 + Math.random() * 3.7
    return {
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        g: 0.012,
        drag: 0.9985,
        shape,
        front: c.front,
        back: c.front,
        w: shape === 0 ? 13 : 0,
        h: shape === 0 ? 5 : 0,
        r: shape === 1 ? 3.6 : shape === 2 ? 5 : 0,
        spin: Math.random() * Math.PI * 2,
        spinV: 0,
        tilt: (Math.random() - 0.5) * 0.9,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.2 + Math.random() * 0.25,
        swayFreq: 0.04 + Math.random() * 0.04,
        born: performance.now(),
        fadeStart: 6300, // 统一寿命，最后 200ms 全体一起淡出（同时消失、长期挡字）
        fadeDur: 200,
    }
}

function burst() {
    const cv = canvas.value
    if (!cv) return
    const W = cv.width / dpr
    const H = cv.height / dpr
    let sx = W / 2
    let sy = H - 90
    if (props.optimized) {
        // 发射锚点：打卡按钮中心
        const b = btn.value
        const el = wrap.value
        if (b && el) {
            const r = b.getBoundingClientRect()
            const w = el.getBoundingClientRect()
            sx = r.left + r.width / 2 - w.left
            sy = r.top + r.height / 2 - w.top
        }
    } else {
        sy = H * 0.4
    }
    const n = props.optimized ? 100 : 170
    for (let i = 0; i < n; i++) particles.push(makeParticle(sx, sy, W, H))
}

function fit() {
    const cv = canvas.value
    const el = wrap.value
    if (!cv || !el) return
    dpr = window.devicePixelRatio || 1
    cv.width = el.clientWidth * dpr
    cv.height = el.clientHeight * dpr
    ctx = cv.getContext('2d')
}

// rAF 逐帧物理更新（dt 归一到 60fps 帧步长）
function tick(now) {
    const cv = canvas.value
    if (cv && ctx) {
        const dt = Math.min(48, now - (last || now))
        last = now
        const k = dt / 16.7
        const W = cv.width / dpr
        const H = cv.height / dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)
        const alive = []
        for (const p of particles) {
            const age = now - p.born
            p.vy += p.g * k
            p.vx *= Math.pow(p.drag, k) // 空气阻力：越落越慢
            p.vy *= Math.pow(p.drag, k)
            p.x += p.vx * k
            p.y += p.vy * k
            if (p.swayAmp) p.x += Math.sin(age * p.swayFreq + p.swayPhase) * p.swayAmp * k // 下落左右飘
            p.spin += p.spinV * k
            let a = 1
            if (age > p.fadeStart) a = Math.max(0, 1 - (age - p.fadeStart) / p.fadeDur)
            if (a <= 0 || p.y > H + 30) continue
            alive.push(p)
            ctx.save()
            ctx.globalAlpha = a
            ctx.translate(p.x, p.y)
            ctx.rotate(p.tilt)
            ctx.scale(Math.cos(p.spin) || 0.02, 1) // 绕自身翻面
            ctx.fillStyle = Math.cos(p.spin) < 0 ? p.back : p.front // 背面颜色变暗
            if (p.shape === 0) {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
            } else if (p.shape === 1) {
                ctx.beginPath()
                ctx.arc(0, 0, p.r, 0, Math.PI * 2)
                ctx.fill()
            } else {
                ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r)
            }
            ctx.restore()
        }
        particles = alive
    }
    raf = requestAnimationFrame(tick)
}

onMounted(() => {
    // 两侧组件周期一致、相位同步（CYCLE = 8.6s）：
    // t=1.0s   右(optimized)=按钮先压一下 / 左(naive)=直接爆发
    // t=1.15s  撒花开始：右=从按钮位置 ±35° 锥形向上喷 100 片 / 左=从屏幕中心全向炸开 130 片
    //          同时 29→30 天、进度条补满、「30 天徽章」已解锁、按钮变"已打卡 ✓"
    // t≈3.9s   右=2.5s 起各自错峰淡出完毕，画面干净
    // t≈7.5s   左=寿命一致，130 片同时消失（此前一直炸满屏挡字）
    // t=8.6s   复位循环
    fit()
    raf = requestAnimationFrame(tick)

    const T_PRESS = 1000
    const T_BURST = 1150
    const CYCLE = 8600

    const loop = () => {
        later(() => {
            if (props.optimized) pressed.value = true
        }, T_PRESS)
        later(() => {
            pressed.value = false
            done.value = true
            burst()
        }, T_BURST)
        later(() => {
            pressed.value = false
            done.value = false
            particles = []
            loop()
        }, CYCLE)
    }
    loop()
})

onBeforeUnmount(() => {
    clearTimers()
    cancelAnimationFrame(raf)
    particles = []
})

const week = ['一', '二', '三', '四', '五', '六', '日']

const tasks = [
    { icon: 'directions_run', color: '#34d399', name: '晨跑 3 公里', sub: '已完成 · 07:12', state: 'green' },
    { icon: 'menu_book', color: '#38bdf8', name: '阅读 20 页', sub: '已完成 · 08:40', state: 'blue' },
    { icon: 'water_drop', color: '#a78bfa', name: '喝水 8 杯', sub: '6/8 杯', state: 'todo' },
]
</script>

<template>
    <div ref="wrap" class="relative w-full h-full bg-[#0d0e12] flex flex-col select-none overflow-hidden">
        <!-- 状态栏 -->
        <div class="shrink-0 pt-3 px-6 h-9 flex items-center justify-between text-white">
            <span class="text-[12px] font-semibold tracking-wide">9:41</span>
            <div class="flex items-center gap-1 text-gray-200">
                <span class="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span class="material-symbols-outlined text-[13px]">wifi</span>
                <span class="material-symbols-outlined text-[14px]">battery_5_bar</span>
            </div>
        </div>

        <!-- 导航栏 -->
        <div class="shrink-0 px-4 pt-1.5 pb-2.5 flex items-center justify-between border-b border-white/[0.06]">
            <span class="material-symbols-outlined text-[19px] text-gray-300">arrow_back_ios_new</span>
            <span class="text-[14px] font-semibold text-white">每日打卡</span>
            <span class="material-symbols-outlined text-[19px] text-gray-300">more_horiz</span>
        </div>

        <!-- 连续打卡卡片 -->
        <div class="shrink-0 mx-4 mt-3.5 rounded-2xl bg-[#1a1c23] p-4">
            <div class="flex items-start justify-between">
                <div>
                    <div class="text-[11px] text-gray-400">已连续打卡</div>
                    <div class="flex items-baseline gap-1.5 mt-1.5">
                        <span :key="done ? 'd30' : 'd29'" class="num text-[46px] leading-none font-extrabold text-[#f6c445]">{{ done ? 30 : 29 }}</span>
                        <span class="text-[15px] text-gray-300 font-semibold">天</span>
                    </div>
                </div>
                <div class="w-12 h-12 rounded-[14px] bg-[#f6c445] flex items-center justify-center">
                    <span class="material-symbols-outlined text-[26px] text-[#23252e] ms-fill">water_drop</span>
                </div>
            </div>
            <div class="mt-4 h-[5px] rounded-full bg-white/10 overflow-hidden">
                <div class="h-full rounded-full bg-[#f6c445] transition-all duration-500 ease-out"
                    :style="{ width: done ? '100%' : '96.5%' }"></div>
            </div>
            <div class="mt-2.5 text-[11px] min-h-[15px]">
                <span v-if="!done" class="text-gray-500">再坚持 1 天，解锁「30 天徽章」</span>
                <span v-else class="badge-in text-[#f6c445] font-semibold">「30 天徽章」已解锁</span>
            </div>
        </div>

        <!-- 本周 -->
        <div class="shrink-0 mx-4 mt-3 rounded-2xl bg-[#1a1c23] px-3.5 py-3">
            <div class="flex items-center justify-between">
                <span class="text-[11px] text-gray-300 font-medium">本周</span>
                <span class="text-[10px] text-gray-500">10 月 第 2 周</span>
            </div>
            <div class="mt-2.5 grid grid-cols-7">
                <div v-for="(d, i) in week" :key="d" class="flex flex-col items-center gap-1.5">
                    <span class="text-[9.5px]" :class="i === 4 && !done ? 'text-[#f6c445]' : 'text-gray-500'">{{ d }}</span>
                    <div class="w-[26px] h-[26px] rounded-full flex items-center justify-center transition-colors duration-300"
                        :class="(i < 4 || (i === 4 && done))
                            ? 'bg-[#f6c445]'
                            : (i === 4 ? 'border-[1.5px] border-[#f6c445]/80' : 'bg-white/[0.06]')">
                        <span v-if="i < 4 || (i === 4 && done)"
                            class="material-symbols-outlined text-[14px] text-[#23252e] ms-fill">check</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 今日任务 -->
        <div class="shrink-0 mx-4 mt-3 flex flex-col gap-2">
            <div v-for="t in tasks" :key="t.name" class="rounded-2xl bg-[#1a1c23] px-3.5 py-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: t.color + '1f' }">
                    <span class="material-symbols-outlined text-[18px] ms-fill" :style="{ color: t.color }">{{ t.icon }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-[13px] text-white font-semibold leading-tight">{{ t.name }}</div>
                    <div class="text-[10.5px] text-gray-500 mt-0.5">{{ t.sub }}</div>
                </div>
                <div v-if="t.state !== 'todo'"
                    class="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
                    :class="t.state === 'green' ? 'bg-[#34d399]' : 'bg-[#38bdf8]'">
                    <span class="material-symbols-outlined text-[13px] text-[#0d0e12] ms-fill">check</span>
                </div>
                <div v-else class="w-[22px] h-[22px] rounded-full border-[1.5px] border-white/15 shrink-0"></div>
            </div>
        </div>

        <!-- 打卡按钮 -->
        <div class="mt-auto shrink-0 px-4">
            <button ref="btn"
                class="w-full h-[52px] rounded-full text-[17px] font-bold transition-all duration-150 ease-out"
                :class="[
                    pressed ? 'scale-[0.94] brightness-90' : 'scale-100',
                    done ? 'bg-[#2a2d36] text-[#f6c445]' : 'bg-[#f6c445] text-[#23252e] shadow-[0_6px_20px_rgba(246,196,69,0.25)]',
                ]">
                {{ done ? '已打卡 ✓' : '打卡' }}
            </button>
            <div class="text-center text-[10.5px] text-gray-500 mt-2.5 pb-3">今天 10 月 11 日 · 已有 2.3 万人打卡</div>
        </div>

        <!-- 撒花 canvas（覆盖全屏） -->
        <canvas ref="canvas" class="absolute inset-0 w-full h-full z-20 pointer-events-none"></canvas>
    </div>
</template>

<style scoped>
/* 29→30 数字弹跳 */
.num {
    display: inline-block;
    animation: numPop 0.45s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

@keyframes numPop {
    from {
        transform: scale(0.7);
        opacity: 0.4;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* 徽章解锁文字淡入上移 */
.badge-in {
    animation: badgeIn 0.35s ease-out both;
}

@keyframes badgeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
