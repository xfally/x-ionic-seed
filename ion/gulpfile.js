var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var shell = require('gulp-shell');
var jshint = require('gulp-jshint');
var os = require('os');
var Server = require('karma').Server;

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
var platform = os.platform();

var paths = require('./www/js/xpath.js').path4Test;

//== utils ==//
var _extend = function(oa, ob) {
    // loop through ob
    for (var i in ob) {
        // check if the extended ob has that property
        if (ob.hasOwnProperty(i)) {
            // now check if oa's child is also object so we go through it recursively
            if (typeof oa[i] == "object" && oa.hasOwnProperty(i) && oa[i] != null) {
                oa[i] = _extend(oa[i], ob[i]);
            } else {
                oa[i] = ob[i];
            }
        }
    }
    return oa;
};

//== install js lib ==//
gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

//== convert sass/scss to css ==//
gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

//== jshint ==//
gulp.task('lint', function() {
    return gulp.src(paths.js.core.concat(paths.js.mod))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

//== karma unit testing ==//
var karmaConfig = {
    configFile: __dirname + '/karma.conf.js',
    basePath: './',
    files: paths.js.lib.concat(paths.js.core, paths.js.mod, paths.js.test),
    port: 9876
};

// Run test once and exit.
gulp.task('test', function(done) {
    if (platform === 'darwin') {
        new Server(_extend(karmaConfig, {
            browsers: ['Safari'],
            singleRun: true
        }), function() {
            done();
        }).start();
    } else {
        new Server(_extend(karmaConfig, {
            browsers: ['Chromium'],
            singleRun: true
        }), function() {
            done();
        }).start();
    }
});

// Watch (Detecting) for file changes and re-run Tests on each change during Development.
gulp.task('tdd', function(done) {
    if (platform === 'darwin') {
        new Server(_extend(karmaConfig, {
            browsers: ['Safari'],
            singleRun: false
        }), done).start();
    } else {
        new Server(_extend(karmaConfig, {
            browsers: ['Chromium'],
            singleRun: false
        }), done).start();
    }
});

//== generate jsdoc ==//
gulp.task('jsdoc', shell.task([
    'rm -Rf jsdoc', // Delete old jsdoc directory at first
    'node_modules/jsdoc/jsdoc.js ' +
    '-c node_modules/angular-jsdoc/common/conf.json ' + // config file
    '-t node_modules/angular-jsdoc/angular-template ' + // template file
    '-d jsdoc ' + // output directory
    '../README.md ' + // to include README.md as index contents
    '-r www/js www/mod' // source code directory
]));

//== watch file change ==//
gulp.task('watch', function() {
    gulp.watch('./scss/**/*.scss', ['sass']);
});

//== default task ==//
gulp.task('default', ['lint', 'test']);

