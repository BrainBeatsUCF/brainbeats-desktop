const electron = window.require('electron')
const { ipcRenderer } = electron

let shouldLimitResponse = false

/**
 * @param {(message: Dict) => void} handleData,
 * @param {(message: String) => void} handleError,
 * @param {() => void} handleConfirmation
 */
const startHardwareSocket = (handleData, handleError, handleConfirmation) => {
  shouldLimitResponse = false
  ipcRenderer.on('HARDWARE_PROCESS_MESSAGE', (event, args) => {
    if (args === 'hasConfirmed') {
      handleConfirmation()
    } else if (shouldLimitResponse === false) {
      /// Important: Assumes any other message is the predicted emotion
      shouldLimitResponse = true
      handleData(args)
    }
  })

  // Signal error UI
  ipcRenderer.on('HARDWARE_PROCESS_ERROR', () => {
    handleError()
  })

  // Signal process should start up
  ipcRenderer.send('HARDWARE_PROCESS_START')
  return null
}

const closeHardwareSocket = () => {
  ipcRenderer.send('HARDWARE_PROCESS_SHUTDOWN')
}

export { startHardwareSocket, closeHardwareSocket }
