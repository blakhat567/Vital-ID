@echo off
cd /d "%~dp0projectroot"
echo Starting Vital ID development server...
echo Tip: First load takes longer (TypeScript compilation)
echo Subsequent loads will be faster!
npm run dev
pause
