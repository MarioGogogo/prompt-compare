import { createRouter, createWebHashHistory } from 'vue-router'
import { cases, getCase } from '../data/cases.js'
import CasePage from '../pages/CasePage.vue'
import LibraryPage from '../pages/LibraryPage.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: () => ({ name: 'case', params: { id: cases[0].id } }),
        },
        {
            path: '/case/:id',
            name: 'case',
            component: CasePage,
        },
        {
            path: '/library',
            name: 'library',
            component: LibraryPage,
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: () => ({ name: 'case', params: { id: cases[0].id } }),
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

// 未知案例 id 重定向回第一个案例
router.beforeEach((to) => {
    if (to.name === 'case' && !getCase(to.params.id)) {
        return { name: 'case', params: { id: cases[0].id } }
    }
    return true
})

router.afterEach((to) => {
    const base = 'PromptCraft — 提示词动画效果对比'
    if (to.name === 'case') {
        const meta = getCase(to.params.id)
        document.title = meta ? `PROMPT ${meta.index} ${meta.title} — ${base}` : base
    } else if (to.name === 'library') {
        document.title = `案例库 — ${base}`
    } else {
        document.title = base
    }
})

export default router
