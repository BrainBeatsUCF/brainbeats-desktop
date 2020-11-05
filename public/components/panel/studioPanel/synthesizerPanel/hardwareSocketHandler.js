import io from 'socket.io-client'

// A wait time is required since hardware must be up and running
// before a socket connection is attempted
const delayMilliseconds = window.process.env['BRAINBEATS_HARDWARE_SOCKET_LAUNCH_DELAY']
const socketConnectionURL =
  window.process.env['BRAINBEATS_HOST_URL'] + String(window.process.env['BRAINBEATS_HARDWARE_SOCKET_PORT'])
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
 * @param {() => void} handleConfirmation
 */
function establishConnection(handleData, handleError, handleConfirmation) {
  setTimeout(() => {
    if (child == null || child === undefined) {
      return
    }
    console.log('Establishing Connection')
    //socket = io.connect(socketConnectionURL)
    socket = io.connect('http://0.0.0.0:5333')
    socket.on('connect', () => {
      console.log('Client Connected')
    })
    socket.on(window.process.env['BRAINBEATS_DATA_EVENT'], message => {
      handleData(message)
    })
    socket.on(window.process.env['BRAINBEATS_ERROR_EVENT'], message => {
      handleError(message)
      closeHardwareSocket()
    })
    socket.on(window.process.env['BRAINBEATS_CONNECT_EVENT'], () => {
      handleConfirmation()
    })
  }, delayMilliseconds)
}

/**
 * @param {(message: [String]) => void} handleData,
 * @param {(message: String) => void} handleError,
 * @param {() => void} handleConfirmation
 */
const startHardwareSocket = (handleData, handleError, handleConfirmation) => {
  child = window.spawn('python', [serverStartScriptRelativePath])

  child.on('exit', code => {
    if (socket != null && socket != undefined) {
      socket.disconnect()
      socket = null
    }
    closeHardwareSocket()
    console.log(`${ChildProcessMessages.Exit}: ${code}`)
  })

  // message sent to stdout from python. Example: a print statement
  child.stdout.on('data', data => {
    const message = new TextDecoder('utf-8').decode(data)
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  // message sent to standard error from python code
  child.stderr.on('data', data => {
    const message = new TextDecoder('utf-8').decode(data)
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  // miscellaneous to catch other broadcast messages from the actual process
  child.on('message', message => {
    console.log(`${ChildProcessMessages.Alert}: ${message}`)
  })

  establishConnection(handleData, handleError, handleConfirmation)
  return child
}

const closeHardwareSocket = () => {
  if (socket != null && socket !== undefined) {
    console.log('calling socket disconnect')
    socket.disconnect()
    socket = null
  }
  if (child != null && child !== undefined) {
    console.log('killing child process')
    child.kill('SIGINT')
    child = null
  }
  console.log(ChildProcessMessages.End)
}

export { startHardwareSocket, closeHardwareSocket }
