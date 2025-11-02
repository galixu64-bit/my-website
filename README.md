# 🚀 dragbit - 优质资源分享平台

一个现代化的资源分享网站，提供免费软件、文档、媒体等资源的下载和分享。

## ✨ 功能特性

- 🔍 **智能搜索** - 快速搜索资源，支持标签搜索
- 🌍 **多语言支持** - 支持中文和英文
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 👤 **用户系统** - 登录、注册、个人中心
- 💬 **评论系统** - 资源评论和互动
- 🏷️ **标签分类** - 资源标签管理和分类
- 📸 **多媒体展示** - 支持图片和视频预览

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **图标**: Font Awesome
- **存储**: LocalStorage
- **邮件服务**: EmailJS

## 📦 项目结构

```
my-website/
├── index.html          # 主页
├── login.html          # 登录页
├── register.html       # 注册页
├── add-resource.html   # 添加资源页
├── my-resources.html   # 我的资源页
├── profile.html        # 个人中心页
├── style.css           # 样式文件
├── script.js           # 主逻辑
├── auth.js             # 认证逻辑
├── translations.js      # 多语言翻译
├── sitemap.xml         # 网站地图
├── robots.txt          # 搜索引擎规则
└── README.md           # 项目说明
```

## 🚀 快速开始

### 本地运行

1. 克隆或下载项目
2. 使用任意 HTTP 服务器运行（推荐使用 VS Code 的 Live Server 插件）
3. 或使用命令行：
   ```bash
   python -m http.server 8000
   ```
4. 访问 `http://localhost:8000`

## 🌐 部署

### GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支
4. 访问 `https://你的用户名.github.io/仓库名`

### Netlify

1. 访问 [Netlify](https://www.netlify.com)
2. 直接拖拽整个项目文件夹
3. 完成！获得免费网址

详细部署指南请查看 [部署指南.md](./部署指南.md)

## 📝 使用说明

### 默认账号

- 用户名: `user` 或 `demo`
- 密码: `123456`

### 添加资源

1. 登录账号
2. 点击"添加资源"
3. 填写资源信息
4. 提交即可

## 🔒 安全提示

- ⚠️ 这是一个演示项目，使用 LocalStorage 存储数据
- ⚠️ 生产环境请使用真实的数据库和后端服务
- ⚠️ 请妥善保管 EmailJS API 密钥

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- 网站: [dragbit.com](https://dragbit.com)
- GitHub: [@your-username](https://github.com/your-username)

---

Made with ❤️ by dragbit team
