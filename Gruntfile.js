module.exports = function(grunt) {
	'use strict';

	/* Load all Grunt tasks */
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/**
		 * Watch for changes in files
		 * and run tasks when they are modified
		 */
		watch: {

			/**
			 * All stylesheets, excluding those needing
			 * to be copied to theme root
			 *
			 * Save time by excluding the special style tasks
			 */
			styles: {
				files: ['scss/**/*.{scss,sass}'],
				tasks: ['compass'],
				options: {
					debounceDelay: 500
				}
			},

			/**
			 * Vendor and source JavaScript
			 */
			scripts: {
				files: ['js/source/**/*.js', 'js/vendor/**/*.js'],
				tasks: ['jshint', 'uglify'],
				options: {
					debounceDelay: 500
				}
			},

			/**
			 * Send commands to the LiveReload browser extension
			 */
			livereload: {
				options: {
					livereload: true
				},
				files: [
					'css/*.css',
					'js/*.js',
					'*.html',
					'*.php',
					'images/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		/**
		 * Lint the Gruntfile and
		 * source JavaScript with JSHint
		 */
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				'force': true
			},
			gruntfile: ['Gruntfile.js'],
			source: ['js/source/**/*.js']
		},

		/**
		 * Compress JavaScript and create source maps
		 */
		uglify: {

			app: {
				options: {
					sourceMap: 'js/map/source-map-app.js.map'
				},
				files: {
					'js/app.min.js': [
						'js/source/app.js'
					]
				}
			}
		},

		/**
		 * Use Compass to compile Sass stylesheets
		 */
		compass: {
			dist: {}
		},

		/**
		 * Compress images to save bandwidth and
		 * load times.
		 *
		 * This task must be ran manually using `grunt imagemin`
		 */
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

	grunt.registerTask('default', ['jshint', 'uglify', 'compass'] );
};
