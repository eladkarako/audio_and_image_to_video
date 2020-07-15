"use strict";
const   PATH             = require("path")
       ,normalize_path   = function(s){ //to unix-style, fully qualified path, no slash at the end.
                             if("string" !== typeof s)  return "";
                             if("" === s)               return "";
                             s = s.replace(/[\\\/]+/g, "/").replace(/\/+$/g, "");
                             s = PATH.resolve(s).replace(/[\\\/]+/g, "/").replace(/\/+$/g, "");
                             return s;
                           }
       ,own_program      = {"node"        : PATH.parse(normalize_path(process.exePath || process.argv[0] || process.argv0 || (/^win/i.test(process.os || process.platform) ? "node.exe" : "node")))
                           ,"main"        : PATH.parse(normalize_path(process.mainModule.filename))
                           ,"ffmpeg"      : undefined  //will be set later.
                           ,"exe"         : undefined  //will be set later.
                           ,"image_file"  : undefined  //will be set later.
                           ,"audio_file"  : undefined  //will be set later.
                           ,"output_file" : undefined  //will be set later.
                           }
       ,true_args        = function(args){    //exclude index.js and node.exe from argv (generic matching)
                             const REGEX_NODE = new RegExp(own_program.node.base + "$", "i")
                                  ,REGEX_MAIN = new RegExp(own_program.main.base + "$", "i")
                                  ;
                             args = args.filter(function(item){return (false === REGEX_NODE.test(item));});
                             args = args.filter(function(item){return (false === REGEX_MAIN.test(item));});
                             return args;
                           }
       ,ARGS             = true_args(process.argv).map(function(arg){return normalize_path(arg);})
       ,REGEX_EXT_IMAGE  = /\.(JPG|JPEG|PNG|GIF|BMP)$/i
       ,REGEX_EXT_AUDIO  = /\.(MP3|M4A|AAC|FLAC|OGG|OGA|WAV)$/i
       ,execFileSync     = require("child_process").execFileSync
       ;


own_program.ffmpeg = PATH.parse(normalize_path(own_program.main.dir + "/ffmpeg.exe"));
own_program.exe    = PATH.parse(normalize_path(own_program.main.dir + "/exe.exe"));


if(ARGS.length < 2){
  console.error("[ERROR] please provide two arguments.");
  process.exitCode=111;
  process.exit();
}


if(true === REGEX_EXT_IMAGE.test(ARGS[0])  &&  true === REGEX_EXT_AUDIO.test(ARGS[1])){
  own_program.image_file = ARGS[0];
  own_program.audio_file = ARGS[1];
}else if(true === REGEX_EXT_IMAGE.test(ARGS[1])  &&  true === REGEX_EXT_AUDIO.test(ARGS[0])){
  own_program.image_file = ARGS[1];
  own_program.audio_file = ARGS[0]
}else{
  console.error("[ERROR] please provide one audio-file and one image-file.");
  process.exitCode=222;
  process.exit();
}


own_program.image_file = PATH.parse(normalize_path(own_program.image_file));
own_program.audio_file = PATH.parse(normalize_path(own_program.audio_file));



console.log("-------------------------------------------------------");
console.log("[INFO] image file:  ", own_program.image_file);
console.log("[INFO] audio file:  ", own_program.audio_file);


own_program.output_file = own_program.audio_file.dir + "/" + own_program.audio_file.name + "_" + own_program.image_file.name + ".mkv";
own_program.output_file = PATH.parse(normalize_path(own_program.output_file));
console.log("[INFO] output file: ", own_program.output_file);
console.log("-------------------------------------------------------");


Object.keys(own_program).forEach(function(item){  //add a 'full' entry (fully qualified path to file).
  own_program[item].full = normalize_path(own_program[item].dir + "/" + own_program[item].base);
});


process.chdir(own_program.output_file.dir);


execFileSync(own_program.exe.full
,[own_program.ffmpeg.full ,"-y -hide_banner -err_detect ignore_err -stats -threads 16 -loglevel info -strict experimental -flags -output_corrupt -fflags +autobsf+discardcorrupt -flags2 +ignorecrop -loop 1 -i \"" + own_program.image_file.full + "\" -i \"" + own_program.audio_file.full + "\" -c:v libx265 -preset ultrafast -crf 30 -b:v 0 -c:a copy -shortest -vf fifo,format=pix_fmts=yuv420p,fps=fps=25 \"" + own_program.output_file.full + "\""]
,{"cwd":own_program.output_file.dir, "windowsHide":false, "shell":false, "detached": true, stdio:"ignore", "timeout":undefined}
);
