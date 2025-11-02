# 如何启动本地服务器

## 方法 1：使用启动脚本（推荐）

直接双击 `start-server.bat` 文件即可。

## 方法 2：使用 Python

如果已安装 Python：

```bash
cd c:\Users\shiji\my-website
python -m http.server 8000
```

然后访问：http://localhost:8000

## 方法 3：使用 Node.js

如果已安装 Node.js：

```bash
cd c:\Users\shiji\my-website
npx http-server -p 8080 -c-1
```

然后访问：http://localhost:8080

## 方法 4：使用 VS Code Live Server（最简单）

1. 安装 VS Code
2. 安装 "Live Server" 插件
3. 右键点击 `index.html` → 选择 "Open with Live Server"

## 常见问题

### "refused to connect" 错误

1. 确保服务器已启动（终端窗口没有关闭）
2. 检查端口是否被占用
3. 尝试访问 http://127.0.0.1:8000 而不是 localhost

### 端口被占用

如果 8000 端口被占用，可以使用其他端口：

```bash
python -m http.server 3000
```

然后访问：http://localhost:3000

