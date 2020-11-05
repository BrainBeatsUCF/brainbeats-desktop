const io = require('socket.io-client')

console.log('Establishing Connection')
socket = io.connect('http://0.0.0.0:5333')
socket.on('connect', () => {
  console.log('Client Connected')
})

socket.on('eegEvent', message => {
  console.log(message)
})

socket.on('emotion', message => {
  console.log(message)
})
