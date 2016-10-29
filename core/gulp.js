import gulp from 'gulp'
import pump from 'pump'
import stylus from 'gulp-stylus'
import rename from 'gulp-rename'
import buffer from 'vinyl-buffer'
import autoprefixer from 'autoprefixer-stylus'
import cleanCSS from 'gulp-clean-css'
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'
import common from './common'
import File from './file'
import { CorePath, DataPath } from './path'

let env = process.env.NODE_ENV

let gulpAddPath = './site/gulp.js'
if (File.exists(__dirname+'/'+gulpAddPath))
  require(gulpAddPath)

// CSS

gulp.task('build-css', () => {
  pump([
    gulp.src(CorePath+'/site/styl/*.styl'),
    buffer(),
    stylus({ use: [autoprefixer('iOS >= 7', 'last 1 Chrome version')]}),
    cleanCSS(),
    rename({ suffix: '.min' }),
    gulp.dest(DataPath+'/build/css/')
  ])
})

// SCRIPT JS

gulp.task('build-corejs', () => {
  pump([
    gulp.src('core/script/*.js'),
    buffer(),
    uglify().on('error', common.error),
    rename({ suffix: '.min' }),
    gulp.dest(DataPath+'/build/js/')
  ])
})

gulp.task('build-js', () => {
  pump([
    gulp.src(CorePath+'/site/script/*.js'),
    buffer(),
    uglify().on('error', common.error),
    rename({ suffix: '.min' }),
    gulp.dest(DataPath+'/build/js/')
  ])
})

// Build & Watch

gulp.task('build', ['build-corejs', 'build-js', 'build-css'])

gulp.task('watch', () => {
  gulp.watch(CorePath+'/script/*.js', ['build-corejs'])
  gulp.watch(CorePath+'/site/script/*.js', ['build-js'])
  gulp.watch(CorePath+'/site/styl/*.styl', ['build-css'])
})

gulp.start('build')
if (env === 'development') 
  gulp.start('watch')

module.exports = gulp
