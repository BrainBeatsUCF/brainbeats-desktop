from starter import deliverError
import random

try:
	import tensorflow as tf
	import tensorflow.keras as keras
except Exception:
	print("Unable to import Tensorflow! Is it installed?")
	deliverError(["Error with importing tensorflow"])

def predict_emotion(emotion):
	try:
		model =  keras.models.load_model("Test.h5")
	except Exception:
		deliverError(["Error with loading ML model"])

	return random.choice(["happy"])

	