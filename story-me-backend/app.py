import os 
from os import walk
from flask import Flask, flash, request, jsonify
from flask_cors import CORS
from image2text import image2text
from werkzeug.utils import secure_filename

from werkzeug.datastructures import ImmutableMultiDict


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload/', methods=['POST'])
def upload_file():
    files = request.files.getlist('file')
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    filenames = next(walk(UPLOAD_FOLDER), (None, None, []))[2]
    text1 = image2text(filenames)
    for file in filenames:
        os.remove('uploads/'+file)
    return jsonify({"images":text1})

@app.route("/")
def home():
    filenames = next(walk(UPLOAD_FOLDER), (None, None, []))[2]
    text1 = image2text(filenames)
    return text1