import random
import eventlet
import socketio
import time
import json
import os

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio, static_files={
  '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

# Uncomment for server debug mode
# app.debug = True

sharedVariables = {}
with open(os.getcwd() + '/shared_variables.json') as environmentVariablesJsonFile:
  data = json.load(environmentVariablesJsonFile)
  for sharedVariable in data:
    for key, value in zip(sharedVariable.keys(), sharedVariable.values()):
      sharedVariables[key] = value

def getSharedVariable(key=''):
  return sharedVariables.get(key, 'defaultKey')

def deliverEvent(data=[]):
  # Call this function to send back some information to the client
  # Note: on getting this event, client will shut server down
  sio.emit(getSharedVariable('BRAINBEATS_DATA_EVENT'), data)

def deliverError(data=[]):
  # Call this function to sent back some error to the client
  # Note: on getting this event, client will shut server down
  sio.emit(getSharedVariable('BRAINBEATS_ERROR_EVENT'), {""})

def confirmationEvent():
  # This function is called to inform client that connection succeeded
  sio.emit(getSharedVariable('BRAINBEATS_CONNECT_EVENT'), "EEG connected confirmation")

@sio.event
def connect(sid, environ):
  # This function gets called when a connection is established
  confirmationEvent()

  # IMPORTANT: Use double quotes for hardtyped strings!
  # example list of 0-255 strings sent
  randomTestMessage = []
  for num in range(0, 3500):
    randomTestMessage.append(str(random.randint(0, 255)))
  deliverEvent(randomTestMessage)

@sio.on('my status')
def my_message(sid, data):
  # This can be called by client to check the status of the server
  print('Message ', data)

@sio.event
def disconnect(sid):
  # This is called to end the server
  print('Disconnect ', sid)

if __name__ == '__main__':
  eventlet.wsgi.server(eventlet.listen(('', sharedVariables.get('BRAINBEATS_HARDWARE_SOCKET_PORT', 5000))), app)