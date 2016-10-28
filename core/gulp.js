import gulp from 'gulp'
import pump from 'pump'
import stylus from 'gulp-stylus'
import rename from 'gulp-rename'
import autoprefixer from 'autoprefixer-stylus'
import cleanCSS from 'gulp-clean-css'
import uglify from 'gulp-uglify'

let env = process.env.NODE_ENV

// CSS

gulp.task('build-css', () => {
  pump([
    gulp.src('src/styl/*.styl'),
    stylus({ use: [autoprefixer('iOS >= 7', 'last 1 Chrome version')]}),
    cleanCSS(),
    rename({ suffix: '.min' }),
    gulp.dest('data/build/css/')
  ])
})

// SCRIPT JS

gulp.task('build-corejs', () => {
  pump([
    gulp.src('core/script/*.js'),
    uglify(),
    rename({ suffix: '.min' }),
    gulp.dest('data/build/js/')
  ])
})

gulp.task('build-js', () => {
  pump([
    gulp.src('src/script/*.js'),
    uglify(),
    rename({ suffix: '.min' }),
    gulp.dest('data/build/js/')
  ])
})

// Build & Watch

gulp.task('build', ['build-corejs', 'build-js', 'build-css'])

gulp.task('watch', () => {
  gulp.watch('core/script/*.js', ['build-corejs'])
  gulp.watch('src/script/*.js', ['build-js'])
  gulp.watch('src/styl/*.styl', ['build-css'])
})

gulp.start('build')
if (env === 'development') 
  gulp.start('watch')

module.exports = gulp
