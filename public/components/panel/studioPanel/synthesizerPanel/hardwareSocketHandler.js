const electron = window.require('electron')
const { ipcRenderer } = electron

/**
 * @param {(message: Dict) => void} handleData,
 * @param {(message: String) => void} handleError,
 * @param {() => void} handleConfirmation
 */
const startHardwareSocket = (handleData, handleError, handleConfirmation) => {
  ipcRenderer.once('HARDWARE_PROCESS_MESSAGE', (event, args) => {
    /// Important: Assumes any message is the predicted emotion
    handleData(args)
  })

  // Signal error UI
  ipcRenderer.once('HARDWARE_PROCESS_ERROR', () => {
    handleError()
  })

  // Signal process should start up
  ipcRenderer.send('HARDWARE_PROCESS_START')
}

const closeHardwareSocket = () => {
  ipcRenderer.send('HARDWARE_PROCESS_SHUTDOWN')
}

export { startHardwareSocket, closeHardwareSocket }
