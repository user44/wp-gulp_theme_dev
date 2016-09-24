var gulp 					= require('gulp'),
		sass 					= require('gulp-sass'),
		browserSync 	= require('browser-sync'),
		autoPrefixer	= require('gulp-autoprefixer'),
		concat				= require('gulp-concat'),
		uglify				=	require('gulp-uglifyjs'),
		imagemin			= require('gulp-imagemin'),
		pngquant     	= require('imagemin-pngquant'),
		del          	= require('del'),
		cache        	= require('gulp-cache'),
		cssnano				= require('gulp-cssnano'),
		spritesmith		=	require('gulp.spritesmith'),
		iconfont			= require('gulp-iconfont'), // используется вместе с gulp-iconfont-css
		iconfontCss 	= require('gulp-iconfont-css');

// BrowserSync
gulp.task('browser-sync', function() {
		browserSync.init({
			proxy: {
				target: "http://aqua-wp.loc",
			},
			// server: {
			// 	baseDir: "./app"
			// },
			notify: false,
			open: false
	});
});

// Компиляция стилей
gulp.task('styles', function() {
	return gulp.src('sass/*.sass')
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) //nested compact expanded compressed
	.pipe(autoPrefixer({browsers: ['last 60 versions'], cascade: false}))
	.pipe(gulp.dest('../css'))
	.pipe(browserSync.stream());
})

//Отслеживание
gulp.task('watch', function() {
	gulp.watch('sass/*.sass', ['styles']);
	gulp.watch('../js/*.js').on("change", browserSync.reload);
	gulp.watch('../*.php').on("change", browserSync.reload);
	gulp.watch('../img/sprite/**/*', ['sprite']);
});

//Default task
gulp.task('default', ['browser-sync', 'watch']);

//Сжатие картинок
gulp.task('img', function() {
	return gulp.src('../img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('../img')); // выгружаем назад
});

//сборка спрайтов
gulp.task('sprite-nonmin', function() {
	var spriteData = gulp.src(['../img/sprite/*.+(png|jpg)', '!../img/sprite/sprite.png']).pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: 'sprite.css',
			// algorithm: 'top-down',
			padding: 10, // padding мужду картинками в исходном sprite.png
			imgPath: '../img/sprite/sprite.png' // путь к спрайту
		}));
		return spriteData.pipe(gulp.dest('../img/sprite/'));
});
gulp.task('sprite', ['sprite-nonmin'], function() {
	return gulp.src('../img/sprite/sprite.png') //берем готовый спрайт
	.pipe(imagemin({		//сжимаем его
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})) 																
	.pipe(gulp.dest('../img/sprite/')) //выгружаем назад

})


// преобразование svg в шрифт
var runTimestamp = Math.round(Date.now()/1000);
gulp.task('iconfont', function(){
	return gulp.src(['../img/svg/**/*.svg'])
		.pipe(iconfontCss({
			fontName: "owniconfont",
			// path: 'app/assets/css/templates/_icons.scss',
			targetPath: '../../../sass/iconfont.css',
			fontPath: '../fonts/owniconfont/',
			cssClass: 'fi'
		}))
		.pipe(iconfont({
			fontName: 'owniconfont', // required 
			prependUnicode: true, // recommended option 
			formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'], // default, 'woff2' and 'svg' are available 
			timestamp: runTimestamp, // recommended to get consistent builds when watching files 
		}))
			.on('glyphs', function(glyphs, options) {
				// CSS templating, e.g. 
				console.log(glyphs, options);
			})
		.pipe(gulp.dest('../fonts/owniconfont'));
});