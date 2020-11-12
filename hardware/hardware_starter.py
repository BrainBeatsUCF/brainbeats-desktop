import time
import json
import random
from common import debugPrint
from LSL_helper import connectToEEG, recordEEG
from model_helper import predict_emotion


## Call this function to send the predicted emotion to the desktop
## Calling this function will end this process
def sendPredictedEmotion(emotion: str) -> None:
  print(json.dumps({ 'emotion' : emotion }))

## Call to signal to desktop that a connection has been established
def confirmConnection() -> None:
  print(json.dumps({ 'hasConfirmed' : True }))

# TODO: Error handling for None
# TODO: Add remaining model code
stream_connection = connectToEEG()
confirmConnection()
data = recordEEG(stream_connection)
emotion = predict_emotion(data)
debugPrint(f"the emotion was: {emotion}")
sendPredictedEmotion(emotion)