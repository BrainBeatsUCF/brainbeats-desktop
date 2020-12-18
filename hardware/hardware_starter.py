import time
import json
import random
from common import debugPrint, sendPredictedEmotion, confirmConnection
from LSL_helper import connectToEEG, recordEEG
from model_helper import predict_emotion

# The main EEG script that the desktop calls
stream_connection = connectToEEG()
if stream_connection == None:
	debugPrint("Could not connect to EEG stream... disconnecting...")
	exit()

confirmConnection()
data = recordEEG(stream_connection)
if data == None:
	debugPrint("Could not record data from EEG headset... exiting.....")
	exit()

emotion = predict_emotion(data)
debugPrint(f"The predicted emotion was: {emotion}")
sendPredictedEmotion(emotion)