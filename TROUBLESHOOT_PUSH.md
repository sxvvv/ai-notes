# 🔧 推送问题排查

## 当前问题

网络连接问题：无法连接到 `github.com:443`

## 解决方案

### 方案 1: 检查网络连接

1. **检查网络**
   - 确认网络连接正常
   - 尝试访问 https://github.com 看是否能打开

2. **重试推送**
   ```bash
   git push -u origin main
   ```

### 方案 2: 配置代理（如果使用代理）

如果你在使用代理，需要配置 Git：

```bash
# 设置 HTTP 代理
git config --global http.proxy http://代理地址:端口
git config --global https.proxy https://代理地址:端口

# 或者只对 GitHub 设置
git config --global http.https://github.com.proxy http://代理地址:端口
```

### 方案 3: 使用 SSH 方式（推荐）

如果 HTTPS 方式有问题，可以改用 SSH：

1. **生成 SSH 密钥**（如果还没有）
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加 SSH 密钥到 GitHub**
   - 复制 `~/.ssh/id_ed25519.pub` 的内容
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥并保存

3. **更改远程仓库地址为 SSH**
   ```bash
   git remote set-url origin git@github.com:sxvvv/ai-notes.git
   ```

4. **再次推送**
   ```bash
   git push -u origin main
   ```

### 方案 4: 使用 GitHub Desktop

如果命令行有问题，可以使用 GitHub Desktop：

1. 下载：https://desktop.github.com/
2. 登录你的 GitHub 账号
3. File → Add Local Repository
4. 选择 `ai-notes` 文件夹
5. 点击 "Publish repository"

### 方案 5: 稍后重试

如果是临时网络问题，可以：
- 等待几分钟后重试
- 更换网络环境（如使用手机热点）
- 检查防火墙设置

## 验证连接

测试 GitHub 连接：

```bash
# 测试 HTTPS
curl -I https://github.com

# 测试 SSH（如果配置了）
ssh -T git@github.com
```

---

**💡 提示：** 如果问题持续，可以尝试使用 GitHub Desktop 或稍后重试。

