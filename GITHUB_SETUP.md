# 🚀 GitHub 上传指南

## ✅ 已完成的准备工作

1. ✅ 创建了 `.gitignore` 文件（排除敏感信息和构建文件）
2. ✅ 创建了 `.env.example` 文件（环境变量模板）
3. ✅ 修改代码使用环境变量（不再硬编码敏感信息）
4. ✅ 清理了 SQL 文件中的个人信息

## 📋 上传前检查清单

### 1. 创建 `.env` 文件（不要上传到 GitHub）

在项目根目录创建 `.env` 文件：

```bash
# .env (这个文件已经在 .gitignore 中，不会被上传)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_AI_API_URL=https://api.zetatechs.com/v1/messages
VITE_AI_API_KEY=your_ai_api_key_here
VITE_ALLOWED_EDITOR_EMAIL=your_email@example.com
```

### 2. 检查敏感信息

确保以下文件不包含你的个人信息：

- ✅ `src/lib/supabase.ts` - 已改为使用环境变量
- ✅ `src/lib/ai.ts` - 已改为使用环境变量
- ✅ `supabase/migrations/restrict_to_single_email.sql` - 已改为示例邮箱
- ✅ `.env` - 已在 `.gitignore` 中

### 3. 删除不必要的文件（可选）

以下文件可以删除或移到其他位置：

- `test-auth.html` - 测试文件，可以删除
- `verify_rls.sql` - 验证文件，可以删除
- `dist/` - 构建文件，已在 `.gitignore` 中
- `node_modules/` - 依赖包，已在 `.gitignore` 中

## 🔐 GitHub 上传步骤

### 方法 1：使用 GitHub Desktop（推荐新手）

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 安装并登录你的 GitHub 账号

2. **创建新仓库**
   - 在 GitHub Desktop 中点击 "File" → "New Repository"
   - Repository name: `ai-notes`（或你喜欢的名字）
   - Description: "AI-powered note-taking application with Supabase"
   - 选择本地路径
   - 点击 "Create Repository"

3. **提交并推送**
   - 在 GitHub Desktop 中会看到所有更改
   - 填写 Commit message: "Initial commit"
   - 点击 "Commit to main"
   - 点击 "Push origin" 上传到 GitHub

### 方法 2：使用 Git 命令行

1. **初始化 Git 仓库**

```bash
cd ai-notes
git init
```

2. **添加文件**

```bash
git add .
```

3. **提交**

```bash
git commit -m "Initial commit: AI notes application"
```

4. **在 GitHub 创建仓库**
   - 访问：https://github.com/new
   - Repository name: `ai-notes`
   - Description: "AI-powered note-taking application with Supabase"
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize with README"
   - 点击 "Create repository"

5. **连接并推送**

```bash
git remote add origin https://github.com/你的用户名/ai-notes.git
git branch -M main
git push -u origin main
```

## 🔒 安全建议

### 1. 使用 Private Repository（推荐）

- 如果包含业务逻辑或不想公开，选择 Private
- Private 仓库只有你可以看到

### 2. 使用 GitHub Secrets（用于 CI/CD）

如果使用 GitHub Actions 自动部署：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AI_API_KEY`
   - `VITE_ALLOWED_EDITOR_EMAIL`

### 3. 检查已上传的内容

上传后，检查以下内容确保没有泄露：

- ✅ 没有 `.env` 文件
- ✅ 没有 API keys 硬编码
- ✅ 没有个人邮箱地址（除了示例）
- ✅ 没有密码

### 4. 如果意外上传了敏感信息

如果发现上传了敏感信息：

1. **立即删除敏感信息**
   - 从代码中删除
   - 重新提交

2. **轮换密钥**
   - 在 Supabase 中重新生成 Anon Key
   - 更新 AI API Key（如果可能）

3. **使用 git-filter-repo 清理历史**（高级）

```bash
# 安装 git-filter-repo
pip install git-filter-repo

# 从历史中删除敏感文件
git filter-repo --path .env --invert-paths
```

## 📝 README 更新建议

更新 `README.md`，添加：

1. **环境变量配置说明**
2. **安装步骤**
3. **部署指南链接**
4. **贡献指南**

## ✅ 上传后验证

1. **访问你的 GitHub 仓库**
   - 确认所有文件都已上传
   - 确认 `.env` 文件**没有**被上传

2. **克隆测试**（可选）

```bash
# 在另一个目录测试克隆
cd /tmp
git clone https://github.com/你的用户名/ai-notes.git
cd ai-notes
# 检查是否有敏感信息
grep -r "your_email@example.com" .
grep -r "sk-a2D3f4jXX34QnSDGTivu5xUEgLU1O8GyqkgEMe5iX6NgTwIU" .
# 应该没有结果
```

## 🎉 完成！

上传完成后，你的项目就可以：
- ✅ 安全地分享给其他人
- ✅ 作为作品集展示
- ✅ 接受贡献和反馈
- ✅ 版本控制和管理

---

**💡 提示：** 记得定期更新依赖包，保持项目安全！

