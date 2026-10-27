import { ref } from 'vue'

// 全站共享的设备视图状态（手机 / 平板），跨页面保持
const deviceView = ref('mobile')

/**
 * 当前设备视图不被该案例支持时，回落到案例支持的第一个设备
 */
export function normalizeDevice(caseMeta, view = deviceView.value) {
    if (!caseMeta) return 'mobile'
    return caseMeta.devices.includes(view) ? view : caseMeta.devices[0]
}

export function useDeviceView() {
    return {
        deviceView,
        setDeviceView(type) {
            deviceView.value = type
        },
        normalizeDevice,
    }
}
