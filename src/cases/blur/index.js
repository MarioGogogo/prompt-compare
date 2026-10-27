import DemoFeedBlur from './DemoFeedBlur.vue'

// PROMPT 02 · 像相机对焦 BLUR-UP — 照片墙渐进式加载（仅适配平板）
export const blurCase = {
    id: 'blur',
    index: '02',
    title: '像相机对焦',
    codename: 'BLUR-UP',
    tags: [
        '[场景: 照片墙图片加载]',
        '[核心: 同色调模糊占位 + 尺寸锚定]',
        '[动效: 模糊变清晰 + 1.04→1 缩回]',
        '[策略: 距屏 300px 懒加载]',
    ],
    devices: ['tablet'],
    promptText:
        '做一个照片墙：每张图先用同色调的模糊小图占位（主色底 + 20px 高斯模糊），原图加载完从模糊慢慢变清晰，同时从 1.04 倍轻轻缩回 1 倍，约 500ms；图片框尺寸提前固定，加载前后布局不跳；离进入屏幕还有约 300px 时才开始加载。',
    promptSegments: [
        { t: '做一个' },
        { t: '照片墙', hl: true },
        { t: '：每张图先用' },
        { t: '同色调的模糊小图占位', hl: true },
        { t: '（主色底 + ' },
        { t: '20px 高斯模糊', hl: true, mono: true },
        { t: '），原图加载完' },
        { t: '从模糊慢慢变清晰', hl: true },
        { t: '，同时从 ' },
        { t: '1.04 倍轻轻缩回 1 倍', hl: true },
        { t: '，约 ' },
        { t: '500ms', hl: true, mono: true },
        { t: '；' },
        { t: '图片框尺寸提前固定', hl: true },
        { t: '，加载前后布局不跳；' },
        { t: '离进入屏幕还有约 300px 时才开始加载', hl: true },
        { t: '。' },
    ],
    metrics: [
        { icon: 'blur_on', tone: 'indigo', label: '感知画质连续性', value: '模糊→清晰 合焦过渡' },
        { icon: 'verified', tone: 'emerald', label: '布局稳定性', value: '0 跳动 · 0 偏移' },
        { icon: 'speed', tone: 'amber', label: '请求时机', value: '距屏 300px 预加载' },
    ],
    pills: {
        baseline: '无提示词 / 泛化指令 (“做一个图片墙，加载图片”)',
        optimized: '结构化提示词 (同色调模糊占位 + 尺寸锚定 + 300px 懒加载)',
    },
    analysis: {
        pain: '“做一个图片墙，加载图片”——图片区域先是空白，原图加载完猛地弹出：卡片高度瞬间撑开、整列下坠跳动，观感生硬突兀，平板宽屏瀑布流上尤其明显。',
        gain: '每张图先用同色调模糊小图占位，原图到位后从模糊慢慢变清晰、1.04 倍轻缩回 1 倍（500ms），像相机合焦；图片框尺寸提前固定，布局零跳动；距屏 300px 才发请求，首屏与流量都省。',
    },
    valueCards: [
        {
            icon: 'blur_on',
            tone: 'indigo',
            title: '同色调模糊占位 (Toned Placeholder)',
            bodyParts: [
                { t: '每张图先用' },
                { t: '主色底 + 20px 高斯模糊', hl: true, tone: 'indigo', mono: true },
                { t: ' 的小图占位，用户第一时间看到色彩氛围而不是空白，等待感被画质过渡吸收。' },
            ],
            foot: { icon: 'bolt', text: '首帧可见时间 ≈ 0ms' },
        },
        {
            icon: 'aspect_ratio',
            tone: 'emerald',
            title: '尺寸锚定 (Size Anchoring)',
            bodyParts: [
                { t: '图片框尺寸' },
                { t: '提前固定', hl: true, tone: 'emerald' },
                { t: '，加载前后布局不跳；锐化只是"画质变化"而非"内容替换"，整页零偏移、零下坠。' },
            ],
            foot: { icon: 'straighten', text: '布局累积偏移 CLS ≈ 0' },
        },
        {
            icon: 'center_focus_strong',
            tone: 'amber',
            title: '合焦进场 (Focus-in Motion)',
            bodyParts: [
                { t: '加载完' },
                { t: '从模糊慢慢变清晰', hl: true, tone: 'amber' },
                { t: '，同时从 ' },
                { t: '1.04 缩回 1', hl: true, tone: 'amber', mono: true },
                { t: '（' },
                { t: '500ms', mono: true },
                { t: '），每张错峰 60ms，像相机逐张合焦，柔和自然。' },
            ],
            foot: { icon: 'flash_off', text: '整页闪白次数: 0' },
        },
    ],
    demo: DemoFeedBlur,
}
