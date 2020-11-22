import json

## Used for printing statements to application console
def debugPrint(message):
  print('BACKGROUND DEBUG PRINT:', message)

## Call this function to send the predicted emotion to the desktop
## Calling this function will end this process
def sendPredictedEmotion(emotion: str) -> None:
  print(json.dumps({ 'emotion' : emotion }))

## Call to signal to desktop that a connection has been established
def confirmConnection() -> None:
  print(json.dumps({ 'hasConfirmed' : True }))