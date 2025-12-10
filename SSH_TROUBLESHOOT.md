# 🔧 SSH 连接问题排查

## 当前问题

SSH 连接失败：`Permission denied (publickey)`

## 可能的原因

1. SSH agent 未启动或未加载密钥
2. 密钥文件权限问题
3. GitHub 上的密钥未正确添加

## 解决方案

### 方案 1: 启动 SSH Agent 并添加密钥

```powershell
# 启动 SSH Agent 服务
Start-Service ssh-agent

# 添加密钥到 agent
ssh-add ~\.ssh\id_rsa

# 验证密钥已添加
ssh-add -l

# 测试连接
ssh -T git@github.com
```

### 方案 2: 检查 GitHub 上的密钥

1. **确认密钥已添加**
   - 访问：https://github.com/settings/keys
   - 确认能看到你刚才添加的密钥

2. **检查密钥内容**
   - 确保复制的公钥是完整的一行
   - 确保没有多余的空格或换行

### 方案 3: 使用 GitHub Desktop（最简单）

如果 SSH 配置有问题，使用 GitHub Desktop 是最简单的方案：

1. 下载：https://desktop.github.com/
2. 登录 GitHub 账号
3. File → Add Local Repository
4. 选择 `ai-notes` 文件夹
5. 点击 "Publish repository"

### 方案 4: 使用 HTTPS + Personal Access Token

如果 SSH 一直有问题，可以改回 HTTPS 并使用 Token：

1. **创建 Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - Generate new token (classic)
   - 勾选 `repo` 权限
   - 复制 Token

2. **更改远程地址**
   ```bash
   git remote set-url origin https://github.com/sxvvv/ai-notes.git
   ```

3. **推送时使用 Token**
   ```bash
   git push -u origin main
   # 用户名：sxvvv
   # 密码：粘贴 Token
   ```

---

**💡 推荐**：如果 SSH 配置复杂，使用 GitHub Desktop 或 HTTPS + Token 会更简单。

