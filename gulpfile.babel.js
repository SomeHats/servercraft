import del from 'del'
import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();

const app = {
  client: 'client/',
  server: 'server/'
};

const dist = {
  server: 'dist/',
  client: 'dist/public/'
};

gulp.task('server-scripts', () => {
  return gulp.src(app.server + '**/*.js')
    .pipe($.changed(dist.server))
    .pipe($.babel())
    .pipe(gulp.dest(dist.server));
});

gulp.task('clean', (cb) => {
  return del([dist.client, dist.server], cb);
});

gulp.task('watch', () => {
  gulp.watch(app.server + '**/*.js', ['server-scripts']);
});

gulp.task('serve', () => {
  $.nodemon({
    watch: [dist.server],
    ignore: [dist.client],
    script: 'index.js'
  });
});

gulp.task('build', (cb) =>
  runSequence('clean', 'server-scripts', cb));

gulp.task('default', (cb) => runSequence('build', ['serve', 'watch'], cb));
