# 🔍 Supabase 配置检查清单

## 📋 快速检查步骤

### 步骤 1: 检查 Supabase 项目连接

1. **访问 Supabase Dashboard**
   - 网址：https://supabase.com/dashboard
   - 登录你的账号

2. **确认项目**
   - 项目 URL: `https://cypkhkyuwwjqqfvjujrj.supabase.co`
   - 如果看不到项目，需要创建或导入

### 步骤 2: 检查 RLS 策略状态

1. **打开 SQL Editor**
   - 左侧菜单 → "SQL Editor"
   - 点击 "New query"

2. **执行检查查询**
   复制以下 SQL 并执行：

```sql
-- 检查 RLS 是否启用
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('notes', 'categories', 'tags', 'note_tags', 'learning_progress')
ORDER BY tablename;
```

**预期结果：**
- 所有表的 `rls_enabled` 应该为 `true`

3. **检查现有策略**
   执行以下 SQL：

```sql
-- 检查所有表的策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('notes', 'categories', 'tags', 'note_tags', 'learning_progress')
ORDER BY tablename, policyname;
```

**预期结果：**
- 每个表应该有：
  - 1 个 SELECT 策略（允许所有人读取）
  - 1 个 INSERT 策略（只允许认证用户）
  - 1 个 UPDATE 策略（只允许认证用户）
  - 1 个 DELETE 策略（只允许认证用户）

### 步骤 3: 检查 Authentication 设置

1. **打开 Authentication**
   - 左侧菜单 → "Authentication"
   - 点击 "Providers"

2. **检查 Email Provider**
   - ✅ "Email" 应该已启用
   - ✅ "Confirm email" 可以启用或禁用（建议先禁用，方便测试）

3. **检查 Settings**
   - 点击 "Settings"
   - 确认 "Site URL" 已设置（可以是你的 Vercel 地址）
   - 确认 "Redirect URLs" 包含你的部署地址

### 步骤 4: 执行 RLS 策略（如果未执行）

如果检查发现策略不正确，执行以下步骤：

1. **打开 SQL Editor**
   - 左侧菜单 → "SQL Editor"
   - 点击 "New query"

2. **执行 RLS 策略 SQL**
   - 打开文件：`supabase/migrations/enable_auth_rls.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

3. **验证执行结果**
   - 应该看到 "Success. No rows returned"
   - 再次执行步骤 2 的检查查询，确认策略已创建

### 步骤 5: 测试认证功能

1. **在浏览器中测试**
   - 打开你的网站
   - 按 `Ctrl+Shift+E` 打开登录对话框
   - 尝试注册一个新账号

2. **检查注册是否成功**
   - 在 Supabase Dashboard → Authentication → Users
   - 应该能看到新注册的用户

3. **测试权限**
   - **未登录时**：尝试创建笔记，应该失败（显示错误）
   - **登录后**：应该可以正常创建、编辑笔记

## 🐛 常见问题排查

### 问题 1: RLS 策略执行失败

**错误信息：** `policy "Public access" does not exist`

**解决方法：**
- 这是正常的，说明旧的策略已经不存在
- 继续执行后续的 CREATE POLICY 语句即可

### 问题 2: 无法注册账号

**可能原因：**
- Email provider 未启用
- 邮箱验证已启用但未收到邮件

**解决方法：**
1. 检查 Authentication → Providers → Email 是否启用
2. 如果启用了邮箱验证，检查垃圾邮件文件夹
3. 或者暂时禁用邮箱验证进行测试

### 问题 3: 登录后仍无法编辑

**可能原因：**
- RLS 策略未正确执行
- Session 未正确保存

**解决方法：**
1. 检查浏览器控制台是否有错误
2. 检查 Supabase SQL Editor 中的策略是否正确
3. 尝试清除浏览器缓存并重新登录

### 问题 4: 策略冲突

**错误信息：** `policy already exists`

**解决方法：**
- 先删除旧策略，再创建新策略
- 执行以下 SQL：

```sql
-- 删除所有旧策略
DROP POLICY IF EXISTS "Public access" ON categories;
DROP POLICY IF EXISTS "Public access" ON notes;
DROP POLICY IF EXISTS "Public access" ON tags;
DROP POLICY IF EXISTS "Public access" ON note_tags;
DROP POLICY IF EXISTS "Public access" ON learning_progress;

-- 然后执行 enable_auth_rls.sql
```

## ✅ 验证清单

完成以下检查后，配置就正确了：

- [ ] Supabase 项目可以访问
- [ ] 所有表的 RLS 已启用
- [ ] 每个表有正确的策略（SELECT 公开，INSERT/UPDATE/DELETE 需要认证）
- [ ] Email provider 已启用
- [ ] 可以在网站注册账号
- [ ] 注册的用户出现在 Supabase Users 列表中
- [ ] 未登录时无法创建笔记
- [ ] 登录后可以创建笔记
- [ ] 导航栏显示登录邮箱
- [ ] 可以退出登录

## 🔧 快速修复脚本

如果遇到问题，可以使用以下 SQL 快速重置：

```sql
-- 1. 删除所有策略
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
              AND tablename IN ('notes', 'categories', 'tags', 'note_tags', 'learning_progress')) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Public access" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read ' || r.tablename || '" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only authenticated users can create ' || r.tablename || '" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only authenticated users can update ' || r.tablename || '" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only authenticated users can delete ' || r.tablename || '" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. 然后执行 enable_auth_rls.sql 中的 CREATE POLICY 语句
```

---

**💡 提示：** 如果所有检查都通过，你的服务端权限验证就配置完成了！

