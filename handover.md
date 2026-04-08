# Handover 文档

## 1. 本次会话目标 / 当前阶段目标

**目标**：在不破坏现有首页体验的前提下，评估“烟雾效果”是否能成立，并区分轻量氛围方案和真正的 WebGL 浓烟方案。

**本次会话涉及的功能范围**：

- 首页 Hero 新增第四模式 `Atmosphere`
- 新增独立实验页 `/labs/smoke`
- 新增独立实验页 `/labs/smoke-v2`
- 新增独立实验页 `/labs/smoke-v3`
- 引入 `three` 与 `@types/three`

**本次阶段判断**：

- 首页 `Atmosphere` 已落地，但它更适合作为轻量氛围模式，不适合作为最终浓烟方案
- `/labs/smoke` 使用 smoke texture + sprite cloud，结论是不够像烟，更像大号粒子/烟片
- `/labs/smoke-v2` 的全屏 shader 雾场会明显变成“大色块 / 大雾幕”，不是想要的烟
- `/labs/smoke-v3` 已收敛成单条细长 plume 结构，方向上比 v2 更接近“烟柱”，但当前效果仍不理想，暂时停在这里

这次改动属于实验与方向筛选，不是最终生产方案。

---

## 2. 当前仓库状态

**分支**：`feature/parallax-effects`

**今天已经提交并 push 的提交**：

- `da5e82b Add atmosphere hero mode`
- `a57eb28 Add smoke lab experiment pages`

**当前工作区仍有未提交改动**：

| 文件 | 状态 | 说明 |
|------|------|------|
| `.gitignore` | 修改 | 新增 `.omx/` 忽略项，避免本地 OMX 状态进仓库 |
| `app/routes.ts` | 修改 | 新增 `/labs/smoke-v3` 路由 |
| `app/components/SmokeLabSceneV2.tsx` | 修改 | 多轮调整 v2，但当前结论仍不理想 |
| `app/components/SmokeLabSceneV3.tsx` | 新建 | 单条细长 plume 结构实验页 |
| `app/routes/labs.smoke-v3.tsx` | 新建 | `/labs/smoke-v3` 页面 |
| `README.md` | 本次已更新 | 同步 smoke lab 列表与当前实验状态 |
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

### 问题 4：`smoke-v2` 容易变成整屏雾幕 / 大色块

- **现象**：即使把颜色调成明显的红色，也更像“一大片模糊背景”，而不是可辨识的烟
- **触发条件**：v2 的烟体本质仍是大面积 shader plane 上的连续噪声场
- **影响**：用户会觉得烟雾“混在一起”，看不出 plume 结构

### 问题 5：`smoke-v3` 虽然开始有烟柱，但当前质感仍然不够好

- **现象**：v3 已经收敛成单条细长 plume，不再是全屏雾幕，但整体观感仍不理想
- **影响**：说明当前 shader plume 结构虽然比 v2 正确，但离可用的真实烟雾还差一段距离

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

- 当前判断：`Three.js + WebGL shader` 仍然是正确的大方向，但 `v2` 这条“整屏噪声雾场”实现路径不对
- 原因：
  - 它更容易生成“连续的雾幕”，而不是“有起点、有收束、有负空间”的烟柱
  - 用户已经明确指出它像大色块/大雾幕

### 关于 `/labs/smoke-v3`

- 当前判断：`v3` 的“单条细长 plume”结构比 `v2` 更接近烟雾方向
- 但当前结论仍然是：
  - 结构方向比 v2 对
  - 视觉质量还不够好，暂时不建议继续在当前版本上堆太多复杂度

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
  - 做过多轮改造：加密度、改颜色、去热源、降载、改 plume 诊断版
  - 当前问题仍然是容易变成整屏混合雾幕或大色块
  - **性质**：保留为“失败路径样本”，不建议当前继续作为主线版本

- `app/routes/labs.smoke-v2.tsx`
  - 新增 `/labs/smoke-v2`
  - 页面内保留回首页与回 v1 的入口，方便横向对比

### 独立实验页 v3：`/labs/smoke-v3`

- `app/components/SmokeLabSceneV3.tsx`
  - 新增单条细长 plume 的 shader 场景
  - 主目标是验证“先把烟柱轮廓做对”，而不是继续做整屏雾幕
  - 已增加不规则边缘、顶部破碎、矩形底板淡出等结构处理
  - **性质**：方向诊断页，比 v2 更接近烟柱，但当前效果仍未达到满意程度

- `app/routes/labs.smoke-v3.tsx`
  - 新增 `/labs/smoke-v3`
  - 页面内保留回首页与回 v2 的入口，方便横向对比

- `app/routes.ts`
  - 新增：
    - `/labs/smoke`
    - `/labs/smoke-v2`
    - `/labs/smoke-v3`

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
  - 包含 `/labs/smoke-v3`

- 已确认以下代码层行为成立：
  - 首页菜单包含 `Atmosphere`
  - `/labs/smoke` 可作为独立实验页存在
  - `/labs/smoke-v2` 可作为独立实验页存在
  - `/labs/smoke-v3` 可作为独立实验页存在
  - v1 使用 sprite cloud
  - v2 使用整屏 shader 雾场
  - v3 使用单条 plume 结构

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

3. **把 `/labs/smoke-v2` 的整屏 shader 雾场继续细调当主线**
   - 结论：用户已多次明确否定“整片混在一起 / 大色块”的观感，不建议继续在该结构上打补丁

### 关键约束

1. **首页结构不适合重度烟雾实验**
   - 首页现在更适合轻量视觉模式，不适合复杂 WebGL 浓烟主战场

2. **依赖安装受代理影响**
   - 如果后续还要新增包，优先让用户手动安装

3. **`@types/three` 当前被放进了 `dependencies`**
   - 不影响运行
   - 但从规范上更适合后续移到 `devDependencies`

4. **`smoke-v3` 只是结构诊断版**
   - 它证明“plume 比全屏雾幕更合理”
   - 但当前版本仍不够好，不能直接作为最终方案

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
   - 当作失败路径样本，重点观察“为什么它会变成整屏大雾幕”

4. `/labs/smoke-v3`
   - 当作当前最近的结构诊断页，观察单条 plume 是否比 v2 更合理

### 先看哪些文件

1. `app/components/SmokeLabSceneV3.tsx`
   - 当前最新的结构诊断页

2. `app/components/SmokeLabSceneV2.tsx`
   - 作为失败路径样本，用来记录哪些方向不要再走

3. `app/routes/labs.smoke-v3.tsx`
   - v3 页面壳与入口

4. `app/components/SmokeLabScene.tsx`
   - 仅作对照，不建议继续深挖

### 如何判断当前状态正常

- 首页可以切到 `Atmosphere`
- `/labs/smoke` 可以打开
- `/labs/smoke-v2` 可以打开
- `/labs/smoke-v3` 可以打开
- `npm run typecheck` 通过

如果不正常，优先排查：

1. `three` 与 `@types/three` 是否安装完整
2. `SmokeLabSceneV2.tsx` 的 shader 是否有语法或 uniform 绑定问题
3. 路由类型生成是否由 `react-router typegen` 更新

---

## 9. 当前仍存在的问题 / 边界

1. `/labs/smoke-v2` 当前更像“整屏雾幕/大色块”，不满足需求
2. `/labs/smoke-v3` 虽然开始有单条 plume，但当前效果仍然不理想
3. 还没有真正拿到一个“既像烟又不糊成背景”的可用版本
4. 还没有把任何 smoke lab 经验迁回首页，也还没决定是否迁回
5. 没有参数面板、性能监控、移动端策略
6. README 目前只补了总体说明，实验页仍没有单独的深度设计文档

---

## 10. 最终想实现的产品目标

- 首页继续保留沉浸式视频 Landing Page 体验
- 最终需要一个“明显像烟，而不是粒子”的高质量烟雾方案
- 如果实验页成熟，再决定是否迁回首页替代当前 `Atmosphere`，或保留为独立 showcase
- 长期方向仍偏向 `Three.js + WebGL shader`
- 但必须是“明确 plume / source 结构”的 shader，而不是整屏雾场

---

## 11. 后续 TODO

1. **不要继续在 `/labs/smoke-v2` 的整屏雾场结构上细调**
   - 目标：避免继续在已被明确否定的路径上消耗时间
   - 重点：把 v2 保留为失败样本即可

2. **基于 `/labs/smoke-v3` 再拆更明确的 plume / source 结构**
   - 目标：先把“烟从哪里冒出来、沿什么路径走”做清楚
   - 重点：优先保证轮廓识别度，而不是先追求复杂纹理

3. **如果 v3 继续效果差，考虑改用更直接的合成策略**
   - 目标：验证是否需要回到“贴图/遮罩 + shader 扰动”的混合方案
   - 重点：先拿到“像烟”的结果，再决定是否继续纯 shader

4. **在拿到可用 smoke 版本前，不要迁回首页**
   - 目标：避免把实验性较强、质量未达标的实现带回主页面

5. **整理依赖**
   - 把 `@types/three` 移到 `devDependencies`
   - 保持 README 与真实依赖一致
