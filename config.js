var argv = require("yargs").argv;
var path = require("path");

var isProduction = ((argv.production === undefined) ? false : true) || false;

var srcDir = "./src",
    staticDir = srcDir + "/static",
    buildDir = "./build";

var srcPaths = {
    dir: srcDir,
    staticDir: staticDir,
    jsDir: srcDir + "/js",
    tsDir: srcDir + "/ts",
    lessDir: srcDir + "/less",
    cssDir: srcDir + "/css",
    imagesDir: staticDir + "/images",
    svgsDir: staticDir + "/vectors",
};

var targets = {
    ts: [{ srcPath: srcPaths.tsDir + "/app.ts", destName: "app.js" }],
    less: [srcPaths.lessDir + "/app.less"]
};

var srcGlobs = {
    statics: srcPaths.staticDir + "/**/*",
    css: srcPaths.cssDir + "/**/*",
    less: srcPaths.lessDir + "/**/*",
    html: srcPaths.dir + "/**/*.html",
    js: srcPaths.jsDir + "/**/*",
    ts: srcPaths.tsDir + "/**/*",
    images: [srcPaths.dir + "/images/**/*", srcPaths.dir + "/img/**/*"],
    svgs: staticDir + "/vectors/**/*",
};

var buildPaths = {
    dir: buildDir,
    jsDir: buildDir + "/js",
    cssDir: buildDir + "/css",
};

var htmlOpts = {
    conditionals: true,
    spare: true
};

var lessOpts = {
    paths: [srcGlobs.less]
}

var connectOpts = {
    root: buildPaths.dir,
    livereload: false,
    port: 8000
};

var pleeeaseOpts = {
    less: false,
    minifier: isProduction,
};

var browserifyOpts = {
    cache: {},
    packageCache: {},
    debug: !isProduction,
    fullPaths: false
};

var changeSet = {
    less: [srcGlobs.css, srcGlobs.less],
    statics: [srcGlobs.statics, path.join(srcPaths.dir, "apple-touch-icon.png"), path.join(srcPaths.dir, "data") + "/**",
        "!" + srcGlobs.images,
        "!" + srcGlobs.svgs]
};

var config = {
    isProduction: isProduction,
    srcPaths: srcPaths,
    srcGlobs: srcGlobs,
    targets: targets,
    buildPaths: buildPaths,
    htmlOpts: htmlOpts,
    lessOpts: lessOpts,
    connectOpts: connectOpts,
    pleeeaseOpts: pleeeaseOpts,
    browserifyOpts: browserifyOpts,
    changeSet: changeSet
};

module.exports = config;
