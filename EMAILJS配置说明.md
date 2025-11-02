# EmailJS 配置说明

## 什么是 EmailJS？
EmailJS 是一个免费的前端邮件发送服务，允许你直接从前端发送邮件，无需后端服务器。

## 配置步骤

### 1. 注册 EmailJS 账号
访问 https://www.emailjs.com/ 并注册一个免费账号

### 2. 创建邮件服务
1. 登录后，进入 Dashboard
2. 点击 "Email Services" → "Add New Service"
3. 选择一个邮件服务提供商（推荐 Gmail）
4. 按照提示连接你的邮箱账号
5. 记录下 **Service ID**（例如：`service_xxxxx`）

### 3. 创建邮件模板
1. 进入 "Email Templates" → "Create New Template"
2. 设置模板名称（例如：`verification_code`）
3. 在模板内容中添加以下变量：
   - `{{to_email}}` - 收件人邮箱
   - `{{verification_code}}` - 验证码
   - `{{site_name}}` - 网站名称
   
   示例模板内容：
   ```
   主题：dragbit 资源库 - 验证码
   
   内容：
   您好！
   
   您的验证码是：{{verification_code}}
   
   验证码有效期为 5 分钟。
   
   如果这不是您的操作，请忽略此邮件。
   
   {{site_name}} 团队
   ```
4. 保存模板，记录下 **Template ID**（例如：`template_xxxxx`）

### 4. 获取 Public Key
1. 进入 "Account" → "General"
2. 找到 "Public Key"，复制它（例如：`xxxxxxxxxxxxx`）

### 5. 配置到代码中
打开 `register.html` 文件，找到以下代码（约第 303 行）：

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',  // 替换为你的 Public Key
    serviceId: 'YOUR_SERVICE_ID',  // 替换为你的 Service ID
    templateId: 'YOUR_TEMPLATE_ID' // 替换为你的 Template ID
};
```

将三个值替换为你刚才记录的信息：
- `YOUR_PUBLIC_KEY` → 你的 Public Key
- `YOUR_SERVICE_ID` → 你的 Service ID  
- `YOUR_TEMPLATE_ID` → 你的 Template ID

### 6. 测试
1. 打开注册页面
2. 输入邮箱地址
3. 点击"发送验证码"按钮
4. 检查邮箱是否收到验证码

## 免费套餐限制
- 每月 200 封邮件（免费）
- 对于个人项目通常足够

## 故障排查
如果发送失败：
1. 检查配置是否正确
2. 检查浏览器控制台是否有错误信息
3. 确认邮件服务（如 Gmail）已正确连接
4. 如果未配置 EmailJS，验证码会在弹窗中显示（仅用于测试）

