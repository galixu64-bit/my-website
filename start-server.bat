@echo off
echo ========================================
echo 启动本地服务器
echo ========================================
echo.
echo 检测 Python...

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python 已安装
    echo.
    echo 正在启动服务器...
    echo 请在浏览器中访问: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
) else (
    echo Python 未安装，尝试使用 Node.js...
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Node.js 已安装
        echo.
        echo 正在启动服务器...
        echo 请在浏览器中访问: http://localhost:8080
        echo 按 Ctrl+C 停止服务器
        echo.
        npx http-server -p 8080 -c-1
    ) else (
        echo.
        echo [错误] 未检测到 Python 或 Node.js
        echo.
        echo 请安装以下任一工具：
        echo 1. Python: https://www.python.org/downloads/
        echo 2. Node.js: https://nodejs.org/
        echo.
        pause
    )
)
