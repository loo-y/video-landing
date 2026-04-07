# Handover 文档

## 1. 本次会话目标 / 当前阶段目标

**目标**：在不破坏现有首页体验的前提下，评估“烟雾效果”是否能成立，并区分轻量氛围方案和真正的 WebGL 浓烟方案。

**本次会话涉及的功能范围**：

- 首页 Hero 新增第四模式 `Atmosphere`
- 新增独立实验页 `/labs/smoke`
- 新增独立实验页 `/labs/smoke-v2`
- 引入 `three` 与 `@types/three`

**本次阶段判断**：

- 首页 `Atmosphere` 已落地，但它更适合作为轻量氛围模式，不适合作为最终浓烟方案
- `/labs/smoke` 使用 smoke texture + sprite cloud，结论是不够像烟，更像大号粒子/烟片
- `/labs/smoke-v2` 改为 `Three.js + WebGL shader` 路线，这是当前更值得继续迭代的方向

这次改动属于实验与方向筛选，不是最终生产方案。

---

## 2. 当前仓库状态

**分支**：`feature/parallax-effects`

**今天已经提交并 push 的提交**：

- `da5e82b Add atmosphere hero mode`

**当前工作区仍有未提交改动**：

| 文件 | 状态 | 说明 |
|------|------|------|
| `app/routes.ts` | 修改 | 新增 `/labs/smoke` 与 `/labs/smoke-v2` 路由 |
| `package.json` | 修改 | 新增 `three` 与 `@types/three` |
| `package-lock.json` | 修改 | 依赖锁文件更新 |
| `app/components/SmokeLabScene.tsx` | 新建 | smoke v1，sprite cloud 对照页 |
| `app/components/SmokeLabSceneV2.tsx` | 新建 | smoke v2，shader-driven 实验页 |
| `app/routes/labs.smoke.tsx` | 新建 | `/labs/smoke` 页面 |
| `app/routes/labs.smoke-v2.tsx` | 新建 | `/labs/smoke-v2` 页面 |
| `public/images/smoke/*` | 新建 | smoke v1 使用的烟雾贴图 |
| `README.md` | 本次已更新 | 同步新增模式与实验页说明 |
| `handover.md` | 本次已更新 | 同步本次真实状态 |

**依赖环境**：

- Node.js + npm
- 浏览器需支持 WebGL、Canvas、OffscreenCanvas
- 如果要启用原有帧序列模式，仍需要 `ffmpeg + rembg + Python 3.x`

---

## 3. 今天实际遇到的问题

### 问题 1：首页滚动驱动的 Z 轴推进没有生效

- **现象**：`Atmosphere` 模式中绑定 `window.scrollY` 后，滚轮滚动时视觉几乎没有变化
- **触发条件**：首页 Hero 在 Explore 之前是 `fixed` 结构，没有真实文档滚动空间
- **影响**：`translateZ` 没有有效输入值，导致“滚动推进”像没做

### 问题 2：DOM 粒子和 sprite cloud 不像浓烟

- **现象**：用户直接反馈“这不是烟，就是大一点的粒子”
- **触发条件**：
  - 首页 `Atmosphere` 主要是 DOM/CSS overlay
  - `/labs/smoke` 主要是 smoke texture sprite cloud
- **影响**：无法达到“浓烟、翻卷、连续体积流动”的目标

### 问题 3：Three.js 的类型与安装链路有额外成本

- **现象**：
  - 初始缺少 `three` 类型声明
  - 安装依赖时受代理环境影响
  - `@types/three` 对 `Sprite` 的泛型约束和直觉不一致
- **影响**：实验页代码初始无法直接通过 `npm run typecheck`

---

## 4. 原因判断与结论

### 关于首页 `Atmosphere`

- 当前判断：首页第四模式只能承担“轻氛围增强”
- 原因：
  - 首页是 `fixed hero + explore transition`
  - 不适合承载真实滚动驱动的复杂浓烟实验
  - 用 DOM / CSS / 轻量 overlay 很难跨过“像粒子”的上限

### 关于 `/labs/smoke`

- 当前判断：`Three.js + smoke texture sprite cloud` 不是最终路线
- 已排除的误判：
  - 不是“再多加一点粒子就会像烟”
  - 也不是“缺少人物抠图才不像烟”
- 当前最可信结论：
  - 离散 sprite 天然会暴露“很多片在漂”的结构问题，很难变成真正连续的烟体

### 关于 `/labs/smoke-v2`

- 当前判断：`Three.js + WebGL shader` 是更合理的长期方向
- 原因：
  - 烟体密度直接在 fragment shader 里生成
  - 通过多层 plane 叠前景、中景、背景厚度
  - 后续可继续加卷动、湍流、暗部烟芯和遮挡，不会受 sprite 路线的结构上限束缚

---

## 5. 这次已经落地的修复

### 首页 `Atmosphere` 模式

- `app/components/AtmosphereHero.tsx`
  - 新增背景图 + 烟雾/火星 overlay 的 Hero 组件
  - 新增初始 `blur -> clear` 过渡
  - 对首页无真实滚动的问题做了滚轮/触摸驱动的虚拟推进补偿
  - **性质**：MVP 级轻氛围方案，不是最终浓烟方案

- `app/components/HeroSection.tsx`
  - 首页模式从三种扩展为四种
  - 在无 `frames/meta.json` 时，`Video` 与 `Atmosphere` 仍可切换

- `app/app.css`
  - 增加烟雾与 ember 动画
  - 增加 `prefers-reduced-motion` 降级

### 独立实验页 v1：`/labs/smoke`

- `app/components/SmokeLabScene.tsx`
  - 使用 `Three.js` 新建场景
  - 使用 smoke texture 叠 sprite cloud
  - 加少量 ember sprite
  - 相机与烟层随真实滚动推进
  - **性质**：验证过但方向不足，保留为失败对照样本

- `app/routes/labs.smoke.tsx`
  - 新增 `/labs/smoke` 独立实验页

- `public/images/smoke/*`
  - 新增 smoke v1 使用的本地贴图资源

### 独立实验页 v2：`/labs/smoke-v2`

- `app/components/SmokeLabSceneV2.tsx`
  - 新增 shader 驱动的程序化烟雾场
  - 使用 fragment shader 噪声场生成烟体密度
  - 叠三层主烟 plane + 一层背景 haze plane
  - 相机和 shader uniform 绑定真实滚动
  - **性质**：当前更值得继续投入的主实验页

- `app/routes/labs.smoke-v2.tsx`
  - 新增 `/labs/smoke-v2`
  - 页面内保留回首页与回 v1 的入口，方便横向对比

- `app/routes.ts`
  - 新增：
    - `/labs/smoke`
    - `/labs/smoke-v2`

- `package.json` / `package-lock.json`
  - 新增 `three`
  - 新增 `@types/three`

---

## 6. 已验证结果

本次**实际验证过**：

- `npm run typecheck` 通过
  - 包含首页 `Atmosphere`
  - 包含 `/labs/smoke`
  - 包含 `/labs/smoke-v2`

- 已确认以下代码层行为成立：
  - 首页菜单包含 `Atmosphere`
  - `/labs/smoke` 可作为独立实验页存在
  - `/labs/smoke-v2` 可作为独立实验页存在
  - v1 使用 sprite cloud
  - v2 使用 shader plane

本次**未验证或未完成验证**：

- 未做跨浏览器验证（Safari / Firefox 未测）
- 未做移动端视觉验证
- 未做 FPS 或性能采样
- 未做自动化测试

---

## 7. 踩过的坑 / 已否定方案 / 关键约束

### 已否定或暂不推荐的方案

1. **继续强化首页 DOM 粒子方案**
   - 结论：只能提升“热闹感”，很难变成浓烟

2. **把 `/labs/smoke` 的 sprite cloud 当最终答案**
   - 结论：用户已经明确否定，不建议继续作为主线投入

### 关键约束

1. **首页结构不适合重度烟雾实验**
   - 首页现在更适合轻量视觉模式，不适合复杂 WebGL 浓烟主战场

2. **依赖安装受代理影响**
   - 如果后续还要新增包，优先让用户手动安装

3. **`@types/three` 当前被放进了 `dependencies`**
   - 不影响运行
   - 但从规范上更适合后续移到 `devDependencies`

4. **`smoke-v2` 只是当前第一版 shader 实验**
   - 虽然方向比 v1 正确
   - 但离“电影级浓烟”仍有距离，后续还要继续调密度、卷动、暗部与层次

---

## 8. 接手后如何继续

### 启动步骤

```bash
git checkout feature/parallax-effects
npm install
npm run dev
```

### 先看哪些页面

1. 首页 `/`
   - 观察 `Atmosphere` 模式只是轻氛围，不要把它当最终烟雾方案

2. `/labs/smoke`
   - 当作 sprite cloud 失败对照页

3. `/labs/smoke-v2`
   - 当作当前主实验页

### 先看哪些文件

1. `app/components/SmokeLabSceneV2.tsx`
   - 当前主战场

2. `app/routes/labs.smoke-v2.tsx`
   - v2 页面壳与入口

3. `app/components/SmokeLabScene.tsx`
   - 仅作对照，不建议继续深挖

### 如何判断当前状态正常

- 首页可以切到 `Atmosphere`
- `/labs/smoke` 可以打开
- `/labs/smoke-v2` 可以打开
- `npm run typecheck` 通过

如果不正常，优先排查：

1. `three` 与 `@types/three` 是否安装完整
2. `SmokeLabSceneV2.tsx` 的 shader 是否有语法或 uniform 绑定问题
3. 路由类型生成是否由 `react-router typegen` 更新

---

## 9. 当前仍存在的问题 / 边界

1. `/labs/smoke-v2` 现在更接近“重雾/烟幕”，未必已经达到“浓烟团”的程度
2. v2 还没有真正的流体模拟，只是程序化噪声场叠层
3. 还没有把 v2 的经验迁回首页，也还没决定是否迁回
4. 没有参数面板、性能监控、移动端策略
5. README 目前只补了总体说明，实验页仍没有单独的深度设计文档

---

## 10. 最终想实现的产品目标

- 首页继续保留沉浸式视频 Landing Page 体验
- 最终需要一个“明显像烟，而不是粒子”的高质量烟雾方案
- 如果实验页成熟，再决定是否迁回首页替代当前 `Atmosphere`，或保留为独立 showcase
- 长期方向更偏向 `Three.js + WebGL shader`，而不是继续堆 DOM 粒子或 sprite cloud

---

## 11. 后续 TODO

1. **继续迭代 `/labs/smoke-v2` 的 shader 参数**
   - 目标：把当前“烟幕/雾幕”推向更厚的“烟团感”
   - 重点：提高密度阈值、强化暗部烟芯、增加卷动和回流结构

2. **增加更重的前景遮挡层**
   - 目标：让烟体更像从镜头前掠过，而不是只停留在背景空间里

3. **必要时加入更低频的 turbulence / second pass**
   - 目标：避免烟体过于平滑，增加体积翻卷感

4. **决定 `smoke-v2` 是否值得迁回首页**
   - 如果值得，再设计如何与首页 `fixed hero + explore transition` 兼容

5. **整理依赖**
   - 把 `@types/three` 移到 `devDependencies`
   - 保持 README 与真实依赖一致
