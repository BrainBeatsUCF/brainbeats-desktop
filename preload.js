const { spawn } = require('child_process')
const { writeFile } = require('fs')
const environmentVariables = require('./shared_variables.json')

window.spawn = spawn
window.writeFile = writeFile

environmentVariables.forEach(variable => {
  const keyString = Object.keys(variable)[0]
  window.process.env[keyString] = variable[keyString]
})
