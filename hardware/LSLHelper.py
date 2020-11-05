from pylsl import StreamInlet, resolve_byprop
from collections import deque
import time

FFT_MAX_HZ = 60
HM_SECONDS = 10  # this is approximate. Not 100%. do not depend on this.
TOTAL_ITERS = HM_SECONDS*25  # ~25 iters/sec
EEG_CHANNELS = 4

def connectToEEG() -> StreamInlet:
	print("Attempting to connect to the EEG headset...")
	try: 
		streams = resolve_byprop('type', 'EEG')
		print("Connected!")
		return StreamInlet(streams[0])
	except Exception:
		return None

def recordEEG(stream_connection: StreamInlet):
	last_print = time.time()
	fps_counter = deque(maxlen=150)
	data = deque()
	FFT_MAX_HZ = 60
	HM_SECONDS = 10  # this is approximate. Not 100%. do not depend on this.
	TOTAL_ITERS = HM_SECONDS*15  # ~15 iters/sec
	EEG_CHANNELS = 4

	try:
		for i in range(TOTAL_ITERS):
			channel_data = []
			for i in range(EEG_CHANNELS):
					sample, _ = inlet.pull_sample()
					channel_data.append(sample[:FFT_MAX_HZ])

			fps_counter.append(time.time() - last_print)
			last_print = time.time()
			cur_raw_hz = 1/(sum(fps_counter)/len(fps_counter))
			data.append(cur_raw_hz)
		return data
	except Exception:
		return None
