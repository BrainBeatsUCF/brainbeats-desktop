import random
import eventlet
import socketio
import time

connectEvent = 'eegConnect'
errorEvent = 'eegError'
dataEvent = 'eegEvent'
port = 5333

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio, static_files={
  '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

# Uncomment for server debug mode
# app.debug = True

def deliverEvent(data=[]):
  # Call this function to send back some information to the client
  # Note: on getting this event, client will shut server down
  sio.emit(dataEvent, data)

def deliverError(data=[]):
  # Call this function to sent back some error to the client
  # Note: on getting this event, client will shut server down
  sio.emit(errorEvent, {''})

def confirmationEvent():
  # This function is called to inform client that connection succeeded
  sio.emit(connectEvent, connectEvent)

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
  eventlet.wsgi.server(eventlet.listen(('', port)), app)