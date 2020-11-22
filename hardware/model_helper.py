import random
import numpy as np
from common import debugPrint
from collections import deque
from pathlib import Path
from train import build_model

try:
	import tensorflow as tf
	import tensorflow.keras as keras
except ImportError:
	debugPrint("Unable to import Tensorflow! Is it installed?")

def predict_emotion(data: deque) -> str:
	debugPrint("Loading model....")
	model_path = f"{Path.cwd()}/checkpoints/model.h5"
	cpu = False
	model_path
	if cpu:
		with tf.device('/cpu:0'):
			model = keras.models.load_model(model_path)
	else:
		model = build_model()

	prediction = model.predict(np.array(list(data)).reshape(150, 1))
	emotions = ["happy","melancholy","surprised","calm"]
	choice = np.argmax(prediction[np.argmax(prediction)])

	try:
		emotion = emotions[choice]
		return emotion
	except Exception as e:
		debugPrint(f"An error occured when trying to return the emotion: {e}, with choice index of: {choice}")
		return random.choice(emotions)