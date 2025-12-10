# 🚀 快速启动指南

## 第一步：安装依赖

```bash
cd ai-notes
npm install
```

## 第二步：启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

## 第三步：访问应用

在浏览器中打开 `http://localhost:5173`，你将看到：

1. **仪表板页面** - 显示学习统计和进度
2. **侧边栏** - 分类导航和学习进度
3. **笔记列表** - 所有笔记的列表
4. **编辑器** - 点击笔记进入编辑模式

## 功能演示

### 创建新笔记
- 点击左上角"新建笔记"按钮
- 或使用快捷键 `Ctrl+N` (Windows) / `Cmd+N` (Mac)

### 搜索笔记
- 点击搜索框或使用 `Ctrl+K` / `Cmd+K`
- 输入关键词搜索

### 编辑笔记
- 点击笔记卡片进入编辑模式
- 左侧编辑，右侧实时预览
- 使用 `Ctrl+S` 保存
- 使用 `Ctrl+P` 切换预览模式

### 移动端使用
- 在移动设备上打开应用
- 点击左上角菜单按钮打开侧边栏
- 所有功能都针对移动端优化

## 构建生产版本

```bash
npm run build
```

构建完成后，文件在 `dist` 目录中。

## 预览生产构建

```bash
npm run preview
```

## 常见问题

### 端口被占用
如果 5173 端口被占用，Vite 会自动尝试下一个可用端口。

### 依赖安装失败
尝试清除缓存后重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase 连接问题
确保在 `src/lib/supabase.ts` 中配置了正确的 Supabase URL 和 API Key。

---

**🎉 开始使用你的学习笔记应用吧！**

