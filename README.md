drag/drop two files over <code>audio_and_image_to_video.cmd</code>,  
it will create a single image-slideshow video (<a href="https://trac.ffmpeg.org/wiki/Slideshow#Singleimage">https://trac.ffmpeg.org/wiki/Slideshow#Singleimage</a>).  

<hr/>

By default the audio will not be encoded,  
and the output will have the extension <code>mkv</code>,  
the video will be encoded with H.265 (<a href="https://trac.ffmpeg.org/wiki/Encode/H.265">https://trac.ffmpeg.org/wiki/Encode/H.265</a>).

<hr/>

Most of the settings are placed in the <code>resources/SETTINGS.json</code> file,  
the settings in the json files are not optional,  
they are part of the code that was put outside for an easier configuration.  

<hr/>
  
the <code>__OPTIONAL__</code> and <code>__INFO__</code> entries <strong>are not actually functional or used</strong>,  
they are there just help you understand, and provide information regarding what you can change  
(if you are are familiar with ffmpeg you can probably use other values as well).  

<hr/>

about <code>launcher</code>, <code>encoder</code>, <code>template</code>:  
in-order to prevent creating a child-process and avoid using batch files,  
I am using an external program (<code>exe.exe</code>) to launch <code>ffmpeg.exe</code>.  

<hr/>

<a href="https://github.com/eladkarako/audio_and_image_to_video/archive/master.zip">Download the entire thing, including the binaries - <strong>Read to use!</strong></a>  
<br/><a href="https://paypal.me/e1adkarak0/5"><em>buy me a coffee ☕︎</em></a>  
