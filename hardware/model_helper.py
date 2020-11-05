import random

try:
	import tensorflow as tf
	import tensorflow.keras as keras
except Exception:
	print("Unable to import Tensorflow! Is it installed?")

def predict_emotion(emotion):
	try:
		model =  keras.models.load_model("Test.h5")
	except Exception:
		return None

	return random.choice(["happy"])

	