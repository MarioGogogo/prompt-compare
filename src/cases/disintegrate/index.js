import DemoChatDisintegrate from './DemoChatDisintegrate.vue'

// PROMPT 06 · 像沙画被风吹散 DISINTEGRATE — 聊天消息删除碎沙消失
export const disintegrateCase = {
    id: 'disintegrate',
    index: '06',
    title: '像沙画被风吹散',
    codename: 'DISINTEGRATE',
    tags: [
        '[场景: 聊天消息删除]',
        '[核心: 按像素拆成小沙]',
        '[动效: 左→右风扫 · 右上飘散]',
        '[体验: 逐点擦除 · 平滑补位]',
    ],
    devices: ['mobile'],
    promptText:
        '做一个聊天消息删除时碎成沙子消失：长按消息选"删除"后，把这条气泡按像素拆成约 1500 粒小沙，每粒用气泡原来那个位置的颜色；从左往右依次散开（像一阵风扫过，约 0.8 秒扫完），每粒往右上方飘走，带一点随机抖动，边飘边变小、变淡，约 1 秒消失；散开的同时，原气泡从左往右被一点点擦掉，不要整条一起消失；删完后下面的消息平滑上移补位（约 300ms）。',
    promptSegments: [
        { t: '做一个' },
        { t: '聊天消息删除时碎成沙子消失', hl: true },
        { t: '：长按消息选"删除"后，把这条气泡' },
        { t: '按像素拆成约 1500 粒小沙', hl: true },
        { t: '，' },
        { t: '每粒用气泡原来那个位置的颜色', hl: true },
        { t: '；' },
        { t: '从左往右依次散开（像一阵风扫过，约 0.8 秒扫完）', hl: true },
        { t: '，每粒' },
        { t: '往右上方飘走，带一点随机抖动，边飘边变小、变淡，约 1 秒消失', hl: true },
        { t: '；散开的同时，' },
        { t: '原气泡从左往右被一点点擦掉，不要整条一起消失', hl: true },
        { t: '；删完后' },
        { t: '下面的消息平滑上移补位（约 300ms）', hl: true },
        { t: '。' },
    ],
    metrics: [
        { icon: 'grain', tone: 'amber', label: '碎裂粒度', value: '按像素拆 ~1500 粒 · 原位取色' },
        { icon: 'air', tone: 'emerald', label: '风扫节奏', value: '左→右 0.8s 扫完 · 右上飘 1s 消失' },
        { icon: 'low_priority', tone: 'indigo', label: '布局补位', value: '逐点擦除 · 下方消息 300ms 上移' },
    ],
    pills: {
        baseline: '无提示词 / 泛化指令 (“做一个聊天消息删除功能”)',
        optimized: '结构化提示词 (像素碎沙 + 风扫散开 + 逐点擦除 + 平滑补位)',
    },
    analysis: {
        pain: '“做一个聊天消息删除功能”——AI 只会做最普通的处理：点删除，整条气泡“噗”地一起淡掉，下面的消息生硬地跳上来填补空位。删除毫无过程感，像 PPT 里删掉一个文本框，没有“这条消息曾经存在”的记忆点，更谈不上质感。',
        gain: '长按消息选“删除”后，气泡按像素拆成约 1500 粒小沙，每粒保留原位置的颜色，像一阵风从左往右扫过，沙粒往右上方飘走、带随机抖动、边飘边变小变淡；原气泡同时被一点点擦掉而不是整条消失；删完下方消息 300ms 平滑上移补位——删除变成了一场小型的沙画表演。',
    },
    valueCards: [
        {
            icon: 'grain',
            tone: 'amber',
            title: '像素碎沙 (Pixel Sand)',
            bodyParts: [
                { t: '把气泡' },
                { t: '按像素拆成约 1500 粒小沙', hl: true, tone: 'amber' },
                { t: '，' },
                { t: '每粒用气泡原来那个位置的颜色', hl: true, tone: 'amber' },
                { t: '——碎掉的是“这条消息本身”的颜色与形状，而不是套一层谁都能用的通用特效。' },
            ],
            foot: { icon: 'grain', text: '~1500 粒 · 原位取色' },
        },
        {
            icon: 'air',
            tone: 'emerald',
            title: '风扫节奏 (Wind Sweep)',
            bodyParts: [
                { t: '沙粒' },
                { t: '从左往右依次散开（约 0.8 秒扫完）', hl: true, tone: 'emerald' },
                { t: '，每粒' },
                { t: '往右上方飘走、带随机抖动，边飘边变小、变淡', hl: true, tone: 'emerald' },
                { t: '，约 1 秒消失——有方向、有先后、有轻重，像真的被一阵风吹散。' },
            ],
            foot: { icon: 'air', text: '左→右扫过 · 右上飘散' },
        },
        {
            icon: 'low_priority',
            tone: 'indigo',
            title: '平滑补位 (Smooth Reflow)',
            bodyParts: [
                { t: '散开的同时' },
                { t: '原气泡从左往右被一点点擦掉，不要整条一起消失', hl: true, tone: 'indigo' },
                { t: '；删完后' },
                { t: '下面的消息平滑上移补位（约 300ms）', hl: true, tone: 'indigo' },
                { t: '，列表不跳不闪，删除的余韵是渐弱的。' },
            ],
            foot: { icon: 'timer', text: '逐点擦除 + 300ms 补位' },
        },
    ],
    demo: DemoChatDisintegrate,
}
