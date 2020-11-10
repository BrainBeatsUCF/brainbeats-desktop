import random
from common import debugPrint
from collections import deque

try:
	import tensorflow as tf
	import tensorflow.keras as keras
except ImportError:
	debugPrint("Unable to import Tensorflow! Is it installed?")

def predict_emotion(data: deque) -> None:
	debugPrint("Loading model....")
	try:
		model =  keras.models.load_model("./model.h5")
	except Exception as e:
		debugPrint(f"Error with loading model: {e}")

	return random.choice(["happy","melancholy","surprised","calm"])
