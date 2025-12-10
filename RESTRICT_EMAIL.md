# 🔒 限制编辑权限为单个邮箱

## 📋 说明

已创建新的 RLS 策略，限制只有指定邮箱可以编辑。

## 🚀 执行步骤

### 在 Supabase SQL Editor 中执行

1. **打开 SQL Editor**
   - 访问：https://supabase.com/dashboard
   - 选择项目 → SQL Editor → New query

2. **执行限制策略 SQL**
   - 打开文件：`supabase/migrations/restrict_to_single_email.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

3. **验证执行结果**
   - 应该看到 "Success. No rows returned"
   - 这表示策略已成功更新

## ✅ 执行后的权限

### 对于授权邮箱（你）
- ✅ 可以查看所有笔记
- ✅ 可以创建笔记
- ✅ 可以编辑笔记
- ✅ 可以删除笔记
- ✅ 可以管理分类

### 对于其他用户（包括其他登录用户）
- ✅ 可以查看所有笔记
- ❌ **无法创建笔记**（会显示权限错误）
- ❌ **无法编辑笔记**（会显示权限错误）
- ❌ **无法删除笔记**（会显示权限错误）
- ❌ **无法管理分类**（会显示权限错误）

## 🔍 验证方法

### 方法 1：在网站中测试

1. **使用你的邮箱登录**
   - 访问网站
   - 使用授权邮箱登录
   - 应该可以正常创建、编辑笔记

2. **使用其他邮箱测试（如果有）**
   - 注册/登录另一个邮箱
   - 尝试创建笔记
   - 应该显示权限错误

### 方法 2：在 Supabase 中检查策略

执行以下 SQL 验证策略：

```sql
-- 检查策略是否已更新
SELECT 
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN with_check LIKE '%@%' THEN '✅ 已限制'
        WHEN with_check LIKE '%authenticated%' THEN '❌ 未限制'
        ELSE '其他'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('notes', 'categories')
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
ORDER BY tablename, cmd;
```

预期结果：所有策略的 `status` 应该显示 "✅ 已限制"

## 🔄 如果需要修改邮箱

如果以后需要更改允许的邮箱，执行以下 SQL：

```sql
-- 替换所有策略中的邮箱地址
-- 将 'your_email@example.com' 替换为新的邮箱

-- 例如，改为 newemail@example.com：
-- 需要重新执行 restrict_to_single_email.sql，但先修改文件中的邮箱地址
```

或者直接执行：

```sql
-- 删除所有策略
-- 然后重新创建策略，使用新邮箱
```

## ⚠️ 重要提示

1. **确保使用正确的邮箱登录**
   - 必须使用授权邮箱注册/登录
   - 如果之前用其他邮箱注册过，需要重新用这个邮箱注册

2. **其他用户无法编辑**
   - 即使他们注册并登录，也无法编辑
   - 只有你的邮箱可以编辑

3. **安全性**
   - 邮箱地址硬编码在数据库策略中
   - 只有你能修改这些策略（通过 Supabase Dashboard）

## 🐛 故障排查

### 问题：登录后仍无法编辑

**可能原因：**
   - 使用的邮箱不是授权邮箱
- 策略未正确执行

**解决方法：**
1. 确认登录邮箱是授权邮箱
2. 检查 Supabase 中的策略是否正确
3. 尝试退出重新登录

### 问题：其他用户仍可以编辑

**可能原因：**
- 策略未正确更新
- 使用了旧的策略

**解决方法：**
1. 重新执行 `restrict_to_single_email.sql`
2. 验证策略中的邮箱地址是否正确

---

**🎉 执行完成后，只有你的邮箱可以编辑，其他人只能查看！**

