fx_version 'cerulean'
name 'brz-inventory'
author 'brz.gg'
lua54 'yes'
game 'gta5'

shared_scripts {
    'settings.js',
    'items.js',
    '@ox_lib/init.lua',
}

ox_libs {
    'interface',
}

server_script 'dist/server/**/*.js'

client_script 'dist/client/**/*.js'

ui_page 'nui/inventory.html'

files {
    'settings.js',
    'items.js',
    'nui/*.html',
    'nui/dist/*.js',
    'nui/dist/dom/*.js'
}
