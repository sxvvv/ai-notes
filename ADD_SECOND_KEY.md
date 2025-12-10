# 🔑 添加第二个 SSH 密钥

## 问题

SSH 正在尝试使用 `id_rsa_2` 密钥，但这个密钥可能还没有添加到 GitHub。

## 解决方案

### 步骤 1: 复制第二个公钥

上面的命令已经显示了 `id_rsa_2.pub` 的内容，复制完整的一行。

### 步骤 2: 添加到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 "New SSH key"
3. 填写：
   - Title: `ai-notes-push-2`
   - Key: 粘贴 `id_rsa_2.pub` 的完整内容
4. 点击 "Add SSH key"

### 步骤 3: 测试

添加完成后告诉我，我会帮你测试连接并推送代码。

---

**或者**，如果你想使用第一个密钥（id_rsa），我可以帮你配置 SSH 使用它。

