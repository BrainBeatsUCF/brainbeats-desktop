const { spawn } = require('child_process')
const { writeFile } = require('fs')

window.spawn = spawn
window.writeFile = writeFile
