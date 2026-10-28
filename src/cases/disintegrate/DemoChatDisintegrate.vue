<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
    // true = 结构化提示词效果（像素碎沙 + 左→右风扫擦除 + 右上飘散变小变淡 + 300ms 平滑补位）
    // false = 普通实现（"做一个聊天消息删除功能"：整条气泡一起淡掉 + 下方消息瞬间跳位）
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

const menuOn = ref(false) // 长按弹出的操作菜单（复制 / 删除）
const pressed = ref(false) // 长按按压态（气泡压暗）
const fadeOut = ref(false) // naive：整条气泡一起淡掉
const collapsed = ref(false) // 主角气泡占位塌陷（naive 瞬间 / optimized 300ms 过渡）
const erasePct = ref(0) // optimized：气泡从左往右被擦掉的进度 0-100
const wrapH = ref(46) // 主角气泡 wrapper 高度（塌陷动画用）

const wrap = ref(null)
const bubble = ref(null)
const bubbleWrap = ref(null)
const canvas = ref(null)

const SWEEP = 900 // 风扫：从左往右 0.8s 扫完（留一点余量）
const LIFE = 1000 // 每粒约 1 秒飘散消失

let timers = []
let raf = 0
let particles = []
let ctx = null
let dpr = 1
let last = 0
let sweepStart = 0

function later(fn, ms) {
    timers.push(setTimeout(fn, ms))
}

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}

function measure() {
    if (bubbleWrap.value) wrapH.value = bubbleWrap.value.offsetHeight
}

// ---------- 碎沙粒子：离屏渲染气泡 → 按像素采样 → 每粒取原位置颜色 ----------
function makeSand() {
    const cv = canvas.value
    const b = bubble.value
    const root = wrap.value
    if (!cv || !b || !root) return
    dpr = window.devicePixelRatio || 1
    cv.width = root.clientWidth * dpr
    cv.height = root.clientHeight * dpr
    ctx = cv.getContext('2d')

    const br = b.getBoundingClientRect()
    const rr = root.getBoundingClientRect()
    const bx = br.left - rr.left
    const by = br.top - rr.top
    const bw = br.width
    const bh = br.height

    // 离屏画气泡本体：蓝色圆角矩形 + 白色文字（右下角小圆角，同气泡样式）
    const s = 2 // 放大采样，文字边缘更清晰
    const off = document.createElement('canvas')
    off.width = bw * s
    off.height = bh * s
    const o = off.getContext('2d')
    o.scale(s, s)
    const r = 13
    const rb = 4
    o.beginPath()
    o.moveTo(r, 0)
    o.lineTo(bw - r, 0)
    o.arcTo(bw, 0, bw, r, r)
    o.lineTo(bw, bh - rb)
    o.arcTo(bw, bh, bw - rb, bh, rb)
    o.lineTo(r, bh)
    o.arcTo(0, bh, 0, bh - r, r)
    o.lineTo(0, r)
    o.arcTo(0, 0, r, 0, r)
    o.closePath()
    o.fillStyle = '#2e6bf6'
    o.fill()
    o.fillStyle = '#ffffff'
    o.font = '500 11.5px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif'
    o.textBaseline = 'middle'
    o.fillText('等我挑一下', 12, bh / 2 + 0.5)

    // 按像素网格采样 → 一粒粒小沙
    const img = o.getImageData(0, 0, off.width, off.height).data
    const step = 1.4 * s
    const now = performance.now()
    for (let py = 0; py < off.height; py += step) {
        for (let px = 0; px < off.width; px += step) {
            const i = ((py | 0) * off.width + (px | 0)) * 4
            if (img[i + 3] > 70) {
                const lx = px / s
                const ly = py / s
                particles.push({
                    ox: bx + lx,
                    oy: by + ly,
                    c: `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`,
                    // 从左往右依次散开（像一阵风扫过）：左边的粒先起飞
                    delay: (lx / bw) * SWEEP + Math.random() * 70,
                    vx: 26 + Math.random() * 62, // 往右上方飘走
                    vy: -(14 + Math.random() * 58),
                    jf: 5 + Math.random() * 7, // 随机抖动
                    jp: Math.random() * Math.PI * 2,
                    sz: 1.1 + Math.random() * 0.9,
                    born: now,
                })
            }
        }
    }
}

// rAF：驱动擦除进度 + 沙粒物理（右上飘 + 抖动 + 变小变淡）
function tick(now) {
    const cv = canvas.value
    if (cv && ctx) {
        const dt = Math.min(48, now - (last || now)) / 1000
        last = now
        if (sweepStart) {
            const el = now - sweepStart
            erasePct.value = Math.min(100, (el / SWEEP) * 100)
        }
        const W = cv.width / dpr
        const H = cv.height / dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)
        const alive = []
        for (const p of particles) {
            const t = (now - p.born - p.delay) / 1000 // 该粒已飞行秒数
            if (t < 0) {
                alive.push(p)
                continue // 还没被风扫到：先不画（气泡本体还在）
            }
            const a = t / (LIFE / 1000) // 生命进度 0→1
            if (a >= 1) continue
            const jit = Math.sin(t * p.jf + p.jp) * 2.2
            const x = p.ox + p.vx * t + jit
            // 往右上方飘，越飘越快一点（风感）
            const y = p.oy + p.vy * t - 26 * t * t
            const sc = 1 - a * 0.72 // 边飘边变小
            ctx.globalAlpha = Math.max(0, 1 - a * a) // 边飘边变淡
            ctx.fillStyle = p.c
            const sz = p.sz * sc + 0.35
            ctx.fillRect(x, y, sz, sz)
            alive.push(p)
        }
        particles = alive
        ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(tick)
}

onMounted(() => {
    // 两侧组件周期一致、相位同步（CYCLE = 8.6s）：
    // t=0.7s   长按"等我挑一下"气泡 → 弹出菜单（复制 / 删除），气泡压暗
    // t=2.1s   点"删除"：
    //          左(naive)  = 整条气泡一起淡掉（0.3s），占位瞬间塌陷，下面消息生硬跳上来
    //          右(optimized) = 气泡按像素拆成约 1500 粒小沙，从左往右 0.9s 扫完，
    //                          每粒往右上方飘走带随机抖动、边飘边变小变淡约 1s 消失；
    //                          同时原气泡从左往右被一点点擦掉（不整条消失）
    // t=3.2s   右=散开近尾声 → 占位 300ms 平滑塌陷，下面消息平滑上移补位
    // t≈4.0s   右=沙粒全部消散，画面干净
    // t=8.6s   复位循环
    nextTick(measure)
    raf = requestAnimationFrame(tick)

    const T_MENU = 700
    const T_DEL = 2100
    const T_COLLAPSE = 3200
    const CYCLE = 8600

    const loop = () => {
        later(() => {
            pressed.value = true
            menuOn.value = true
        }, T_MENU)

        later(() => {
            // 点"删除"
            menuOn.value = false
            pressed.value = false
            if (props.optimized) {
                makeSand()
                sweepStart = performance.now()
                later(() => {
                    // 散开近尾声：占位平滑塌陷 → 下面消息 300ms 上移补位
                    collapsed.value = true
                }, T_COLLAPSE - T_DEL)
            } else {
                // 一句话做的：整条一起淡掉
                fadeOut.value = true
                later(() => {
                    collapsed.value = true // 占位瞬间塌陷，下面消息生硬跳位
                }, 320)
            }
        }, T_DEL)

        later(() => {
            // 复位
            menuOn.value = false
            pressed.value = false
            fadeOut.value = false
            collapsed.value = false
            erasePct.value = 0
            sweepStart = 0
            particles = []
            nextTick(measure)
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

// 阿杰头像（内联 SVG：短发 + 胡子的男性头像）
const avatarSvg = `
<svg viewBox="0 0 24 24" class="w-full h-full">
  <circle cx="12" cy="12" r="12" fill="#465062"/>
  <circle cx="12" cy="10" r="4.6" fill="#d9a679"/>
  <path d="M7.4 9.4 C7.6 5.6 16.4 5.6 16.6 9.4 L16.6 8.2 C16.2 5.4 7.8 5.4 7.4 8.2 Z" fill="#2c2620"/>
  <path d="M7.4 9 C7.7 6.2 9.4 5.1 12 5.1 C14.6 5.1 16.3 6.2 16.6 9 C15.4 7.4 14 6.9 12 6.9 C10 6.9 8.6 7.4 7.4 9 Z" fill="#3a3129"/>
  <ellipse cx="12" cy="13.4" rx="2.5" ry="1.5" fill="#6b5138"/>
  <ellipse cx="12" cy="12.9" rx="1.1" ry="0.7" fill="#c98d6b"/>
  <circle cx="10.2" cy="9.6" r="0.75" fill="#2c2620"/>
  <circle cx="13.8" cy="9.6" r="0.75" fill="#2c2620"/>
  <rect x="9.1" y="8.9" width="2.2" height="1.5" rx="0.75" fill="none" stroke="#2c2620" stroke-width="0.55"/>
  <rect x="12.7" y="8.9" width="2.2" height="1.5" rx="0.75" fill="none" stroke="#2c2620" stroke-width="0.55"/>
  <path d="M4.5 21 C5.5 16.8 8.4 15.2 12 15.2 C15.6 15.2 18.5 16.8 19.5 21 Z" fill="#5b7a9d"/>
  <path d="M10.6 14.6 h2.8 v1.6 c0 1 -2.8 1 -2.8 0 Z" fill="#d9a679"/>
</svg>`

// 海边日落照片（内联 SVG：粉紫黄昏 + 落日 + 海浪白沫 + 沙滩）
const photoSvg = `
<svg viewBox="0 0 232 156" class="w-full h-full" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#33205c"/>
      <stop offset="0.42" stop-color="#7c4472"/>
      <stop offset="0.72" stop-color="#d47d6a"/>
      <stop offset="1" stop-color="#f0b078"/>
    </linearGradient>
    <linearGradient id="dsea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8a4a66"/>
      <stop offset="0.35" stop-color="#4a3160"/>
      <stop offset="1" stop-color="#241c3e"/>
    </linearGradient>
    <radialGradient id="dsun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffe9c4"/>
      <stop offset="0.55" stop-color="#ffc98a"/>
      <stop offset="1" stop-color="#ffc98a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="232" height="96" fill="url(#dsky)"/>
  <circle cx="118" cy="88" r="30" fill="url(#dsun)" opacity="0.9"/>
  <circle cx="118" cy="88" r="13" fill="#ffdba6"/>
  <rect x="26" y="30" width="58" height="5" rx="2.5" fill="#4a3060" opacity="0.55"/>
  <rect x="44" y="40" width="36" height="4" rx="2" fill="#4a3060" opacity="0.4"/>
  <rect x="150" y="22" width="52" height="5" rx="2.5" fill="#4a3060" opacity="0.5"/>
  <rect y="96" width="232" height="60" fill="url(#dsea)"/>
  <path d="M0 96 h232 v3 q-40 4 -78 0 t-80 0 t-74 0 Z" fill="#f4c493" opacity="0.85"/>
  <path d="M18 112 q14 -5 28 0 t28 0" stroke="#e8a7c0" stroke-width="2.4" fill="none" opacity="0.6" stroke-linecap="round"/>
  <path d="M120 122 q16 -5 32 0 t32 0" stroke="#b97ba6" stroke-width="2.2" fill="none" opacity="0.5" stroke-linecap="round"/>
  <path d="M40 136 q18 -6 36 0 t36 0" stroke="#8f6b9e" stroke-width="2.4" fill="none" opacity="0.5" stroke-linecap="round"/>
  <path d="M150 110 q12 -4 24 0 t24 0" stroke="#f0b9c8" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
  <ellipse cx="60" cy="106" rx="10" ry="1.6" fill="#ffe0b0" opacity="0.7"/>
  <ellipse cx="176" cy="104" rx="8" ry="1.4" fill="#ffe0b0" opacity="0.6"/>
</svg>`
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

        <!-- 会话头部：阿杰（在线） -->
        <div class="shrink-0 px-4 pt-1.5 pb-2.5 flex items-center justify-between border-b border-white/[0.06]">
            <span class="material-symbols-outlined text-[19px] text-gray-300">arrow_back_ios_new</span>
            <div class="flex flex-col items-center">
                <span class="text-[13.5px] font-semibold text-white leading-tight">阿杰</span>
                <span class="text-[9.5px] text-emerald-400 leading-tight mt-0.5">在线</span>
            </div>
            <span class="material-symbols-outlined text-[19px] text-gray-300">more_horiz</span>
        </div>

        <!-- 消息列表 -->
        <div class="relative flex-1 overflow-hidden">
            <div class="px-3.5 pt-3 flex flex-col">
                <!-- 时间分割线 -->
                <div class="text-center text-[9.5px] text-gray-500 mb-3">昨天 21:08</div>

                <!-- 阿杰：海边那几张照片发我呗 -->
                <div class="flex items-end gap-1.5 mb-2.5">
                    <div class="w-[24px] h-[24px] rounded-full overflow-hidden shrink-0 mb-0.5" v-html="avatarSvg"></div>
                    <div class="max-w-[76%] rounded-[14px] rounded-bl-[4px] bg-[#2a2c34] px-3 py-2 text-[11.5px] leading-[1.55] text-gray-200">
                        海边那几张照片发我呗
                    </div>
                </div>

                <!-- ★ 主角：「等我挑一下」—— 长按删除，碎成沙子 -->
                <div ref="bubbleWrap" class="relative flex justify-end mb-2.5 origin-bottom transition-all"
                    :style="collapsed
                        ? { height: '0px', marginBottom: '0px', overflow: 'hidden', opacity: 0, transition: props.optimized ? 'height 0.3s ease, margin-bottom 0.3s ease' : 'none' }
                        : { height: wrapH + 'px', transition: props.optimized ? 'height 0.3s ease, margin-bottom 0.3s ease' : 'none' }">
                    <!-- 长按菜单（两侧都有，差异在删除后的表现） -->
                    <div v-if="menuOn"
                        class="menu-pop absolute bottom-[calc(100%+7px)] right-1 z-30 flex flex-col rounded-[10px] bg-[#48494e] shadow-[0_6px_20px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div class="px-5 py-[7px] text-[11.5px] text-gray-200 border-b border-white/[0.08]">复制</div>
                        <div class="px-5 py-[7px] text-[11.5px] text-[#fa5151] font-medium">删除</div>
                    </div>
                    <div ref="bubble"
                        class="rounded-[14px] rounded-br-[4px] bg-[#2e6bf6] px-3 py-2 text-[11.5px] leading-[1.55] text-white"
                        :class="[
                            pressed ? 'brightness-[0.72]' : '',
                            fadeOut ? 'naive-fade' : '',
                        ]"
                        :style="props.optimized ? { clipPath: `inset(0 0 0 ${erasePct}%)` } : {}">
                        等我挑一下
                    </div>
                </div>

                <!-- 我：发错了，是这张 -->
                <div class="flex justify-end mb-2.5">
                    <div class="max-w-[76%] rounded-[14px] rounded-br-[4px] bg-[#2e6bf6] px-3 py-2 text-[11.5px] leading-[1.55] text-white">
                        发错了，是这张
                    </div>
                </div>

                <!-- 我：海边日落照片 -->
                <div class="flex justify-end mb-2.5">
                    <div class="w-[176px] h-[118px] rounded-[14px] rounded-br-[4px] overflow-hidden bg-[#241c3e]" v-html="photoSvg"></div>
                </div>

                <!-- 阿杰：这张绝了！ -->
                <div class="flex items-end gap-1.5 mb-2.5">
                    <div class="w-[24px] h-[24px] rounded-full overflow-hidden shrink-0 mb-0.5" v-html="avatarSvg"></div>
                    <div class="max-w-[76%] rounded-[14px] rounded-bl-[4px] bg-[#2a2c34] px-3 py-2 text-[11.5px] leading-[1.55] text-gray-200">
                        这张绝了！
                    </div>
                </div>

                <!-- 已删除提示（删除完成后出现，替代原位置） -->
                <div v-if="collapsed" class="flex justify-end">
                    <div class="del-hint flex items-center gap-1 text-[10px] text-gray-500">
                        <span class="material-symbols-outlined text-[12px]">delete</span>
                        <span>你删除了一条消息</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 输入栏 -->
        <div class="shrink-0 px-4 pt-2 pb-4 flex items-center gap-2.5 border-t border-white/[0.06]">
            <span class="material-symbols-outlined text-[19px] text-gray-400 shrink-0">mic</span>
            <div class="flex-1 h-9 rounded-[10px] bg-white/[0.07] flex items-center px-3.5">
                <span class="text-[11px] text-gray-500">输入消息…</span>
            </div>
            <span class="material-symbols-outlined text-[18px] text-gray-400 shrink-0">mood</span>
            <span class="material-symbols-outlined text-[19px] text-gray-400 shrink-0">add_circle</span>
        </div>

        <!-- 碎沙 canvas（覆盖全屏，仅 optimized 使用） -->
        <canvas ref="canvas" class="absolute inset-0 w-full h-full z-20 pointer-events-none"></canvas>
    </div>
</template>

<style scoped>
/* naive：整条气泡一起淡掉（"只会淡掉，不会碎"） */
.naive-fade {
    animation: wholeFade 0.3s ease-out both;
}

@keyframes wholeFade {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

/* 长按菜单弹出 */
.menu-pop {
    transform-origin: bottom right;
    animation: menuIn 0.16s ease-out both;
}

@keyframes menuIn {
    from {
        opacity: 0;
        transform: scale(0.82);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 已删除提示淡入 */
.del-hint {
    animation: hintIn 0.35s ease-out both;
}

@keyframes hintIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
