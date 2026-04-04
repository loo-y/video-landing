# Handover 文档

## 1. 本次会话目标 / 当前阶段目标

**目标**：构建一个沉浸式视频 Landing Page，支持两种播放模式：
1. **视频模式**：标准视频播放，支持音频控制
2. **视差模式**：帧序列播放，文字夹在背景和人物之间，支持鼠标视差效果

**涉及模块**：
- React Router 7 项目框架
- Tailwind CSS 4 样式系统
- GSAP 动画
- Python 视频预处理脚本（ffmpeg + rembg）

**当前状态**：功能已实现，可切换两种模式。

---

## 2. 当前仓库状态

**已提交的改动**：
- `595efad` fix: revert to muted by default for autoplay policy
- `37866f3` feat: set audio enabled by default
- `a0eae90` fix: refactor audio control with proper state management
- `d37aa9a` fix: audio control and improve UI with Lucide icons
- `f0c577d` docs: update README with project-specific content
- `7c6ffb5` feat: implement immersive video landing page with HeroSection

**未提交的工作区改动**：
- `.gitignore` - 添加 `/public/frames/` 忽略
- `app/components/HeroSection.tsx` - 添加模式切换功能
- `app/components/TypographyLayer.tsx` - 调整 z-index
- `app/components/FramePlayer.tsx` - 新增帧播放器组件
- `app/components/ParallaxContainer.tsx` - 新增视差容器组件
- `scripts/preprocess-video.py` - 视频预处理脚本
- `package.json` / `package-lock.json` - 新增依赖

**依赖环境**：
- Node.js + npm
- Python 3.x + rembg（用于视频预处理）
- ffmpeg（系统安装）

---

## 3. 今天实际遇到的问题

### 问题 1：音频控制不生效
- **现象**：点击音频按钮，视频声音没有变化，按钮状态也不变
- **原因**：VideoPlayer 使用 `forwardRef` 但 ref 没有正确传递到 video 元素
- **解决**：改用直接传递 `videoRef` prop，状态提升到 HeroSection

### 问题 2：视频无法自动播放
- **现象**：设置默认开启音频后，视频不播放
- **原因**：浏览器自动播放策略禁止带声音的视频自动播放
- **解决**：必须默认静音才能自动播放

### 问题 3：`@imgly/background-removal` 在 Node.js 报错
- **现象**：`no available backend found` + `blob:` 协议错误
- **原因**：该库为浏览器设计，Node.js 环境不兼容
- **解决**：改用 Python `rembg` 库

### 问题 4：帧序列播放有阴影/重影
- **现象**：background 和 foreground 看起来没对齐
- **原因**：两个独立的动画组件各自维护帧计数器，导致不同步
- **解决**：合并为 `SyncedFramePlayer` 组件，共享同一个帧计数器

### 问题 5：`ReactNode` 导入报错
- **现象**：`Named export 'ReactNode' not found`
- **原因**：ReactNode 需要作为类型导入
- **解决**：`import type { ReactNode } from "react"`

---

## 4. 原因判断与结论

- **音频问题**：代码逻辑问题，ref 传递方式错误
- **自动播放问题**：浏览器策略限制，无法绕过
- **抠图库兼容性**：第三方库环境限制，换库解决
- **帧同步问题**：代码逻辑问题，共享状态解决

---

## 5. 这次已经落地的修复

| 文件 | 改动内容 | 作用 |
|------|----------|------|
| `app/components/VideoPlayer.tsx` | 接收 `videoRef` 和 `muted` props | 允许父组件控制视频 |
| `app/components/HeroSection.tsx` | 状态提升 + 模式切换 | 统一管理音频状态，支持两种模式切换 |
| `app/components/ActionGroup.tsx` | AudioToggle 改为受控组件 | 正确响应状态变化 |
| `scripts/preprocess-video.py` | Python 视频预处理脚本 | 替代 Node.js 方案 |
| `app/components/ParallaxContainer.tsx` | 鼠标视差容器 | 支持视差效果 |
| `.gitignore` | 添加 `/public/frames/` | 忽略生成的帧文件 |

---

## 6. 已验证结果

- ✅ 视频模式正常播放
- ✅ 音频按钮正常工作（视频模式）
- ✅ Python 预处理脚本成功处理 181 帧
- ✅ 帧序列同步播放，无重影
- ✅ 模式切换按钮正常工作
- ✅ 鼠标视差效果正常

---

## 7. 踩过的坑 / 已否定方案 / 关键约束

### 已否定方案
1. **`@imgly/background-removal`**：Node.js 不兼容，改用 Python rembg
2. **默认开启音频**：浏览器策略禁止，必须静音自动播放

### 关键约束
1. **浏览器自动播放策略**：视频必须静音才能自动播放
2. **帧序列无音频**：图片序列无法播放声音，如需音频需单独添加背景音乐
3. **预处理时间**：181 帧处理约需 2-3 分钟，取决于机器性能

### 容易踩的坑
1. `ReactNode` 必须用 `import type` 导入
2. background 和 foreground 必须共享帧计数器，否则不同步
3. 视差模式下 z-index：背景(0) < 文字(1) < 人物(2)

---

## 8. 接手后如何继续

### 启动步骤
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:5173
```

### 验证清单
1. 视频模式：视频正常播放，音频按钮可用
2. 视差模式：点击右上角切换按钮，帧序列播放，鼠标移动有视差效果

### 如需重新处理视频
```bash
# 确保已安装 Python 和 ffmpeg
python scripts/preprocess-video.py
```

---

## 9. 当前仍存在的问题 / 边界

1. **视差模式无音频**：图片序列无法播放声音
2. **预处理依赖外部工具**：需要 Python + ffmpeg
3. **仅验证 Windows 平台**：未验证 macOS/Linux
4. **帧文件较大**：181 帧约 150MB+

---

## 10. 最终想实现的产品目标

- 沉浸式视频 Landing Page
- 支持文字在人物后面的视差效果
- 支持鼠标视角跟随
- 用户可切换视频模式/视差模式

---

## 11. 后续 TODO

1. **添加背景音乐支持**：视差模式下可播放独立音频文件
2. **优化帧加载**：预加载、懒加载、WebP 格式
3. **添加加载动画**：帧序列加载时显示进度
4. **响应式适配**：目前仅桌面端
5. **性能优化**：考虑使用 Canvas 或 WebGL 渲染帧序列
