# Handover 文档

## 1. 本次会话目标 / 当前阶段目标

**目标**：在现有 Parallax Mode 基础上增强视觉效果，实现鼠标视差和呼吸微动。

**本次会话涉及的功能范围**：
- 新增 **PixiJS 渲染模式**（WebGL）
- **鼠标视差效果**：背景和人物层根据鼠标位置产生不同偏移
- **呼吸微动效果**：人物层轻微 scale 动画
- 三种模式切换：Video / Parallax (Canvas) / Parallax (PixiJS)

**当前状态**：PixiJS 模式基础功能已实现，可正常渲染和播放。代码已提交到 `feature/parallax-effects` 分支。

---

## 2. 当前仓库状态

**分支**：`feature/parallax-effects`（从 main 分支创建）

**本次会话改动**：

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 pixi.js 依赖 |
| `app/components/PixiFramePlayer.tsx` | 新建 | PixiJS WebGL 渲染组件 |
| `app/components/HeroSection.tsx` | 修改 | 添加三种模式切换逻辑 |
| `README.md` | 修改 | 更新技术栈说明 |

**依赖环境**：
- Node.js + npm
- Python 3.x + rembg（用于视频预处理）
- ffmpeg（系统安装）
- 浏览器需支持 WebGL 和 OffscreenCanvas API

---

## 3. 技术实现

### 3.1 PixiJS 渲染架构

```
PixiFramePlayer
├── PixiJS Application (WebGL)
│   ├── bgContainer (z-0) - 背景层精灵
│   │   └── Sprite[] - 240帧背景图
│   └── fgContainer (z-2) - 人物层精灵 + 呼吸动画
│       └── Sprite[] - 240帧前景图
└── DOM overlay: TypographyLayer (z-1)
```

### 3.2 关键技术点

| 技术点 | 实现方式 | 说明 |
|--------|----------|------|
| **帧加载** | `ImageBitmap` + `Texture.from()` | 分批加载，每批20帧 |
| **鼠标视差** | Container position 插值 | 背景15px偏移，人物40px偏移 |
| **呼吸微动** | `sin()` scale 动画 | 1.0 → 1.015 → 1.0，周期约8秒 |
| **平滑过渡** | lerp 插值 (factor=0.08) | 视差偏移平滑跟随鼠标 |
| **object-fit:cover** | 手动计算 scale + anchor(0.5) | 保持宽高比，居中裁剪 |

### 3.3 核心代码逻辑

```typescript
// 帧切换
const nextFrame = (prevFrame + 1) % totalFrames;
bgSprites[prevFrame].visible = false;
bgSprites[nextFrame].visible = true;

// 呼吸动画
breatheTime += 0.008;
const breatheScale = 1 + Math.sin(breatheTime) * 0.015;
fgContainer.scale.set(breatheScale);

// 视差偏移（平滑插值）
bgCurrent.x += (bgTarget.x - bgCurrent.x) * 0.08;
bgContainer.position.set(bgCurrent.x, bgCurrent.y);
```

---

## 4. 踩过的坑

### 问题 1：PixiJS v8 API 变化
- **现象**：使用 v7 API 导致初始化失败
- **解决**：使用 `app.init()` 异步初始化，`app.canvas` 获取 canvas 元素

### 问题 2：图片只显示左上角一部分
- **现象**：sprite 定位错误，只显示图片右下角
- **原因**：anchor 和 position 配合错误
- **解决**：
  - sprite 设置 `anchor.set(0.5)` 和 `x = width/2, y = height/2`
  - container position 从 (0, 0) 开始
  - 视差偏移直接改变 container 的 position

### 问题 3：Loading 状态时容器尺寸为 0
- **现象**：初始化时获取的容器尺寸不正确
- **解决**：使用 `window.innerWidth/Height` 作为 fallback，延迟 50ms 初始化

---

## 5. 已验证结果

- ✅ TypeScript 类型检查通过
- ✅ 三种模式可正常切换
- ✅ PixiJS 模式帧序列正常播放
- ✅ 鼠标视差效果正常
- ✅ 呼吸微动效果正常
- ✅ 窗口缩放自适应

---

## 6. 当前仍存在的问题

1. **文字层级**：PixiJS 模式下文字在所有图层之上（DOM overlay），无法实现"夹层"效果
   - 解决方案：需要将文字也渲染到 PixiJS 中，或使用深度图

2. **帧加载时间长**：240帧 × 2层 = 480张图片，首次加载需要等待
   - 优化方向：渐进式加载、WebP 压缩

3. **景深虚化未实现**：需要生成深度图
   - 计划：使用 Depth-Anything-V2-Large 模型

---

## 7. 后续 TODO

### 高优先级
1. **文字夹层效果**：在 PixiJS 中渲染文字，或调整 z-index
2. **深度图生成**：运行 `scripts/generate-depth.py`（待创建）
3. **景深虚化效果**：基于深度图实现动态 blur

### 中优先级
4. **帧加载优化**：渐进式加载、预加载指示器优化
5. **参数可配置**：视差强度、呼吸幅度、帧率等
6. **性能监控**：FPS 计数器

### 低优先级
7. **移动端适配**：触摸事件支持
8. **多浏览器测试**：Safari、Firefox 兼容性

---

## 8. 接手后如何继续

### 启动步骤
```bash
git checkout feature/parallax-effects
npm install
npm run dev
# 访问 http://localhost:5173
```

### 验证清单
1. 点击右上角菜单，切换到 "Parallax (PixiJS)" 模式
2. 移动鼠标，观察背景和人物层的视差效果
3. 观察人物层是否有轻微的呼吸动画
4. 测试窗口缩放是否正常

### 如需修改视差参数
```typescript
// 在 PixiFramePlayer.tsx 中修改
bgTargetRef.current = { x: -mousePosition.x * 15, y: -mousePosition.y * 15 }; // 背景偏移
fgTargetRef.current = { x: -mousePosition.x * 40, y: -mousePosition.y * 40 }; // 人物偏移

// 呼吸动画幅度
const breatheScale = 1 + Math.sin(breatheTimeRef.current) * 0.015; // 0.015 = 1.5%
```

---

## 9. 最终想实现的产品目标

- 沉浸式视频 Landing Page，支持三种模式无缝切换
- PixiJS 模式：鼠标视差 + 呼吸微动 + 景深虚化
- 文字夹在背景和人物之间，形成空间深度感
- 流畅无闪烁的帧序列播放（≈30fps）
