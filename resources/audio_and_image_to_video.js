"use strict";
const   FS                      = require("fs")
       ,PATH                    = require("path")
       ,normalize_path          = function(s){ //to unix-style, fully qualified path, no slash at the end.
                                    if("string" !== typeof s)  return "";
                                    if("" === s)               return "";
                                    s = s.replace(/[\\\/]+/g, "/").replace(/\/+$/g, "");
                                    s = PATH.resolve(s).replace(/[\\\/]+/g, "/").replace(/\/+$/g, "");
                                    return s;
                                  }
       ,PATH_NORMALIZE_PARSE    = function(s){                      //adding a fully-qualified entry.
                                    const result = PATH.parse( normalize_path(s) );
                                    result.full  = normalize_path(result.dir + "/" + result.base);
                                    return result;
                                  }
       ,program                 = (function(){ //parsing existing, safe, information. parsing arguments isn't safe yet.
                                    const program = {};
                                    program.files = {};
                                    program.files.node        = PATH_NORMALIZE_PARSE(process.exePath || process.argv[0] || process.argv0 || (/^win/i.test(process.os || process.platform) ? "node.exe" : "node"));
                                    program.files.main_module = PATH_NORMALIZE_PARSE(process.mainModule.filename);
                                    program.SETTINGS          = JSON.parse(  FS.readFileSync(normalize_path(program.files.main_module.dir + "/SETTINGS.json"), {encoding:"utf8"})  );

                                    program.files.encoder     = PATH_NORMALIZE_PARSE(program.files.main_module.dir + "/" + program.SETTINGS.command.encoder  );
                                    program.files.launcher    = PATH_NORMALIZE_PARSE(program.files.main_module.dir + "/" + program.SETTINGS.command.launcher );
                                    program.files.input_image = undefined; //will be set later
                                    program.files.input_audio = undefined; //will be set later
                                    program.files.output      = undefined; //will be set later
                                    program.commandline       = undefined; //will be set later
                                    return program;
                                  }())
       ,ARGS                    = (function(){
                                    const  REGEX_NODE         = new RegExp(program.files.node.base        + "$", "i")
                                          ,REGEX_MAIN_MODULE  = new RegExp(program.files.main_module.base + "$", "i")
                                          ;
                                    return process.argv
                                                  .filter(function(arg){
                                                     return (false === REGEX_NODE.test(arg)
                                                          && false === REGEX_MAIN_MODULE.test(arg));
                                                  })
                                                  .map(function(arg){return PATH_NORMALIZE_PARSE(arg);})
                                                  ;
                                  }())
       ,REGEX_SUPPORTED_IMAGE   = new RegExp("\\.(" + program.SETTINGS.supported.image + ")$", "i")
       ,REGEX_SUPPORTED_AUDIO   = new RegExp("\\.(" + program.SETTINGS.supported.audio + ")$", "i")
       ,ascii_clean             = function(s){return s.trim().replace(/[^a-z0-9\-\_]+/gim, "_").replace(/_+/g, "_");}
       ,get_s_current_date      = function(){var d=new Date(); return String(d.getFullYear()) + ("00" + String(d.getMonth()+1)).substr(-2) +  ("00" + String(d.getDate())).substr(-2); }
       ,get_s_current_time      = function(){var d=new Date(); return ("00" + String(d.getHours())).substr(-2) + ("00" + String(d.getMinutes())).substr(-2) +  ("00" + String(d.getSeconds())).substr(-2); }
       ,get_s_random            = function(){return require("crypto").randomFillSync(Buffer.alloc(10)).toString('hex');}
       ,execFileSync            = require("child_process").execFileSync
       ;


if(ARGS.length < 2){
  console.error("[ERROR] please provide two arguments.");
  process.exitCode=111;
  process.exit();
}


if(true === REGEX_SUPPORTED_IMAGE.test(ARGS[0].base)  &&  true === REGEX_SUPPORTED_AUDIO.test(ARGS[1].base)){
  program.files.input_image = ARGS[0];
  program.files.input_audio = ARGS[1];
}else if(true === REGEX_SUPPORTED_IMAGE.test(ARGS[1].base)  &&  true === REGEX_SUPPORTED_AUDIO.test(ARGS[0].base)){
  program.files.input_image = ARGS[1];
  program.files.input_audio = ARGS[0];
}else{
  console.error("[ERROR] arguments are not image and audio files.", ARGS);
  process.exitCode=222;
  process.exit();
}


//files exists?
if(false === FS.existsSync(program.files.input_image.full)){
  console.error("[ERROR] image file does not exist.", program.files.input_image);
  process.exitCode=333;
  process.exit();
}
if(false === FS.existsSync(program.files.input_audio.full)){
  console.error("[ERROR] audio file does not exist.", program.files.input_audio);
  process.exitCode=444;
  process.exit();
}



program.files.output = (function(){
                         var name = program.files.input_audio.name + "_" + program.files.input_image.name;
                         name = (true === program.SETTINGS.output.name.ascii_clean)   ? ascii_clean(name)                   : name;
                         name = (true === program.SETTINGS.output.name.append_date)   ? (name + "_" + get_s_current_date()) : name;
                         name = (true === program.SETTINGS.output.name.append_time)   ? (name + "_" + get_s_current_time()) : name;
                         name = (true === program.SETTINGS.output.name.append_random) ? (name + "_" + get_s_random())       : name;
                         
                         return PATH_NORMALIZE_PARSE(program.files.input_audio.dir + "/" + name + "." + program.SETTINGS.output.extension.to_use);
                       }());
                       
program.commandline = program.SETTINGS.command.template.replace(/##INPUT_IMAGE##/          , program.files.input_image.full         )
                                                       .replace(/##INPUT_AUDIO##/          , program.files.input_audio.full         )
                                                       .replace(/##OUTPUT_VIDEO##/         , program.files.output.full              )
                                                       .replace(/##ENCODER_VIDEO##/        , program.SETTINGS.encoding.video.to_use )
                                                       .replace(/\-c\:a ##ENCODER_AUDIO##/ , ("" === program.SETTINGS.encoding.audio.to_use) ? "" : ("-c:a " + program.SETTINGS.encoding.audio.to_use)  )   //optionally remove '-c:a ##ENCODER_AUDIO##' from the string.
                                                       ;

process.chdir(program.files.output.dir);  //working folder (current nodejs process)

console.log("=======================================================");
console.log("[INFO] image file:   ", program.files.input_image.full  );
console.log("[INFO] audio file:   ", program.files.input_audio.full  );
console.log("[INFO] output file:  ", program.files.output.full       );
console.log("");
console.log("[INFO] encoder:      ", program.files.encoder.full      );
console.log("[INFO] command-line: ", program.commandline             );
console.log("[INFO] working dir:  ", process.cwd()                   );
console.log("=======================================================");


execFileSync(program.files.launcher.full
,[program.files.encoder.full
 ,program.commandline
 ]
,{"cwd":program.files.output.dir, "windowsHide":false, "shell":false, "detached":true, "stdio":"ignore", "timeout":undefined}  //explicitly set working folder (launcher), disable data-pipes, avoid waiting, no timeout.
);
