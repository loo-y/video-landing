# Handover 文档

## 1. 本次会话目标 / 当前阶段目标

**目标**：修复视差模式（Parallax Mode）的多个核心问题，使其达到可用状态。

**本次会话涉及的问题范围**：
- 视差模式下帧序列播放**闪烁和帧重叠堆积**
- 视差模式**音频不播放**
- 视差模式下图片**拉伸变形**（缺少 object-fit: cover）
- 文字层级错误（关闭视差后文字跑到最前面，而非夹在 bg 和 fg 之间）

**当前状态**：以上问题均已修复代码并更新，**闪烁问题仍需用户验证确认**。所有改动未提交。

---

## 2. 当前仓库状态

**已提交的改动**（历史）：
- `595efad` fix: revert to muted by default for autoplay policy
- `37866f3` feat: set audio enabled by default
- `a0eae90` fix: refactor audio control with proper state management
- `d37aa9a` fix: audio control and improve UI with Lucide icons
- `f0c577d` docs: update README with project-specific content
- `7c6ffb5` feat: implement immersive video landing page with HeroSection

**未提交的工作区改动**（本次会话）：

| 文件 | 改动量 | 状态 |
|------|--------|------|
| `app/components/HeroSection.tsx` | +246 / -28 行 | 修改中 |
| `scripts/preprocess-video.py` | +17 行 | 修改中 |
| `public/frames/audio.mp3` | 新文件 104KB | 已生成 |
| `public/frames/meta.json` | 添加 audioSrc 字段 | 已更新 |

**依赖环境**：
- Node.js + npm
- Python 3.x + rembg（用于视频预处理）
- ffmpeg（系统安装，已确认可用：version 2025-09-18）
- 浏览器需支持 OffscreenCanvas API（现代浏览器均支持）

---

## 3. 今天实际遇到的问题

### 问题 1：视差模式帧重叠/堆叠（最严重）
- **现象**：连续播放时，旧帧没有被清除，人物图像逐帧叠加，越来越重
- **原因**：前景图是透明 PNG（只有人物可见），之前去掉了 `clearRect` 导致每帧画在前一帧上面；且从离屏复制到可见 Canvas 时没有指定完整尺寸、没有清空可见区域
- **影响**：核心功能不可用，视差模式完全无法正常观看

### 问题 2：视差模式闪烁
- **现象**：帧切换时有明显闪烁
- **原因**：多因素叠加：
  1. 使用 `HTMLImageElement` 绘制时，图片解码在绘制时刻发生导致延迟
  2. 在可见 Canvas 上执行 clearRect→drawImage 两步操作时，浏览器可能在中间时刻合成画面
  3. 双 Canvas（bg/fg）在不同步的绘制周期中被浏览器分别合成
- **影响**：用户体验严重下降

### 问题 3：视差模式无音频
- **现象**：点击音频按钮后仍无声音
- **根因**：**音频文件根本不存在**——预处理脚本之前运行时 ffmpeg 不可用，跳过了音频提取步骤，`meta.json` 中也没有 `audioSrc` 字段
- **次要原因**：即使有音频文件，之前的 `audio.play()` 在 `useEffect` 异步回调中调用，不在用户手势上下文中，会被浏览器自动播放策略拦截

### 问题 4：图片拉伸变形
- **现象**：窗口缩放后，背景和前景图被拉伸变形
- **原因**：Canvas 的 `drawImage(img, 0, 0, cw, ch)` 等同于 CSS `object-fit: fill`（强制填满），没有保持宽高比

### 问题 5：文字层级错误
- **现象**：关闭 ParallaxLayer 的鼠标跟随 transform 后，文字跑到最前面（覆盖了人物）
- **原因**：之前合并为单 Canvas 方案时，把文字放在了 Canvas 上方（z-index 最高），破坏了原有的三层结构

### 问题 6：useEffect 依赖数组大小变化警告
- **现象**：React 控制台报错 "The final argument passed to useEffect changed size between renders"
- **原因**：将内联函数 `(fn) => { ... }` 作为 prop 传递给子组件，每次渲染都是新引用
- **解决**：提取为顶层 `useCallback`

---

## 4. 原因判断与结论

| 问题 | 根因类型 | 最终判断 |
|------|----------|----------|
| 帧重叠 | 代码逻辑 | 前景透明 PNG 必须每帧 clearRect，且离屏→可见复制也需清空 |
| 闪烁 | 渲染架构 | 需要三管齐下：ImageBitmap预解码 + OffscreenCanvas双缓冲 + 同一rAF同步 |
| 无音频 | 缺失文件 + API限制 | 音频文件从未生成 + play()需在手势上下文中调用 |
| 图片变形 | 绘制参数 | Canvas drawImage 需手动实现 object-fit:cover 算法 |
| 文字层级 | 结构设计 | 必须保持 bg(z0)→文字(z1)→fg(z2) 三层独立结构 |

---

## 5. 这次已经落地的修复

### 5.1 `app/components/HeroSection.tsx` — 核心组件大幅重构

**改动概览**：从原来的单 Canvas / 双 Canvas 多次迭代，最终方案如下：

#### 架构变更
```
最终方案：双 Canvas + 双缓冲 + ImageBitmap + object-fit:cover

┌─ HeroSection ─────────────────────────────┐
│  parallaxAudioPlayRef          (ref)      │
│  registerParallaxAudioPlay     (callback) │
│  └─ SyncedFramePlayer ───────────────────│
│       bgCanvasRef              (HTMLCanvas)    z-0 背景层
│       fgCanvasRef              (HTMLCanvas)    z-2 人物层
│       bgOffscreenRef           (OffscreenCanvas) 离屏缓冲
│       fgOffscreenRef           (OffscreenCanvas) 离屏缓冲
│       bgImagesRef              (ImageBitmap[])  预解码位图
│       fgImagesRef              (ImageBitmap[])  预解码位图
│       ├─ Layer 0: bg Canvas (z-0)            │
│       ├─ Layer 1: Typography (z-1) ← 夹层    │
│       └─ Layer 2: fg Canvas (z-2)            │
└──────────────────────────────────────────────┘
```

#### 关键技术点

| 技术点 | 实现方式 | 解决的问题 |
|--------|----------|-----------|
| **ImageBitmap 预解码** | `createImageBitmap(img)` 在加载阶段完成解码 | 消除绘制时的解码延迟 |
| **OffscreenCanvas 双缓冲** | 先在离屏 Canvas 清空+绘制，再原子复制到可见 Canvas | 消除 clearRect 闪烁 |
| **同一 rAF 回调** | bg 和 fg 在同一个 requestAnimationFrame 中依次绘制 | 保证两层层间同步 |
| **object-fit:cover** | 手动计算宽高比，裁剪居中绘制 | 解决窗口缩放变形 |
| **clearRect 双重保障** | 离屏和可见 Canvas 都执行 clearRect | 彻底消除帧堆叠 |
| **音频手势上下文** | 通过 `onRegisterAudioPlay` 回调注册播放函数，在 AudioToggle click 中调用 | 绕过浏览器 autoplay 限制 |
| **autoPlay muted** | `<audio autoPlay muted>` 属性 | 允许静音自动播放 |

#### 动画循环核心代码逻辑
```typescript
// 每帧流程（在同一 rAF 回调中）：
// 1. 离屏Canvas: clearRect → drawCover(bitmap)  // 用户不可见
// 2. 可见Canvas: clearRect → drawImage(offscreen,w,h) // 原子替换
const drawCover = (ctx, bitmap, cw, ch) => {
  // 计算object-fit:cover的尺寸和偏移
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(bitmap, dx, dy, dw, dh);
};
```

### 5.2 `scripts/preprocess-video.py` — 音频提取功能

- 新增 Step 1.5：使用 ffmpeg 从视频中提取音频轨道
- 输出路径：`public/frames/audio.mp3`
- 错误处理：ffmpeg 不可用时优雅降级（跳过音频）

### 5.3 `public/frames/audio.mp3` — 音频文件

- 通过 `ffmpeg -i videos/bg-video.mp4 -vn -acodec libmp3lame -q:a 2` 提取
- 大小：104KB，时长：6秒（与视频一致）

### 5.4 `public/frames/meta.json` — 元数据更新

新增字段 `"audioSrc": "/frames/audio.mp3"`，前端据此加载 `<audio>` 元素。

---

## 6. 已验证结果

- ✅ TypeScript 类型检查通过 (`npm run typecheck`)
- ✅ 开发服务器 HMR 热更新成功（多次修改后均正常 reload）
- ✅ ffmpeg 可用且成功提取音频文件（104KB mp3）
- ✅ meta.json 格式正确，包含 audioSrc 字段
- ✅ React Hooks 规则检查通过（useCallback 提取到顶层后无报错）
- ⚠️ **闪烁/帧堆叠问题待用户实际页面验证**（代码层面已完成全部修复）

---

## 7. 踩过的坑 / 已否定方案 / 关键约束

### 已否定方案

| 尝试过的方案 | 为什么失败 |
|-------------|-----------|
| 单 Canvas 合成 bg+fg | 无法实现文字夹层效果（文字必须在两个图层之间） |
| 去掉 clearRect 避免"清除闪烁" | 前景是透明 PNG，不清除会导致帧堆叠叠加 |
| useEffect 中调用 audio.play() | 不在用户手势上下文中，浏览器拒绝 |
| 内联函数作为 prop 传递 | React hooks 数量变化报错 |
| drawImage(img, 0, 0, w, h) 直接拉伸 | 等于 object-fit:fill，窗口缩放变形 |

### 关键约束

1. **浏览器自动播放策略**：`<audio>` 必须 `autoPlay muted` 才能自动播放；解除静音必须在用户手势上下文（click事件）中
2. **前景图是透明 PNG**：每帧必须先 clearRect 再绘制，否则像素会累积
3. **OffscreenCanvas 需要 modern browser**：IE 不支持，但 Chrome/Firefox/Safari/Edge 均支持
4. **createImageBitmap 是异步的**：返回 Promise，需要在 preload 阶段 await 完成
5. **meta.json 没有 audioSrc = 无音频**：前端不会渲染 `<audio>` 元素

### 容易踩的坑

1. **Canvas 的 drawImage 默认是 fill 模式**——需要自己算 cover 算法
2. **ParallaxLayer 不能直接去掉**——要去掉的是它的 transform 效果，保留容器结构
3. **useCallback/useMemo 不能写在 JSX 内部或条件分支中**——违反 Hooks 规则
4. **音频文件需要单独生成**——preprocess-video.py 的 ffmpeg 步骤可能因环境缺失被跳过

---

## 8. 接手后如何继续

### 启动步骤
```bash
npm install
npm run dev
# 访问 http://localhost:5173
```

### 验证清单（按优先级）
1. **帧堆叠是否消除**：进入视差模式，观察人物是否有"拖影"/"叠影"
2. **闪烁是否改善**：帧切换是否平滑
3. **音频是否可播放**：进入视差模式 → 点击 🔊 按钮 → 是否听到声音
4. **窗口缩放**：拖动浏览器边缘 → 图片是否保持比例不变形
5. **文字层级**：文字应在背景之上、人物之下

### 如果帧堆叠/闪烁仍然存在，排查方向
1. 检查浏览器控制台有无 JS 错误
2. 检查 OffscreenCanvas 是否被浏览器支持
3. 尝试降低 fps（如从 30 降到 24）减轻渲染压力
4. 考虑使用 Web Worker 进行离屏渲染

### 如需重新生成帧+音频
```bash
# 确保 ffmpeg 可用
ffmpeg -version
# 运行完整预处理（含音频提取）
python scripts/preprocess-video.py
# 或仅提取音频（如果帧已有）
ffmpeg -i ./public/videos/bg-video.mp4 -vn -acodec libmp3lame -q:a 2 ./public/frames/audio.mp3 -y
```

---

## 9. 当前仍存在的问题 / 边界

1. **⚠️ 闪烁/帧堆叠待用户验证**：代码层面已做最大努力（ImageBitmap + 双缓冲 + clearRect），但尚未得到用户确认完全解决
2. **视差模式的鼠标跟随效果已禁用**：ParallaxContainer/ParallaxLayer 的 transform 目前未使用（仅作为普通容器），如需恢复需重新调试
3. **181 帧全量预加载**：首次进入视差模式需等待所有帧解码完成（取决于网络和设备性能）
4. **仅验证 Windows + Chrome**：未测试其他浏览器或操作系统
5. **帧文件体积大**：background + foreground 共约 150MB+

---

## 10. 最终想实现的产品目标

- 沉浸式视频 Landing Page，支持两种模式无缝切换
- 视差模式：文字夹在背景和人物之间，形成空间深度感
- 视差模式：流畅无闪烁的帧序列播放（≈30fps）
- 视差模式：音频与视频同步播放
- 响应式适配，任意窗口尺寸下图片不变形

---

## 11. 后续 TODO

### 高优先级
1. **验证闪烁/帧堆叠是否彻底解决** —— 用户刷新页面实测，反馈结果
2. **如果仍有闪烁**：考虑进一步优化方向：
   - 使用 Web Worker 在独立线程进行离屏渲染
   - 降低帧率或使用跳帧策略
   - 尝试 CSS `will-change: contents` 或 GPU 加速提示
3. **恢复鼠标跟随视差效果**（可选）：在确保基础播放稳定后，重新启用 ParallaxLayer 的 transform，但需仔细调参避免再次引起层间偏移

### 中优先级
4. **帧加载优化**：渐进式加载（先显示低分辨率，再逐步替换高分辨率）、懒加载、WebP 格式压缩
5. **加载体验优化**：骨架屏/进度条动画优化，预估剩余时间
6. **响应式完善**：移动端触摸支持、横竖屏适配

### 低优先级
7. **性能监控**：添加 FPS 计数器、内存占用监控
8. **多平台测试**：Safari、Firefox、移动端浏览器兼容性
9. **构建产物优化**：生产环境打包、CDN 分发帧资源
