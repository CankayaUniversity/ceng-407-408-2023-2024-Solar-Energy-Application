import os
import numpy as np
import cv2
import segmentation_models as sm
from keras.models import load_model

# Ensure proper backbone and preprocessing are set
from definitions import MODEL_NAME, MODEL_TYPE, BACKBONE, DIR_PREDICTIONS
### Define labeling classes
from definitions import \
    LABEL_CLASSES_SUPERSTRUCTURES, \
    LABEL_CLASSES_SEGMENTS, \
    LABEL_CLASSES_PV_AREAS

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
    # İhtiyaç duyulursa daha fazla sınıf için daha fazla renk ekleyebilirsiniz.
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


# Function to process a single image and save the prediction
def process_and_save_image(image_path, model, preprocess_input, save_path):
    # Read the image
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Preprocess input
    processed_image = preprocess_input(image)
    processed_image = np.expand_dims(processed_image, axis=0)

    # Make prediction
    prediction = model.predict(processed_image)
    prediction_mask = np.argmax(prediction, axis=-1)[0]  # Get the class with highest probability for each pixel

    # Create a color mask
    color_mask = np.zeros((prediction_mask.shape[0], prediction_mask.shape[1], 3), dtype=np.uint8)

    for class_id, color in COLOR_MAP.items():
        color_mask[prediction_mask == class_id] = color

    # Save color mask as PNG
    cv2.imwrite(save_path, color_mask)

    print(f"Saved color prediction mask to {save_path}")


# Example usage
tif_image_path = r'C:\Users\emre_\Desktop\Yeni\RID-master\data\deneme1.png'  # Replace with your TIFF file path
output_png_path = r'C:\Users\emre_\Desktop\Yeni\RID-master\data\output_mask.png'
process_and_save_image(tif_image_path, model, preprocess_input, output_png_path)
