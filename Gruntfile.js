/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    dpy: grunt.file.readJSON('deploy.json'),
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',
    connect: {
      server: {
        options: {
          keepalive: true,
          livereload: true,
          port: 8000
        }
      }
    },
    open: {
      dev: {
        path: 'http://localhost:8000',
        app: 'Google Chrome'
      }
    },
    // deploy to a remote server
    shell: {
      deploy: {
        command: 'rsync -avz --exclude-from "<%= dpy.excludesFile %>" $PWD <%= dpy.deployUser %>@<%= dpy.deployServer %>:<%= dpy.deployDir %>',
        options: {
          stdout: true
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'scripts/<%= pkg.optimizedFile %>.js',
        dest: 'scripts/<%= pkg.name.toLowerCase() %>.min.js'
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: 'scripts',
          mainConfigFile: 'scripts/main.js',
          out: 'scripts/<%= pkg.optimizedFile %>.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['open', 'connect']);
  grunt.registerTask('build', ['requirejs', 'uglify']);
  grunt.registerTask('require', ['requirejs']);

};
