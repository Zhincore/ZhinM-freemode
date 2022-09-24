fx_version 'bodacious'
game 'gta5'

author 'Zhincore'
version '1.0.0'

fxdk_watch_command 'yarn' {'watch'}
fxdk_build_command 'yarn' {'build'}

dependencies {
  'spawnmanager',
  'baseevents'
}

resource_type 'gametype' { name = 'Freemode' }

client_script 'dist/client.js'
