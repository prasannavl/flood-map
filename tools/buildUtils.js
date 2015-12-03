var config = require("../config.js"),
    watch = require("gulp-watch"),
    process = require("process");

var utils = new function () {

    this.errorHandler = function (err) {
        console.error(err); 
        // Ext scoped
        this.emit("end");
    };

    this.createWatcher = function (path, watcherName) {
        var name = watcherName === undefined ? "" : watcherName + ":: ";
        var watchOpts = {
            events: ["add", "change", "unlink", "addDir", "unlinkDir"]
        }
        var log = function (event, path) {
            console.log(name + new Date().toLocaleString() + " : " + event + " => " + path);
        };
        var handleEvent = function (event, path, details) {
            log(event, path);
        };
        return watch(path, watchOpts)
            .on("raw", handleEvent)
    };

    this.initConfig = function () {
        if (config.isProduction) { process.env["NODE_ENV"] = "production"; }
        console.log("Build type: " + (config.isProduction ? "Production" : "Development"));
    };

    this.extendGulp = function (gulp) {
        gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
        gulp.Gulp.prototype._runTask = function (task) {
            // Ext scoped            
            this.taskName = task.name;
            this.__runTask(task);
        }
    };
}

module.exports = utils;