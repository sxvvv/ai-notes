# 🤝 贡献指南

感谢你对 AI-SX 妙妙屋项目的兴趣！我们欢迎所有形式的贡献。

## 📋 如何贡献

### 报告 Bug

如果发现 Bug，请：

1. 检查 [Issues](https://github.com/sxvvv/ai-notes/issues) 中是否已有相关报告
2. 如果没有，创建新的 Issue，包含：
   - 清晰的标题
   - 详细的描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（浏览器、操作系统等）

### 提出功能建议

1. 检查 [Issues](https://github.com/sxvvv/ai-notes/issues) 中是否已有类似建议
2. 创建新的 Issue，描述：
   - 功能的具体用途
   - 为什么需要这个功能
   - 可能的实现方式（如果有想法）

### 提交代码

1. **Fork 仓库**
   ```bash
   # 点击 GitHub 上的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/你的用户名/ai-notes.git
   cd ai-notes
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **安装依赖**
   ```bash
   npm install
   ```

5. **进行开发**
   - 编写代码
   - 确保代码风格一致
   - 添加必要的注释

6. **测试**
   ```bash
   npm run build
   npm run dev  # 手动测试功能
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

8. **推送并创建 Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   然后在 GitHub 上创建 Pull Request

## 📝 代码规范

### TypeScript

- 使用 TypeScript 类型注解
- 避免使用 `any`，优先使用具体类型
- 使用有意义的变量和函数名

### React

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 使用 TypeScript 接口定义

### 样式

- 使用 Tailwind CSS 类名
- 保持一致的间距和颜色
- 响应式设计优先

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: 添加暗色主题切换功能
fix: 修复编辑器保存时的内存泄漏
docs: 更新 README 中的安装步骤
```

## 🧪 测试

在提交 PR 前，请确保：

- [ ] 代码可以正常构建 (`npm run build`)
- [ ] 没有 TypeScript 错误
- [ ] 功能在浏览器中测试通过
- [ ] 响应式设计在不同设备上测试

## 📖 文档

如果添加新功能，请更新：

- README.md（如果影响使用）
- 相关组件的注释
- 必要的使用示例

## ❓ 问题？

如果有任何问题，可以：

- 创建 [Issue](https://github.com/sxvvv/ai-notes/issues)
- 在 [Discussions](https://github.com/sxvvv/ai-notes/discussions) 中提问

---

**再次感谢你的贡献！🎉**

