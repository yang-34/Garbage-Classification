@echo off
chcp 65001 >nul
echo 正在启动垃圾分类应用...

:: 检查Python环境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python未安装或未添加到PATH，请安装Python并重试！
    pause
    exit /b 1
)

:: 检查并安装依赖
echo 正在检查依赖...
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Flask...
    pip install flask
)

python -c "import tomli" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装tomli...
    pip install tomli
)

:: 启动应用
echo 正在启动应用...
python app.py

pause 