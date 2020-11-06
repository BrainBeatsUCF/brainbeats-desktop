import time
import json
import random

## Errors thrown in this file will immediately end this process

## Call this function to send the predicted emotion to the desktop
## Calling this function will end this process
def sendPredictedEmotion(emotion):
  print(json.dumps({ 'emotion' : emotion }))

## Used for printing statements to application console
def debugPrint(message):
  print('BACKGROUND DEBUG PRINT:', message)

## Call to signal to desktop that a connection has been established
def confirmConnection():
  print(json.dumps({ 'hasConfirmed' : True }))

## Example print statment
## Please default to this method over the normal print for debugging 
debugPrint("Script Handler Booted")

## Uncomment this line to send confirmation that EEG you've been 
## able to connect to the EEG
confirmConnection()

## Perform recording and prediction after confirmation
## When predicted emotion is ready, call `sendPredictedEmotion(predictedEmotion`
## to send this back to the desktop

## For example, a random emotion being sent back
sendPredictedEmotion(random.choice(['happy', 'joy']))