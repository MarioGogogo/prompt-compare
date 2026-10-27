import DemoFeed from './DemoFeed.vue'

// PROMPT 01 · 像退潮一样浮出来 SHIMMER — 信息流骨架屏加载
export const shimmerCase = {
    id: 'shimmer',
    index: '01',
    title: '像退潮一样浮出来',
    codename: 'SHIMMER',
    tags: [
        '[场景: 信息流首屏加载]',
        '[核心: 骨架屏 + 斜向光带]',
        '[动效: 60ms 错峰浮现]',
    ],
    devices: ['mobile', 'tablet'],
    promptText:
        '做一个信息流加载：先显示和真实内容形状一样的骨架屏（圆头像、标题条、图片块，尺寸和位置跟真实卡片一致），所有骨架共用一道柔和的斜向光带，每 1.5 秒从左往右扫过；数据到了以后，按头像、标题、图片这些块从上到下每块错开 60ms 依次浮现（淡入 + 上移 8px），骨架同步淡出，整页不跳动、不闪白。',
    promptSegments: [
        { t: '做一个' },
        { t: '信息流加载', hl: true },
        { t: '：先显示' },
        { t: '和真实内容形状一样的骨架屏', hl: true },
        { t: '（圆头像、标题条、图片块，尺寸和位置跟真实卡片一致），所有骨架' },
        { t: '共用', hl: true },
        { t: '一道柔和的' },
        { t: '斜向光带', hl: true },
        { t: '，每 ' },
        { t: '1.5 秒从左往右扫过', hl: true },
        { t: '；数据到了以后，按头像、标题、图片这些块从上到下' },
        { t: '每块错开 60ms 依次浮现', hl: true },
        { t: '（' },
        { t: '淡入 + 上移 8px', hl: true },
        { t: '），骨架同步淡出，' },
        { t: '整页不跳动、不闪白', hl: true },
        { t: '。' },
    ],
    metrics: [
        { icon: 'hourglass_top', tone: 'indigo', label: '感知加载速度', value: '+85% 骨架即内容' },
        { icon: 'verified', tone: 'emerald', label: '视觉稳定性', value: '0 跳动 · 0 闪白' },
        { icon: 'animation', tone: 'amber', label: '动效节奏感', value: '60ms 错峰 浮现' },
    ],
    pills: {
        baseline: '无提示词 / 泛化指令 (“做一个信息流页面”)',
        optimized: '结构化提示词 (骨架屏 + 斜向微光 + 60ms 错峰浮现)',
    },
    analysis: {
        pain: '加载时只有一颗居中转圈，数据到达后内容瞬间弹出：布局整体跳动、整页闪白，用户感知等待更久，首屏体验割裂，等待过程毫无反馈与预期。',
        gain: '骨架屏与真实卡片同形状、同尺寸、同位置，一道柔和斜向光带每 1.5s 扫过安抚等待；内容按块错开 60ms 依次浮现（淡入 + 上移 8px），像退潮一样浮出来，全程零跳动、零闪白。',
    },
    valueCards: [
        {
            icon: 'grid_view',
            tone: 'indigo',
            title: '形状一致 (Skeleton Fidelity)',
            bodyParts: [
                { t: '骨架屏不是随便画几条灰杠，而是和真实内容' },
                { t: '同形状、同尺寸、同位置', hl: true, tone: 'indigo' },
                { t: '（圆头像、标题条、图片块）。数据到达瞬间一一对应替换，布局零偏移。' },
            ],
            foot: { icon: 'straighten', text: '布局累积偏移 CLS ≈ 0' },
        },
        {
            icon: 'waves',
            tone: 'emerald',
            title: '光带与节奏 (Shimmer & Rhythm)',
            bodyParts: [
                { t: '所有骨架' },
                { t: '共用一道柔和的斜向光带', hl: true, tone: 'emerald' },
                { t: '，每 ' },
                { t: '1.5s', hl: true, tone: 'emerald', mono: true },
                { t: ' 从左往右扫过。微光流动暗示"正在加载"而非"卡死"，让等待变得可感知、可预期。' },
            ],
            foot: { icon: 'timer', text: '光带扫过周期: 1.5s / 次' },
        },
        {
            icon: 'animation',
            tone: 'amber',
            title: '错峰浮现 (Staggered Reveal)',
            bodyParts: [
                { t: '数据到达后按头像、标题、图片' },
                { t: '从上到下每块错开 ', hl: true, tone: 'amber' },
                { t: '60ms', hl: true, tone: 'amber', mono: true },
                { t: ' 依次浮现', hl: true, tone: 'amber' },
                { t: '（淡入 + 上移 ' },
                { t: '8px', mono: true },
                { t: '），骨架同步淡出——像退潮一样浮出来，整页不跳动、不闪白。' },
            ],
            foot: { icon: 'flash_off', text: '整页闪白次数: 0' },
        },
    ],
    demo: DemoFeed,
}
