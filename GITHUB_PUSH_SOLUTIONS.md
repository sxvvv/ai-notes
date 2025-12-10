# 🚀 GitHub 推送解决方案

## 当前问题

1. **HTTPS 方式**：443 端口连接失败（可能是防火墙/代理问题）
2. **SSH 方式**：需要配置 SSH 密钥

## 解决方案

### 方案 1: 使用 GitHub Desktop（最简单，推荐）

1. **下载安装**
   - 访问：https://desktop.github.com/
   - 下载并安装 GitHub Desktop

2. **登录并添加仓库**
   - 打开 GitHub Desktop
   - 登录你的 GitHub 账号（`sxvvv`）
   - File → Add Local Repository
   - 选择：`C:\Users\Administrator\Downloads\package\ai-notes`
   - 点击 "Add repository"

3. **发布到 GitHub**
   - 点击 "Publish repository" 按钮
   - Repository name: `ai-notes`
   - Description: `AI-powered note-taking application with Supabase Auth`
   - 选择 Private 或 Public
   - 点击 "Publish repository"

**优点**：图形界面，简单易用，自动处理认证

### 方案 2: 配置 SSH 密钥（如果要用命令行）

1. **检查是否已有 SSH 密钥**
   ```bash
   ls ~/.ssh/id_ed25519.pub
   # 或
   ls ~/.ssh/id_rsa.pub
   ```

2. **如果没有，生成新的 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 按回车使用默认路径
   # 可以设置密码或直接回车（不设置密码）
   ```

3. **复制公钥内容**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 或 Windows PowerShell
   type ~\.ssh\id_ed25519.pub
   ```

4. **添加到 GitHub**
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - Title: `ai-notes-push`
   - Key: 粘贴刚才复制的公钥内容
   - 点击 "Add SSH key"

5. **测试连接**
   ```bash
   ssh -T git@github.com
   # 应该看到：Hi sxvvv! You've successfully authenticated...
   ```

6. **更改远程地址并推送**
   ```bash
   cd C:\Users\Administrator\Downloads\package\ai-notes
   git remote set-url origin git@github.com:sxvvv/ai-notes.git
   git push -u origin main
   ```

### 方案 3: 使用 Personal Access Token（HTTPS）

如果 HTTPS 443 端口问题解决了，可以使用 Token：

1. **创建 Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - Note: `ai-notes-push`
   - Expiration: 选择过期时间
   - Select scopes: 勾选 `repo`
   - 点击 "Generate token"
   - **复制 Token**（只显示一次）

2. **推送时使用 Token**
   ```bash
   git push -u origin main
   # 用户名：sxvvv
   # 密码：粘贴刚才复制的 Token（不是 GitHub 密码）
   ```

### 方案 4: 检查网络/防火墙设置

如果是 443 端口被阻止：

1. **检查防火墙**
   - Windows 防火墙设置
   - 允许 Git/HTTPS 通过

2. **检查代理设置**
   - 如果使用代理，需要配置 Git 代理
   ```bash
   git config --global http.proxy http://代理地址:端口
   git config --global https.proxy https://代理地址:端口
   ```

3. **尝试使用手机热点**
   - 切换网络环境测试

## 推荐方案

**最简单**：使用 GitHub Desktop（方案 1）

**最灵活**：配置 SSH 密钥（方案 2）

---

**💡 提示**：如果选择方案 1（GitHub Desktop），不需要任何命令行操作，图形界面就能完成所有步骤！

