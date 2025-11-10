from flask import Flask, render_template, request, send_from_directory
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
import os
import mysql.connector

# create app
app = Flask(__name__)

# load the trained model
model = load_model("models/model.h5")

# class labels
class_labels = ['meningioma', 'notumor', 'pituitary', 'glioma']

# Define the uploads folder
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# MySQL connection
db = mysql.connector.connect(
    host='127.0.0.1',
    user='root',
    password='Ernavneet@26',
    database='tumor_db'
)
cursor = db.cursor(dictionary=True)

# helper function to predict tumor type
def predict_tumor(image_path):
    IMAGE_SIZE = 224
    img = load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    confidence_score = np.max(predictions, axis=1)[0]

    return class_labels[predicted_class_index], confidence_score

# fetch tumor info from database
def fetch_tumor_info(tumor_type, confidence):
    query = "SELECT * FROM tumor_info WHERE tumor_type=%s"
    cursor.execute(query, (tumor_type,))
    data = cursor.fetchone()
    if not data:
        return None

    # Select confidence-based suggestion
    if confidence >= 0.9:
        confidence_level = 'High'
        suggestion = data['high_confidence']
    elif confidence >= 0.7:
        confidence_level = 'Medium'
        suggestion = data['medium_confidence']
    else:
        confidence_level = 'Low'
        suggestion = data['low_confidence']

    # Return all relevant info
    return {
        'tumor_type': tumor_type,
        'tumor_description': data['tumor_description'],
        'symptoms': data['symptoms'],
        'mri_characteristics': data['mri_characteristics'],
        'treatment': data['treatment'],
        'hospital_recommendation': data['hospital_recommendation'],
        'diet_advice': data['diet_advice'],
        'confidence_level': confidence_level,
        'confidence': round(confidence * 100, 2),
        'suggestion': suggestion
    }

@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # handle file upload
        file = request.files.get('file')
        if file:
            file_location = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_location)

            # Predict tumor type
            tumor_type, confidence = predict_tumor(file_location)

            # Fetch info from DB
            tumor_info = fetch_tumor_info(tumor_type, confidence)

            return render_template(
                'index.html',
                file_path=f"/uploads/{file.filename}",
                tumor_info=tumor_info
            )

    return render_template('index.html', tumor_info=None)

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# run the app
if __name__ == '__main__':
    app.run(debug=True)
