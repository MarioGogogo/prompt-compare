# 提示词展示网页（PromptCraft — 提示词动画对比工作台）

展示「提示词价值」的网站：每条提示词一个可交互的 A/B 动画对比演示（左边无提示词的普通实现，右边加提示词后的效果），循环播放。

## 目录结构

- **`prompt-compare/` — 主应用（Vue 3 + Vite + Tailwind CDN），所有开发都在这里**
- 根目录 `index.html` — 早期静态原型（咖啡商城主题），已废弃，勿改
- `compare-shots/` — 验证截图输出目录

## 常用命令

```bash
cd prompt-compare
npm run dev      # http://localhost:5173/（hash 路由）
npm run build    # 产物在 dist/，可静态托管
```

## 核心架构：案例注册表模式

数据流：`src/data/cases.js`（注册表，唯一数据入口）→ 页面（CasePage / LibraryPage）→ 通用组件（CaseConsole / DeviceShowcase）→ 每案例动画组件（`<component :is>`）。

- **路由**（`src/router/index.js`，vue-router hash 模式）：`/` 重定向到第一个案例；`/case/:id` 案例详情；`/library` 案例库。未知 id 回落第一个案例。
- **设备视图**（`src/composables/useDeviceView.js`）：模块级共享 `ref('mobile')`；`normalizeDevice(caseMeta, view)` 在案例不支持当前设备时回落到 `caseMeta.devices[0]`。CasePage 切换案例时 watch 路由自动校正。
- **动画组件约定**：props 只有 `optimized: Boolean`（false=普通实现 / true=提示词效果）和 `device: 'mobile'|'tablet'`；内部自管 setTimeout 循环动画 + scoped CSS（参考 `src/cases/shimmer/DemoFeed.vue`）。

## 新增一个提示词案例（三步）

1. 新建 `src/cases/<id>/DemoXxx.vue`：实现动画对比演示
2. 新建 `src/cases/<id>/index.js`：导出 meta 对象——`id / index / title / codename / tags / devices / promptText / promptSegments（高亮分段，hl+mono 字段）/ metrics / pills / analysis{pain,gain} / valueCards / demo`
3. 在 `src/data/cases.js` 的 `cases` 数组展开注册一行

完成后案例库卡片、详情页、上一案/下一案导航、复制按钮、设备适配全部自动生效。

## 设备适配规则

- `meta.devices: ['mobile','tablet' | 'tablet' | 'mobile']`
- 仅平板的案例（如 `src/cases/blur/`）：进入自动切平板视图，CaseConsole 中手机按钮渲染为禁用灰化 + title 提示
- 案例库卡片徽标由 `deviceBadge()` 生成（双端可用/仅平板/仅手机）

## 设计约定

- **手机内屏**：深色微博式信息流（`#0d0e12` 底），状态栏 9:41 + 频道 Tab（推荐=橙色下划线）+ 帖子卡（头像/昵称/时间地点/正文/图片块/点赞评论分享）；现有两条帖子：阿伊莎·撒哈拉沙漠、周屿·舍夫沙万蓝城
- **图片一律用内联 SVG 场景绘制**，不用外链图片（网络不可靠）
- **动画模板**（照抄 DemoFeed 模式）：骨架屏 + 斜向光带每 1.5s 扫过（`shimmerSweep`）、60ms 错峰（`transition-delay: calc(var(--i) * 60ms)`）、淡入+上移 8px、普通侧=转圈/灰块+瞬间弹出+整页闪白（`flashOut`）
- **字体源用国内镜像 `fonts.loli.net`**（index.html），Material Symbols 图标 + Geist/JetBrains Mono；Material 图标填充态加 `.ms-fill { font-variation-settings: 'FILL' 1 }`
- Tailwind 配置在 `index.html` 内联 script（CDN 版），自定义 spacing/font-size token（如 `font-label-md`、`px-gutter`、`py-space-xl`）

## 验证方式

改完用 ego-browser 打开 localhost:5173 截图验证（注意 Material 字体偶尔加载慢，截图前 `waitForTimeout` 2s+）。验证点：首页落到第一个案例、双机动画状态切换（骨架/模糊态 vs 内容态）、复制按钮文本、`/library` 徽标、仅平板案例自动切视图 + 手机按钮禁用。

## 历史背景

- PROMPT 01「像退潮一样浮出来 SHIMMER」来自用户提供的图（信息流骨架屏加载提示词）；PROMPT 02「模糊到清晰 BLUR-UP」按同套路创作，并故意设为仅平板以演示设备约束；PROMPT 03「像传送带接上 PREFETCH」来自用户提供的图（商品列表预加载提示词，仅手机，深色商品瀑布流主题）；PROMPT 04「像有人在打字 STREAM」来自用户提供的图（AI 聊天流式回复提示词，仅手机，深色 AI 聊天主题：naive=打字机逐字硬蹦 / optimized=3 点呼吸思考+按词模糊淡入+光标+平滑跟随）
- prefetch 案例（`src/cases/prefetch/`）特殊点：JS rAF 时间驱动自动滚动（`scrollAt()`，周期 7.8s 与加载相位定时器同步），下一页卡片两侧都提前占定布局空间（optimized 透明占位错峰滑上 / naive visibility 隐藏瞬间显现），保证两侧滚动距离一致、相位同步
- PROMPT 05「像拉响礼花筒 CONFETTI」来自用户提供的图（打卡撒花提示词，仅手机，深色打卡 App 主题：naive=屏幕中心全向炸开满屏挡字+寿命一致同时消失 / optimized=按钮锚点 ±35° 锥形喷发 canvas 粒子+重力翻面空气阻力+2.5s 起错峰淡出；naive 粒子参数故意低速低重力以撑满 6.3s 寿命周期）
- PROMPT 06「像沙画被风吹散 DISINTEGRATE」来自用户提供的图（聊天消息删除碎沙提示词，仅手机，深色微信式聊天主题：naive=长按菜单后整条气泡一起淡掉+占位瞬间塌陷跳位 / optimized=气泡离屏渲染后按 1.4px 网格采样成 ~1500 粒 canvas 沙粒（每粒取原像素颜色），左→右 0.9s 依次起飞（delay=列位置比例）往右上飘+sin 抖动+变小变淡 1s 消失，同时气泡 clip-path inset 从左往右逐点擦除，3.2s 占位 300ms 平滑塌陷补位；被删消息位置以「你删除了一条消息」提示收尾）
- 2026-10 重构：从单案例硬编码页改为案例注册表 + 路由的多案例工作流（无登录，用户明确不需要）
