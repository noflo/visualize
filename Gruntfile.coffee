module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Browser build of NoFlo
    noflo_browser:
      build:
        files:
          'browser/visualize.js': ['entry.js']

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-noflo-browser'

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    # @task.run 'coffee'
    # @task.run 'noflo_manifest'
    if target is 'all' or target is 'browser'
      @task.run 'noflo_browser'
      # @task.run 'uglify'
