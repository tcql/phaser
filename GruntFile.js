module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var buildFile = require('./build.js')

    var wrapPhaserInUmd = function(content, isAddon) {
        var replacement = [
            '(function (root, factory) {',
            '    if (typeof exports === \'object\') {',
            '        module.exports = factory();',
            '    } else if (typeof define === \'function\' && define.amd) {',
            '        define(factory);',
            '    } else {',
            '        root.Phaser = factory();',
            '  }',
            '}(this, function () {',
            content,
            'return Phaser;',
            '}));'
        ];
        return replacement.join('\n');
    };

    var wrapAddonInUmd = function(content) {
        var replacement = [
            '(function (root, factory) {',
            '    if (typeof exports === \'object\') {',
            '        module.exports = factory(require(\'phaser\'));',
            '    } else if (typeof define === \'function\' && define.amd) {',
            '        define([\'phaser\'], factory);',
            '    } else {',
            '        factory(root.Phaser);',
            '  }',
            '}(this, function (Phaser) {',
            content,
            'return Phaser;',
            '}));'
        ];
        return replacement.join('\n');
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        typescript: {
            base: {
                src: ['Phaser/**/*.ts'],
                dest: 'build/phaser.js',
                options: {
                    target: 'ES5',
                    declaration: true,
                    comments: true
                }
            },
        },

        copy: {
            main: {
                files: [{
                    src: 'build/phaser.js',
                    dest: 'Tests/phaser.js'
                }]
            },
            mainAmd: {
                files: [{
                    src: 'build/phaser.js',
                    dest: 'build/phaser.amd.js'
                }],
                options: {
                    processContent: wrapPhaserInUmd
                }
            },
        },

        watch: {
            files: '**/*.ts',
            tasks: ['typescript', 'copy']
        },


        concat: {
            phaser: {
               src: buildFile.phaser,
               dest: 'build/phaser.js' 
            }
        },

        uglify: {
            phaser: {
                files: {
                    'build/phaser.min.js': buildFile.phaser
                },
                options: {
                    sourceMap: 'build/phaser.min.js.map',
                    sourceMappingURL: 'phaser.min.js.map',
                    // This tells the map to read files one
                    // directory up from the "build" folder.
                    // 'src/' is already prefixed onto the files
                    // when the sourcemap is compiled
                    sourceMapRoot: '../',
                    wrap: false,
                }

            }
        }

    });
    
    grunt.registerTask('build-phaser',['concat:phaser']);
    grunt.registerTask('build-phaser-min',['uglify:phaser'])
    grunt.registerTask('build-all',['build-phaser','build-phaser-min']);

    grunt.registerTask('default', ['typescript', 'copy', 'watch']);

}
