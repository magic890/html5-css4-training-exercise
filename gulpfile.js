'use strict';

// TODO: conf strings / object for package.json, bower.json and this file related to PROJECT_NAME and versioning
// TODO: If you change the image, the old one still remain in the dist folder. Remove it.

// Used to generate main JS and CSS files.
const PROJECT_NAME = "html5css4ex";

const CONF = {
    SRC_DIR: 'src/',
    SRC: {
        INDEX: 'index.html',
        JS: {
            DIR: 'js/',
            FILE: [
                'app.js',
                '**/*.js',
                'controller/**/*.js',
                'factory/**/*.js',
                'directive/**/*.js',
                'model/**/*.js'
            ]
        },
        SASS: {
            DIR : 'sass/',
            FILE: "*.scss"
        },
        FONT: 'font/',
        IMG: 'img/',
        TEMPLATE: 'template/',
        FAVICON: '',
        REPLACE: {
            PLACEHOLDER_GIT_COMMIT: '[{[{PLACEHOLDER-GIT-COMMIT}]}]'
        }
    },
    DEST_DIR: 'dist/',
    DEST: {
        JS: {
            DIR: 'js/',
            FILE: PROJECT_NAME + '.js'
        },
        CSS: {
            DIR: 'css/',
            FILE: PROJECT_NAME + '.css'
        },
        LIB: 'lib/',
        FONT: 'font/',
        IMG: 'img/',
        TEMPLATE: 'template/',
        FAVICON: ''
    }
};


const gulp = require('gulp'),
    del = require('del'),
    watch = require('gulp-watch'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    cssnano = require('gulp-cssnano'),
    pngquant = require('imagemin-pngquant'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    git = require('git-rev-sync'),
    replace = require('gulp-replace'),
    browserSync = require('browser-sync').create(),
    yargs = require('yargs')
        .usage('Usage: $0 <command> [options]')
        .command('default | <empty>', 'Build "'+ CONF.DEST_DIR +'" folder')
        .command('dev', 'Build, watch & web server')
        .demand(0)

        .boolean('livereload')
        .default('livereload', true)
        .describe('livereload', 'Live reload in browsers')

        .boolean('notify')
        .default('notify', true)
        .describe('notify', 'Popup notification for live reload files in browsers')

        .boolean('xip')
        .default('xip', false)
        .describe('xip', 'Obtain an host address reachable from internet (require internet access)')

        .boolean('replaceGitStr')
        .default('replaceGitStr', false)
        .describe('replaceGitStr', 'Enable string replacement "'+ CONF.SRC.REPLACE.PLACEHOLDER_GIT_COMMIT +'" for git short hash')

        .example('$0 dev --xip', 'Build & start a web server accessible from internet')
        .help('h')
        .alias('h', 'help')
        .epilog('Goo.com Srl © Copyright 2016')

        .argv
    ;


gulp.task('clean', function() {
    return del([CONF.DEST_DIR]);
});

gulp.task('bower', function(cmd) {
    if (cmd !== undefined){
        return bower(CONF.DEST_DIR + CONF.DEST.LIB);
    }
    else {
        // TODO: Maybe this task can improved. It always runs 'install'. It could run also 'update'.
        return bower({
            directory: CONF.DEST_DIR + CONF.DEST.LIB,
            cmd: cmd
        });
    }
});

gulp.task('javascript', function() {
    var files = CONF.SRC.JS.FILE.map(function(f){
        return CONF.SRC_DIR + CONF.SRC.JS.DIR + f;
    });
    return gulp.src(files)
        .pipe(concat(CONF.DEST.JS.FILE))
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.JS.DIR))
        .pipe(browserSync.stream({
            match: '**/*.js'
        }))
        .pipe(uglify({mangle: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.JS.DIR))
        .pipe(browserSync.stream({
            match: '**/*.js'
        }));
});

gulp.task('styles', function() {
    return gulp.src(CONF.SRC_DIR + CONF.SRC.SASS.DIR + CONF.SRC.SASS.FILE)
        .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9'],
                cascade: true
            }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.CSS.DIR))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.CSS.DIR))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }));
});

gulp.task('styles-ruby', function() {
    return sass(CONF.SRC_DIR + CONF.SRC.SASS.DIR, {
            sourcemap: true,
            style: 'expanded'
        })
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(concat(CONF.DEST.CSS.FILE))
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.CSS.DIR))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.CSS.DIR));
        // Need adjustments for BrowserSync
});

gulp.task('images', function() {
    return gulp.src(CONF.SRC_DIR + CONF.SRC.IMG + '**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.IMG));
});

gulp.task('favicon', function() {
    return gulp.src([CONF.SRC_DIR + CONF.SRC.FAVICON + '*.ico', CONF.SRC_DIR + CONF.SRC.FAVICON + '*.png', CONF.SRC_DIR + CONF.SRC.FAVICON + 'manifest.json'])
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.FAVICON));
});

gulp.task('index', ['favicon'], function() {
    return gulp.src(CONF.SRC_DIR + CONF.SRC.INDEX)
        // .pipe(
        //     gulpif(
        //         yargs.replaceGitStr,
        //         replace(CONF.SRC.REPLACE.PLACEHOLDER_GIT_COMMIT, git.short())
        //     )
        // )
        .pipe(gulp.dest(CONF.DEST_DIR))
        .pipe(browserSync.stream());
});

gulp.task('templates', ['index'], function() {
    return gulp.src(CONF.SRC_DIR + CONF.SRC.TEMPLATE + '**')
        // .pipe(
        //     gulpif(
        //         yargs.replaceGitStr,
        //         replace(CONF.SRC.REPLACE.PLACEHOLDER_GIT_COMMIT, git.short())
        //     )
        // )
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.TEMPLATE))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
    return gulp.src(CONF.SRC_DIR + CONF.SRC.FONT + '**')
        .pipe(gulp.dest(CONF.DEST_DIR + CONF.DEST.FONT));
});

gulp.task('watch', function() {
    watch(CONF.SRC_DIR + CONF.SRC.SASS.DIR + '**/*.scss', function(){
        gulp.start('styles');
    });
    watch(CONF.SRC_DIR + CONF.SRC.JS.DIR + '**/*.js', function(){
        gulp.start('javascript');
    });
    watch(CONF.SRC_DIR + CONF.SRC.IMG + '**/*', function(){
        gulp.start('images');
    });
    watch([CONF.SRC_DIR + CONF.SRC.TEMPLATE + '**/*', CONF.SRC_DIR + CONF.SRC.INDEX], function(){
        gulp.start('templates');
    });
    watch(CONF.SRC_DIR + CONF.SRC.FONT + '**/*', function(){
        gulp.start('fonts');
    });
    watch('bower.json', function(){
        gulp.start('bower');
    });
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: CONF.DEST_DIR
        },
        xip: yargs.xip,
        notify: yargs.notify,
        codeSync: yargs.livereload
    });
});


gulp.task('default', ['bower', 'styles', 'javascript', 'images', 'templates', 'fonts']);

gulp.task('dev', ['watch', 'browser-sync', 'default']);
