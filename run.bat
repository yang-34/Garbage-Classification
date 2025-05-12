@echo off
:: 设置中文编码
chcp 65001 > nul
echo 正在启动垃圾分类查询系统...

:: 检查Python是否安装
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python，请安装Python 3.7+
    pause
    exit /b 1
)

:: 检查并创建虚拟环境
if not exist venv (
    echo 正在创建虚拟环境...
    python -m venv venv
)

:: 激活虚拟环境
call venv\Scripts\activate

:: 安装依赖
echo 正在安装依赖...
pip install -r requirements.txt

:: 设置环境变量以禁用警告
set FLASK_ENV=development
:: 设置生产模式，减少警告
set FLASK_APP=app.py

:: 启动应用
echo 启动完成，正在打开应用...
python -W ignore app.py

:: 防止窗口立即关闭
pause 