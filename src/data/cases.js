import { shimmerCase } from '../cases/shimmer/index.js'
import { blurCase } from '../cases/blur/index.js'
import { prefetchCase } from '../cases/prefetch/index.js'
import { streamCase } from '../cases/stream/index.js'
import { confettiCase } from '../cases/confetti/index.js'
import { disintegrateCase } from '../cases/disintegrate/index.js'

/**
 * 案例注册表 —— 新增提示词案例只需：
 * 1. 新建 src/cases/<id>/DemoXxx.vue（动画演示组件，props: optimized / device）
 * 2. 新建 src/cases/<id>/index.js 导出 meta 对象
 * 3. 在下面数组中展开注册一行
 */
export const cases = [
    { ...shimmerCase },
    { ...blurCase },
    { ...prefetchCase },
    { ...streamCase },
    { ...confettiCase },
    { ...disintegrateCase },
]

export function getCase(id) {
    return cases.find(c => c.id === id)
}

export function getCaseIndex(id) {
    return cases.findIndex(c => c.id === id)
}

export function nextCase(id) {
    const i = getCaseIndex(id)
    return i >= 0 ? cases[(i + 1) % cases.length] : null
}

export function prevCase(id) {
    const i = getCaseIndex(id)
    return i >= 0 ? cases[(i - 1 + cases.length) % cases.length] : null
}

export function deviceBadge(devices) {
    if (devices.includes('mobile') && devices.includes('tablet')) {
        return { text: '双端可用', icon: 'devices', tone: 'slate' }
    }
    if (devices.includes('tablet')) {
        return { text: '仅平板', icon: 'tablet_mac', tone: 'amber' }
    }
    return { text: '仅手机', icon: 'smartphone', tone: 'indigo' }
}
