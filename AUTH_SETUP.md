# 🔐 服务端权限验证配置指南

## 📋 概述

现在系统已实现**服务端权限验证**，使用 Supabase Auth 进行身份认证。这意味着：

- ✅ **访客只能查看**：未登录用户只能读取笔记，无法编辑
- ✅ **登录用户可编辑**：只有通过邮箱密码登录的用户才能创建、修改、删除笔记
- ✅ **服务端验证**：权限验证在 Supabase 数据库层面进行，无法绕过

## 🚀 配置步骤

### 步骤 1：在 Supabase 中执行 RLS 策略

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目：`cypkhkyuwwjqqfvjujrj`

2. **打开 SQL Editor**
   - 点击左侧菜单的 "SQL Editor"
   - 点击 "New query"

3. **执行 RLS 策略 SQL**
   - 复制 `supabase/migrations/enable_auth_rls.sql` 文件的内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 执行

   这将：
   - 删除旧的公开访问策略
   - 创建新的权限策略：
     - 所有人可以读取（SELECT）
     - 只有认证用户可以写入（INSERT/UPDATE/DELETE）

### 步骤 2：启用 Supabase Auth

1. **在 Supabase Dashboard 中**
   - 点击左侧菜单的 "Authentication"
   - 点击 "Providers"

2. **配置 Email Provider**
   - 确保 "Email" 提供者已启用
   - 可以选择是否启用 "Confirm email"（邮箱验证）
     - 如果启用：用户注册后需要点击邮件中的链接才能登录
     - 如果禁用：用户注册后可直接登录

3. **（可选）配置其他设置**
   - "Site URL": 设置为你的 Vercel 部署地址
   - "Redirect URLs": 添加你的部署地址

### 步骤 3：创建第一个账号

1. **访问你的网站**
   - 打开部署的网站地址

2. **注册账号**
   - 按 `Ctrl+Shift+E` 打开登录对话框
   - 点击 "没有账号？点击注册"
   - 输入邮箱和密码（至少6位）
   - 点击 "确认"

3. **（如果启用了邮箱验证）**
   - 检查邮箱，点击验证链接
   - 然后使用邮箱和密码登录

4. **登录后**
   - 你将看到导航栏显示你的邮箱
   - 可以正常创建、编辑、删除笔记

## 🔑 使用说明

### 对于访客（未登录）

- ✅ 可以查看所有笔记
- ✅ 可以搜索笔记
- ✅ 可以查看分类
- ❌ **无法创建笔记**
- ❌ **无法编辑笔记**
- ❌ **无法删除笔记**
- ❌ **无法管理分类**

### 对于登录用户

- ✅ 所有访客权限
- ✅ 可以创建笔记
- ✅ 可以编辑笔记
- ✅ 可以删除笔记
- ✅ 可以管理分类
- ✅ 导航栏显示邮箱
- ✅ 可以退出登录

### 快捷键

- `Ctrl+Shift+E` (或 `Cmd+Shift+E`): 打开登录/注册对话框
- 鼠标悬停在导航栏右侧：显示登录提示

## 🛠️ 故障排查

### 问题 1: 无法创建/编辑笔记

**可能原因：**
- RLS 策略未正确执行
- 未登录或登录已过期

**解决方法：**
1. 检查 Supabase SQL Editor 中是否成功执行了 RLS 策略
2. 检查浏览器控制台是否有错误
3. 尝试重新登录

### 问题 2: 注册后无法登录

**可能原因：**
- 启用了邮箱验证但未点击验证链接
- 密码错误

**解决方法：**
1. 检查邮箱（包括垃圾邮件文件夹）
2. 点击验证链接
3. 确认密码正确

### 问题 3: 登录状态丢失

**可能原因：**
- 浏览器清除了 localStorage
- Session 过期

**解决方法：**
1. 重新登录
2. 检查 Supabase Auth 设置中的 Session 过期时间

## 📝 重要提示

1. **第一个账号很重要**：第一个注册的账号将成为管理员，可以管理所有内容

2. **密码安全**：建议使用强密码（至少8位，包含字母、数字）

3. **邮箱验证**：如果启用了邮箱验证，确保邮箱地址正确且可接收邮件

4. **RLS 策略**：执行 RLS 策略后，旧的公开访问策略将被删除，只有登录用户才能编辑

5. **数据安全**：所有写操作（创建、更新、删除）现在都在服务端验证，无法绕过

## 🔄 回退到旧系统

如果需要回退到旧的密码系统：

1. 在 Supabase SQL Editor 中执行：
```sql
-- 删除认证策略
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can create categories" ON categories;
-- ... (删除所有新策略)

-- 恢复公开访问
CREATE POLICY "Public access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON notes FOR ALL USING (true) WITH CHECK (true);
-- ... (为所有表恢复公开访问)
```

2. 恢复 `src/lib/auth.ts` 中的旧代码

3. 恢复 `src/components/AuthDialog.tsx` 中的旧代码

## ✅ 验证配置

配置完成后，验证以下内容：

- [ ] RLS 策略已执行
- [ ] Supabase Auth 已启用
- [ ] 可以注册新账号
- [ ] 可以登录
- [ ] 登录后可以创建笔记
- [ ] 未登录时无法创建笔记（会显示错误）
- [ ] 导航栏显示邮箱
- [ ] 可以退出登录

---

**🎉 配置完成后，你的笔记系统就有了真正的服务端权限验证！**

