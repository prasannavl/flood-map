var config = require("./config.js"),
    utils = require("./tools/buildUtils.js"),
    gulp = require("gulp"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    uglify = require("gulp-uglify"),
    minifyHTML = require("gulp-minify-html"),
    pleeease = require("gulp-pleeease"),
    sourcemaps = require("gulp-sourcemaps"),
    del = require('del'),
    imagemin = require("gulp-imagemin"),
    svgmin = require("gulp-svgmin"),
    runSequence = require("run-sequence"),
    pipeif = require("gulp-if-else"),
    watch = require("gulp-watch"),
    notify = require("gulp-notify"),
    plumber = require("gulp-plumber"),
    connect = require("gulp-connect"),
    less = require("gulp-less"),
    open = require("open"),
    gutil = require("gulp-util"),
    es = require("event-stream"),
    shell = require("gulp-shell");

var baseOpts = {
        base: config.srcPaths.dir
    },
    isProduction = true,
    isWatching = false;

utils.initConfig();
utils.extendGulp(gulp);

gulp.task("dev", ["watch", "serve"]);

gulp.task("build", function(cb) {
    runSequence("clean", ["html", "css", "js", "statics", "images", "svgs", "meta"], cb);
});

gulp.task("meta", function() {
    return gulp.src("./meta/**")
        .pipe(gulp.dest(config.buildPaths.dir));
});

gulp.task("serve", function() {
    var opts = config.connectOpts;
    connect.server(opts);
    gutil.log(gutil.colors.blue("Note: There is a possibility that the server loads before the build is fully complete on clean builds. If so, please reload after a few seconds."));
    open("http://localhost:" + opts.port);
});

gulp.task("clean", function() {
    return del(config.buildPaths.dir + "/**/*");
});

gulp.task("html", function() {
    return gulp.src(config.srcGlobs.html, baseOpts)
        .pipe(pipeif(isWatching, () => utils.createWatcher(config.srcGlobs.html, this.taskName)))
        .pipe(pipeif(isWatching, plumber))
        .pipe(pipeif(isProduction, () => minifyHTML(config.htmlOpts)))
        .pipe(pipeif(isWatching, plumber.stop))
        .pipe(gulp.dest(config.buildPaths.dir))
        .pipe(pipeif(isWatching, () => connect.reload()));
});

gulp.task("images", function() {
    return gulp.src(config.srcGlobs.images, baseOpts)
        .pipe(pipeif(isWatching, () => utils.createWatcher(config.srcGlobs.images, this.taskName)))
        .pipe(pipeif(isWatching, plumber))
        .pipe(imagemin())
        .pipe(pipeif(isWatching, plumber.stop))
        .pipe(gulp.dest(config.buildPaths.dir))
        .pipe(pipeif(isWatching, () => connect.reload()));
});

gulp.task("svgs", function() {
    return gulp.src(config.srcGlobs.svgs, baseOpts)
        .pipe(pipeif(isWatching, () => utils.createWatcher(config.srcGlobs.svgs, this.taskName)))
        .pipe(pipeif(isWatching, plumber))
        .pipe(pipeif(isProduction, svgmin))
        .pipe(pipeif(isWatching, plumber.stop))
        .pipe(gulp.dest(config.buildPaths.dir))
        .pipe(pipeif(isWatching, () => connect.reload()));
});

gulp.task("statics", function() {
    return gulp.src(config.changeSet.statics, baseOpts)
        .pipe(pipeif(isWatching, () => utils.createWatcher(config.changeSet.statics, this.taskName)))
        .pipe(gulp.dest(config.buildPaths.dir));
});

gulp.task("css", function() {
    return gulp.src(config.srcGlobs.css, {
            base: config.srcPaths.cssDir
        })
        .pipe(pipeif(isWatching, plumber))
        .pipe(pipeif(!isProduction, () => sourcemaps.init({
            loadMaps: true
        })))
        .pipe(pleeease(config.pleeeaseOpts))
        .pipe(pipeif(!isProduction, () => sourcemaps.write()))
        .pipe(pipeif(isWatching, plumber.stop))
        .pipe(gulp.dest(config.buildPaths.cssDir))
        .pipe(pipeif(isWatching, () => connect.reload()));
});

gulp.task("less", function() {
    return gulp.src(config.srcGlobs.less, {
            base: config.srcPaths.lessDir
        })
        .pipe(pipeif(isWatching, plumber))
        .pipe(pipeif(!isProduction, () => sourcemaps.init({
            loadMaps: true
        })))
        .pipe(less(config.lessOpts))
        .pipe(pleeease(config.pleeeaseOpts))
        .pipe(pipeif(!isProduction, () => sourcemaps.write()))
        .pipe(pipeif(isWatching, plumber.stop))
        .pipe(gulp.dest(config.buildPaths.cssDir))
        .pipe(pipeif(isWatching, () => connect.reload()));
});

gulp.task("js", function() {

    var tasks = config.targets.ts.map(entry => {
        return gulp.src(config.srcGlobs.js, {
                base: config.srcPaths.jsDir
            })
            .pipe(pipeif(!isProduction, () => sourcemaps.init({
                loadMaps: true
            })))
            .pipe(pipeif(isProduction, uglify))
            .pipe(pipeif(!isProduction, () => sourcemaps.write()))
            .pipe(gulp.dest(config.buildPaths.jsDir));
    });
    return es.merge.apply(null, tasks);
});

//NOTE: Only 'origin' as remote name works.
gulp.task("manual-deploy", shell.task([
    "git subtree split --prefix build -b gh-pages",
    "git push -f origin gh-pages:gh-pages",
    "git branch -D gh-pages" ]));

gulp.task("browser-sync", function() {
    var browserSync = require("browser-sync").create();
    browserSync.init({
        server: {
            baseDir: config.buildPaths.dir
        }
    });
});
