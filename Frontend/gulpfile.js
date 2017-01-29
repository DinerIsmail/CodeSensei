var gulp = require('gulp');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');
var shell = require('shelljs');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var path = require("path");
var url = require("url");
var sloc = require('gulp-sloc');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

var index = process.argv.indexOf("--build");
var BUILD_ID;
if( (index < 0) || (index+1 > process.argv.length) ){
  BUILD_ID = "DEVELOPMENT";
}else{
  BUILD_ID = process.argv[index+1];
}

var config = {
  entryFile: './src/app.js',
  outputDir: './dist/',
  outputFile: 'app.js',
  staticDir: './static/',
  staticFiles: './static/**/*',
  defaultFile: "index.html",
  indexFile: "index.html",
  port:3000
};

var defaultFileMiddleware = function(req, res, next) {
  var folder = path.resolve(__dirname, config.outputDir);

  var fileName = url.parse(req.url);
  fileName = fileName.href.split(fileName.search).join("");
  var fileExists = fs.existsSync(folder + fileName);
  if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
      var ext = fileName.split(".")[1]
      if(ext == "js"){
        // res.set('Content-Type', 'application/javascript');
      }else if(ext == "css"){
        // res.set('Content-Type', 'text/css');
      }
      req.url = "/" + config.defaultFile;
  }
  return next();
};



// clean the output directory
gulp.task('clean', function(cb){
    del.sync([
      config.outputDir+"**"
    ]);
    cb();
});

var bundler;
function getBundler() {
  if (!bundler) {
    bundler = watchify(browserify(config.entryFile, _.extend({ debug: true }, watchify.args)));
  }
  return bundler;
};

/*
 * Note here that we need the distinction between the two bundles because the
 * watchify build (persistent) will not complete, so is unsuitable for building
 * and deploying a release.
 */
function bundle() {
  return getBundler()
    .transform(babelify)
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source(config.outputFile))
    .pipe(gulp.dest(config.outputDir))
    .pipe(reload({ stream: true }));
}

function tbundle() {
  return browserify(config.entryFile, {debug: true})
    .transform(babelify)
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source(config.outputFile))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(config.outputDir))
}


/*
 * We use two build here so that one can be used in the build and deploy tasks
 * and the watchify build in the watch task.
 */
gulp.task('build-persistent', function() {
  return bundle();
});

gulp.task('build-transient', function() {
  return tbundle();
});

gulp.task('static', [], function() {
  return gulp.src(config.staticFiles).pipe(gulp.dest(config.outputDir));
});

gulp.task('build', ['clean', 'static', 'build-transient', 'makemeta'], function(cb) {
  cb();
});

gulp.task("sloc", function(){
  gulp.src([
    "src/**/*.*",
    "utils/**/*.*",
    "test/**/*.*",
    "static/*.*"
  ]).pipe(sloc());
});

gulp.task('serve', [], function(){
  var express = require('express');
  var app = express();
  app.use(defaultFileMiddleware);
  app.use(express.static(config.outputDir));
  app.listen(config.port, function () {
    console.log('Serving application on port '+config.port+'.');
  });
});

gulp.task('watch', ['clean', 'static', 'makemeta', 'build-persistent'], function() {
  browserSync({
    server: {
      port:config.port,
      baseDir: config.outputDir,
      index: config.indexFile,
      middleware: defaultFileMiddleware
    }
  });
  getBundler().on('update', function() {
    gulp.start('build-persistent');
  });
  gulp.watch(config.staticFiles, ['static']);
});

gulp.task('makemeta', [], function(done){
  shell.exec('mkdir -p '+config.outputDir);
  var USER = shell.exec("git show --format='%aN <%aE>' --quiet HEAD", {silent:true}).stdout
  var SHA = shell.exec("git rev-parse HEAD", {silent:true}).stdout;
  var DATE = shell.exec("date", {silent:true}).stdout;
  var UNAME = shell.exec("uname -a", {silent:true}).stdout;
  var ENV = process.env.ENVIRONMENT?process.env.ENVIRONMENT:"dev";

  var meta = {
    name: "Decacoder platform",
    build: BUILD_ID,
    author: USER.trim(),
    sha: SHA.trim(),
    build_date: DATE.trim(),
    uname: UNAME.trim(),
    env: ENV
  };

  var json = JSON.stringify(meta, null, 4);

  fs.writeFile(
    config.outputDir+"meta.json",
    json,
    function(err) {
        if(err) {
            console.log(err);
            process.exit(1);
        }
        done()
    }
  );

});
