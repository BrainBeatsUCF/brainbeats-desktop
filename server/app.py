from flask import Flask

app = Flask(__name__)
app.debug = True

@app.route("/")
def home():
  print('flask called')
  return "Hello, World! - BrainBeats"

app.run()
print('Python Server Started')