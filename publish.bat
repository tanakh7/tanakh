@echo off
cd /d "%~dp0"
echo.
echo  Pushing changes to GitHub...
echo  ================================

git add .

:: Use timestamp as commit message
for /f "tokens=1-5 delims=/ " %%a in ('date /t') do set d=%%a-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set t=%%a:%%b
git commit -m "Update %d% %t%"

git push origin main

echo.
echo  Done! GitHub Pages will update in ~1 minute.
echo  Website: https://tanakh7.github.io/tanakh
echo.
pause
