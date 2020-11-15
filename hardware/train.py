import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Activation, Flatten, Input, Embedding
from tensorflow.keras.layers import Conv1D, MaxPooling1D, BatchNormalization, GlobalMaxPooling1D
from LSL_helper import connectToEEG, recordEEG

def build_simple_model():
	model = Sequential()
	model.add(Dense(128, activation='relu'))
	model.add(Dense(64, activation='relu'))
	model.add(Dense(4, activation='relu'))

	model.compile(loss='categorical_crossentropy',
								optimizer='adam',
								metrics=['accuracy'])

	return model


def build_model():
	model = Sequential()
	model.add(Embedding(input_dim=150,output_dim=50,input_length=1))
	model.add(Dropout(0.5))
	model.add(Conv1D(filters=250,
                 kernel_size=3,
                 padding='same',
                 activation='relu',
                 strides=1))
	model.add(GlobalMaxPooling1D())
	model.add(Dense(250))
	model.add(Activation('relu'))
	model.add(Dense(4, activation='relu'))
	model.compile(loss='categorical_crossentropy',
								optimizer='adam',
								metrics=['accuracy'])

	return model


def train_model(model, train_X, train_Y, batch_size, epochs):
	model.fit(train_X, train_y, batch_size=batch_size, epochs=epochs)
	model.save("./model.h5")
