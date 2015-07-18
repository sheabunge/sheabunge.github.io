module.exports = function(grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		watch: {

			css: {
				files: ['css/**/*.scss'],
				tasks: ['css']
			},

			js: {
				files: ['js/**/*.js', '!js/min/**/*.js'],
				tasks: ['js']
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc',
				'force': true
			},
			gruntfile: ['Gruntfile.js'],
			source: ['js/**/*.js', '!js/vendor/**/*.js', '!js/min/**/*.js']
		},

		uglify: {
			app: {
				options: {
					sourceMap: true
				},
				files: {
					'js/min/app.js': ['js/app.js']
				}
			}
		},

		sass: {
			dist: {
				cwd: 'css',
				src: '*.scss',
				dest: 'css/build',
				expand: true,
				ext: '.css'
			}
		},

		autoprefixer: {
			dist: {
				expand: true,
				flatten: true,
				src: 'css/build/*.css',
				dest: 'css/build'
			}
		},

		csso: {
			dist: {
				expand: true,
				flatten: true,
				src: 'css/build/*.css',
				dest: 'css/min'
			}
		},

		imagemin: {
		    dist: {
		        options: {
		            optimizationLevel: 7,
		            progressive: true
		        },
		        files: [{
		            expand: true,
		            cwd: 'images/',
		            src: '**/*',
		            dest: 'images/'
		        }]
		    }
		}

	});

	grunt.registerTask( 'js', ['jshint', 'uglify'] );
	grunt.registerTask( 'css', ['sass', 'autoprefixer', 'csso'] );
	grunt.registerTask( 'default', ['css', 'js'] );
};
