You drag&amp;drop two file over the <code>audio_and_image_to_video.cmd</code> batch-file,  
it will identify which one is the image and which one is the audio.  
an encoding process will start to encode the video.  

Audio streams will be copied as is without encoding (saves time).  
Output format is "the new MP4", <a href="https://trac.ffmpeg.org/wiki/Encode/H.265">H.265</a> with-in a <a href="https://en.wikipedia.org/wiki/Matroska">MKV-container</a> (which YouTube supports). 

The process is done without working with the Windows CMD since it is very buggy when transferring a lot of information,  
instead the logic was moved from <code>audio_and_image_to_video.cmd</code> to <code>resources/audio_and_image_to_video.js</code>.  

NodeJS is very buggy and slow when piping all the console-output of FFMPEG.  
FFMPEG also allows pressing <kbd>q</kbd> to quit encoding, this closes all the stdin pipes in a way that causes NodeJS to get-stuck.  

So, instead,  
NodeJS will actually run the ffmpeg command itself.  

NodeJS pass the arguments to 'exe' - a .Net v2 (minimum support require, runs on all OS and architectures) program,  
that passes the program and arguments to ShellExecuteW, so it too does not create a subprocess.  

ShellExecuteW is a native Windows method. It launches FFMPEG directly with all the arguments.  
once it is done the console will close.  

<hr/>

The NodeJS program will write information (such as file locations) to the console,  
and the CMD will provide pause at the end.  

You won't be able to see any errors from the actuall FFMPEG process since it does not run through CMD, but by itself, and once it stops it quits.  

<hr/>

You can try an image and audio from the <code>media_examples/</code> folder.  
the size of the video is by the image-size (at 25FPS).  

<hr/>

The output file will contain the audio file name and the image file name,  
inside the audio-file folder, with the extension <code>.mkv</code>.  

<hr/>

<a href="https://github.com/eladkarako/audio_and_image_to_video/archive/master.zip">Download the entire thing, including the binaries - <strong>Read to use!</strong></a>  
<br/><a href="https://paypal.me/e1adkarak0/5"><em>buy me a coffee ☕︎</em></a>  

