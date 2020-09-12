import io from 'socket.io-client'

// A wait time is required since hardware must be up and running
// before a socket connection is attempted
const delayMilliseconds = 1500
const socketConnectionURL = 'http://0.0.0.0:5333'
const serverStartScriptRelativePath = './hardware/starter.py'
const ChildProcessMessages = {
  Exit: 'Child Process Exit Code',
  Alert: 'Child Process Message',
  End: 'Child Process Ended',
}

let child = null
let socket = null

/**
 * @param {(message: [String]) => void} handleData
 * @param {(message: String) => void} handleError
 */
async function establishConnection(handleData, handleError) {
  setTimeout(() => {
    console.log('Establishing Connection')
    socket = io.connect(socketConnectionURL)
    socket.on('connect', () => {
      console.log('Client Connected')
    })
    socket.on('eegEvent', message => {
      handleData(message)
    })
    socket.on('eegError', message => {
      handleError(message)
    })
  }, delayMilliseconds)
}

/**
 * @param {(message: [String]) => void} handleData
 * @param {(message: String) => void} handleError
 */
const startHardwareSocket = (handleData, handleError) => {
  child = window.spawn('python', [serverStartScriptRelativePath])

  child.on('exit', code => {
    console.log(`${ChildProcessMessages.Exit}: ${code}`)
  })

  child.stdout.on('data', data => {
    const message = new TextDecoder('utf-8').decode(data)
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  child.stderr.on('data', data => {
    const message = new TextDecoder('utf-8').decode(data)
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  child.on('message', message => {
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  establishConnection(handleData, handleError)
  return child
}

const closeHardwareSocket = () => {
  if (socket != null && socket !== undefined) {
    socket.disconnect()
    socket = null
  }
  if (child != null && child !== undefined) {
    child.kill('SIGINT')
    child = null
  }
  console.log(ChildProcessMessages.End)
}

export { startHardwareSocket, closeHardwareSocket }
