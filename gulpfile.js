const { series, parallel, src, dest, watch } = require('gulp');
const scss 					= require('gulp-sass')(require('sass'));
const uglify 				= require("gulp-uglify-es").default;
const concat 				= require('gulp-concat');
const autoprefixer 	= require('gulp-autoprefixer');
const browserSync 	= require('browser-sync').create();
const del 					= require('del');

// delete dist folder and dist index.html
function cleanDist () {
	return del(['dist', 'index.html']);
}

// scss-transform, minify style-files
function styles () {
	return src('style.scss')
		.pipe(concat('style.min.css'))								// files concatinating
		.pipe(scss({outputStyle: 'compressed'}))			// compressed version
		// .pipe(scss({ outputStyle: "expanded" }))   // readable version
		.pipe(autoprefixer())
		.pipe(dest('dist'))
}

// minify js-files
function scripts () {
	return src('index.js')
		.pipe(concat('index.min.js'))
		.pipe(uglify())
		.pipe(dest('dist'))
}

// watch for src-files
function watching () {
	watch('style.scss', styles).on('change', browserSync.reload);	// watch for all .scss files
	watch('index.js', scripts).on('change', browserSync.reload); 	// watch for all .js files
}


// update browser page
function browsersync () {
	browserSync.init({
		server: {
			baseDir: '.'
		}
	})
}

// default task
exports.default = parallel(styles, scripts,	watching,	browsersync);

// build task
exports.build = series (
	cleanDist,
	parallel(styles, scripts)
);
