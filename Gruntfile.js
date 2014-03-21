/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.licenses.join(", ") %> */\n',
    // Task configuration.
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: false
      },
      dist: {
        src: 'app/controller.js',
        dest: 'app/controller.min.js'
      }
    },
    less:{
      options:{
        banner: '<%= banner %>',
      },
      dist:{
        src:['css/style.less'],
        dest: 'css/style.css'
      }
    },
    cssmin:{
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'css/style.css',
        dest: 'css/style.min.css'
      }
    },
    compress: {
      css: {
        options: {
          mode: 'gzip'
        },
        files: {
          expand: true,
          src: 'css/style.min.css',
          dest: 'css/style.min.css.gz'
        }
      },
      js: {
        options: {
          mode: 'gzip'
        },
        files: {
          expand: true,
          src: 'app/controller.min.js',
          dest: 'app/controller.min.js.gz'
        }
      },
      html: {
        options: {
          mode: 'gzip'
        },
        files: {
          expand: true,
          src: 'index.html',
          dest: 'index.html.gz'
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js: {
        files: ['app/controller.js'],
        tasks: ['uglify']
      },
      less:{
        files: ['css/*.less', 'app/**/*.less'],
        tasks: ['less', 'cssmin']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['uglify', 'less', 'cssmin']);

};
