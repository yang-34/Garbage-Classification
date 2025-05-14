@echo off
title Garbage Classification Program

:: Check python
python --version
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    pause
    exit /b 1
)

:: Check and install dependencies
echo Checking dependencies...

python -c "import flask"
if %errorlevel% neq 0 (
    echo Installing Flask...
    pip install flask
    
    :: Re-check after installation
    python -c "import flask"
    if %errorlevel% neq 0 (
        echo Flask installation verification failed!
        pause
        exit /b 1
    ) else (
        echo Flask installed successfully.
    )
) else (
    echo Flask already installed.
)

python -c "import tomli"
if %errorlevel% neq 0 (
    echo Installing tomli...
    pip install tomli
    
    :: Re-check after installation
    python -c "import tomli"
    if %errorlevel% neq 0 (
        echo Tomli installation verification failed!
        pause
        exit /b 1
    ) else (
        echo Tomli installed successfully.
    )
) else (
    echo Tomli already installed.
)

:: Run application
echo Starting application...
echo Application will open in a browser window.
python app.py

echo.
echo Application closed!
echo If you saw any errors above, please take a screenshot.

pause 