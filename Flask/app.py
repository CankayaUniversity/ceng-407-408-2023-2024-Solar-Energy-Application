import os
import numpy as np
import cv2
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import segmentation_models as sm
from tensorflow.keras import models
import requests
from PIL import Image

os.environ["SM_FRAMEWORK"] = "tf.keras"

MODEL_NAME = 'UNet_2_initial'
MODEL_TYPE = 'UNet' # options are: 'Unet', 'FPN' or 'PSPNet'
BACKBONE = 'resnet34' #resnet34, efficientnetb2

label_classes_superstructures_annotation_experiment = ['pvmodule', 'dormer', 'window', 'ladder', 'chimney', 'shadow',
                                                       'tree', 'unknown'] #
LABEL_CLASSES_SUPERSTRUCTURES = dict(zip(np.arange(0, len(label_classes_superstructures_annotation_experiment)),
                                         label_classes_superstructures_annotation_experiment))

label_classes_segments_18 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                             'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'flat']

LABEL_CLASSES_SEGMENTS = dict(zip(np.arange(0, len(label_classes_segments_18)), label_classes_segments_18))    

label_clases_pv_areas = ['pv_area']

LABEL_CLASSES_PV_AREAS = dict(zip(np.arange(0, len(label_clases_pv_areas)), label_clases_pv_areas))

# Define a color map for the classes
COLOR_MAP = {
    0: [255, 0, 0],     # Class 1 - Red
    1: [0, 255, 0],     # Class 2 - Green
    2: [0, 0, 255],     # Class 3 - Blue
    3: [255, 255, 0],   # Class 4 - Yellow
    4: [255, 0, 255],   # Class 5 - Magenta
    5: [0, 255, 255],   # Class 6 - Cyan
    6: [128, 0, 0],     # Class 7 - Maroon
    7: [0, 128, 0],     # Class 8 - Olive
    8: [0, 0, 128],     # Class 9 - Navy
    9: [128, 128, 0],   # Class 10 - Purple
    10: [0, 128, 128],  # Class 11 - Teal
}

# Function to load the model with necessary components
def load_model_custom(model_name, model_type, backbone):
    n_classes = len(LABEL_CLASSES_SUPERSTRUCTURES) + 1  # Including background class
    activation = 'softmax'

    # Create model
    if model_type == 'UNet':
        model = sm.Unet(backbone, classes=n_classes, activation=activation)
    elif model_type == 'FPN':
        model = sm.FPN(backbone, classes=n_classes, activation=activation)
    elif model_type == 'PSPNet':
        model = sm.PSPNet(backbone, classes=n_classes, activation=activation)
    else:
        raise ValueError("Unsupported model type. Choose between 'UNet', 'FPN', or 'PSPNet'.")

    # Load weights
    model.load_weights(model_name + '.h5')

    # Preprocessing function for the specific backbone
    preprocess_input = sm.get_preprocessing(backbone)

    return model, preprocess_input

# Load model and preprocessing function
model, preprocess_input = load_model_custom(MODEL_NAME, MODEL_TYPE, BACKBONE)

# Function to process a single image and return the prediction as Base64
def process_image(image, model, preprocess_input):
    # Preprocess input
    processed_image = preprocess_input(image)
    print(processed_image.shape)
    processed_image = np.expand_dims(processed_image, axis=0)

    # Make prediction
    prediction = model.predict(processed_image)
    prediction_mask = np.argmax(prediction, axis=-1)[0]  # Get the class with highest probability for each pixel

    # Create a color mask
    color_mask = np.zeros((prediction_mask.shape[0], prediction_mask.shape[1], 3), dtype=np.uint8)

    for class_id, color in COLOR_MAP.items():
        color_mask[prediction_mask == class_id] = color

    # Encode the color mask to Base64
    _, buffer = cv2.imencode('.png', color_mask)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return encoded_image

app = Flask(__name__)
CORS(app)

@app.route('/process_image', methods=['POST'])
def process_image_route():
    if 'staticmapurl' not in request.form:
        return jsonify({'error': 'No URL provided'}), 400

    url = request.form['staticmapurl']
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to download image'}), 400

    image = Image.open(BytesIO(response.content)).convert('RGB')
    image = np.array(image)

    encoded_image = process_image(image, model, preprocess_input)

    return jsonify({'image': encoded_image}), 200


if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(host='0.0.0.0', port=5000)
