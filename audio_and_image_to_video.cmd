@echo off
chcp 65001 2>nul >nul
set "EXIT_CODE=0"

pushd "%~dp0"
echo.----------------------------------------------------------[NODEJS] 1>&2
call "resources\node.exe" "resources\audio_and_image_to_video.js" %*
set "EXIT_CODE=%ErrorLevel%"
echo.----------------------------------------------------------[NODEJS] 1>&2

echo [INFO] Done. [EXIT_CODE: %EXIT_CODE%] 1>&2
pause
popd
exit /b %EXIT_CODE%






::--------------------------------------------------------------------------------------------
:: drag&drop two files (audio and image) over this batch file to generate a h.265 MKV video  |
::--------------------------------------------------------------------------------------------
:: assuming both files in the same folder.                  |
:: output file will be in the same folder too.              |
:: 'audiofilenamenoextension_imagefilenamenoextension.mkv'  |
::-----------------------------------------------------------
:: supports:                              |
::           - mp3,m4a,aac,oga,ogg,flac   |
::           - jpg,jpeg,png,gif           |
::-----------------------------------------
:: Elad Karako July 2020.  |
::--------------------------
