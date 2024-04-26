
import keras

import matplotlib
matplotlib.use('TKAgg')

import segmentation_models as sm
import albumentations as A
from definitions import LABEL_CLASSES_SUPERSTRUCTURES, MODEL_NAME, MODEL_TYPE, DIR_SEGMENTATION_MODEL_DATA, \
    DIR_RESULTS_TRAINING, DATA_VERSION

import numpy as np
import os
import sklearn
import cv2
from model_training import model_definition, Dataset, get_preprocessing, denormalize, read_filenames
import os

### Define paths
from definitions import \
    DATA_DIR_ANNOTATION_EXPERIMENT, \
    DIR_IMAGES_GEOTIFF, \
    DIR_IMAGES_PNG, \
    DIR_MASKS_SUPERSTRUCTURES, \
    DIR_MASKS_SUPERSTRUCTURES_ANNOTATION_EXPERIMENT, \
    DIR_MASKS_PV_AREAS_ANNOTATION_EXPERIMENT, \
    DIR_MASKS_SEGMENTS, \
    DIR_SEGMENTATION_MODEL_DATA, \
    DIR_MASK_FILES, \
    DIR_PREDICTIONS, \
    FILE_VECTOR_LABELS_SUPERSTRUCTURES, \
    FILE_VECTOR_LABELS_SEGMENTS, \
    FILE_VECTOR_LABELS_ANNOTATION_EXPERIMENT, \
    VAL_DATA_CENTER_POINTS, \
    IMAGE_SHAPE, \
    MODEL_NAME, \
    MODEL_TYPE, \
    DATA_VERSION, \
    BACKBONE, \
    DIR_RESULTS_TRAINING

### Define labeling classes
from definitions import \
    LABEL_CLASSES_SUPERSTRUCTURES,\
    LABEL_CLASSES_SEGMENTS, \
    LABEL_CLASSES_PV_AREAS



def model_load(model_name, model_type, backbone, label_classes):
    model, preprocess_input, metrics = model_definition(label_classes, model_type, backbone)
    # load best weights
    model.load_weights(model_name + '.h5')
    return model, preprocess_input

def model_definition(label_classes, model_type, backbone):
    n_classes = len(label_classes) + 1

    BACKBONE = backbone
    LR = 0.0001

    # define network parameters
    activation = 'softmax'

    # create model
    if model_type == 'UNet':
        model = sm.Unet(BACKBONE, classes=n_classes, activation=activation)
    elif model_type == 'FPN':
        model = sm.FPN(BACKBONE, classes=n_classes, activation=activation)
    elif model_type == 'PSPNet':
        model = sm.PSPNet(BACKBONE, classes=n_classes, activation=activation)
    else:
      print('model_type not defined, choose between UNet, FPT or PSPNet')

    preprocess_input = sm.get_preprocessing(BACKBONE)

    # define optomizer
    optim = keras.optimizers.Adam(LR)

    # define loss function and metrics
    total_loss = sm.losses.categorical_focal_jaccard_loss
    metrics = [sm.metrics.IOUScore(threshold=0.5), sm.metrics.FScore(threshold=0.5)]

    # compile keras model with defined optimozer, loss and metrics
    model.compile(optim, total_loss, metrics)

    return model, preprocess_input, metrics


model, preprocess_input = model_load(MODEL_NAME, MODEL_TYPE, BACKBONE, LABEL_CLASSES_SUPERSTRUCTURES)

DIR_SEGMENTATION_MODEL_DATA = DIR_SEGMENTATION_MODEL_DATA  # + '_3' # use validation split 3

def read_filenames(path):
    with open(path) as f:
        filenames = f.readlines()
    filenames = [filename.replace("\n", "") for filename in filenames]

    return filenames

class Dataset:
    """CamVid Dataset. Read images, apply augmentation and preprocessing transformations.

    Args:
        images_dir (str): path to images folder
        masks_dir (str): path to segmentation masks folder
        class_values (list): values of classes to extract from segmentation mask
        augmentation (albumentations.Compose): data transfromation pipeline
            (e.g. flip, scale, etc.)
        preprocessing (albumentations.Compose): data preprocessing
            (e.g. noralization, shape manipulation, etc.)

    """

    CLASSES = list(LABEL_CLASSES_SUPERSTRUCTURES.values())

    def __init__(
            self,
            images_dir,
            masks_dir,
            filenames,
            classes=None,
            augmentation=None,
            preprocessing=None,
            resize=None
    ):
        self.ids = filenames
        self.images_fps = [os.path.join(images_dir, image_id) for image_id in self.ids]
        self.masks_fps = [os.path.join(masks_dir, image_id) for image_id in self.ids]

        # convert str names to class values on masks
        self.class_values = [self.CLASSES.index(cls.lower()) for cls in classes]

        self.augmentation = augmentation
        self.preprocessing = preprocessing

        self.resize = resize

    def __getitem__(self, i):

        # read data
        image = cv2.imread(self.images_fps[i])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mask = cv2.imread(self.masks_fps[i], 0)

        # PSPNet requires a specific image size -> resize image
        if self.resize != None:
            image = cv2.resize(image, [self.resize, self.resize, 3], interpolation=cv2.INTER_AREA)
            mask = cv2.resize(mask, [self.resize, self.resize, 1], interpolation=cv2.INTER_AREA)
            print(image.size)
            print(mask.size)

        # extract certain classes from mask (e.g. cars)
        masks = [(mask == v) for v in self.class_values]
        mask = np.stack(masks, axis=-1).astype('float')

        # add background if mask is not binary
        if mask.shape[-1] != 1:
            background = 1 - mask.sum(axis=-1, keepdims=True)
            mask = np.concatenate((mask, background), axis=-1)

        # apply augmentations
        if self.augmentation:
            sample = self.augmentation(image=image, mask=mask)
            image, mask = sample['image'], sample['mask']

        # apply preprocessing
        if self.preprocessing:
            sample = self.preprocessing(image=image, mask=mask)
            image, mask = sample['image'], sample['mask']

        return image, mask

    def __len__(self):
        return len(self.ids)

def get_preprocessing(preprocessing_fn):
    """Construct preprocessing transform

    Args:
        preprocessing_fn (callbale): data normalization function
            (can be specific for each pretrained neural network)
    Return:
        transform: albumentations.Compose

    """

    _transform = [
        A.Lambda(image=preprocessing_fn),
    ]
    return A.Compose(_transform)


def get_datasets(DIR_SEGMENTATION_MODEL_DATA, DIR_MASK_FILES, DATA_VERSION, preprocess_input, CLASSES, resize=None):

    # directory to images and masks
    x_dir = os.path.join(DIR_SEGMENTATION_MODEL_DATA, 'images')
    y_dir = os.path.join(DIR_SEGMENTATION_MODEL_DATA, 'masks_superstructures_reviewed')

    # filenames of train, validation and test set
    val_filenames = read_filenames(os.path.join(DIR_MASK_FILES, 'val_filenames_' + DATA_VERSION + '.txt'))



    # Dataset for validation images
    valid_dataset = Dataset(
        x_dir,
        y_dir,
        val_filenames,
        classes=CLASSES,
        preprocessing=get_preprocessing(preprocess_input),
        resize=resize
    )


    return valid_dataset


valid_dataset, _ = get_datasets(DIR_SEGMENTATION_MODEL_DATA, DIR_MASK_FILES, DATA_VERSION,
                                               preprocess_input, LABEL_CLASSES_SUPERSTRUCTURES.values(), resize=None)

def get_image_gt_and_pr_masks(model, id, test_dataset, filter_dataset, label_classes, filter_to_one_roof_only=True):
    # get mask and prediction
    image, gt_mask = test_dataset[id]

    image = np.expand_dims(image, axis=0)
    pr_mask = model.predict(image)

    # reduce to image of class per pixel
    gt_vector = np.argmax(gt_mask, axis=2)
    pr_vector = np.argmax(pr_mask.squeeze(), axis=2)

    # visualize(image=denormalize(image.squeeze()), gt=gt_vector, pr=pr_vector)

    # apply roof filter to ground truth and prediction by setting all pixels outside of roof area to background
    if filter_to_one_roof_only:
        image_control, filter_mask = filter_dataset[id]
        filter_vector = filter_mask.squeeze()
        gt_vector[filter_vector == 0] = len(label_classes)
        pr_vector[filter_vector == 0] = len(label_classes)
        # visualize(image=denormalize(image.squeeze()), gt=gt_vecQtor, pr=pr_vector)
        if np.sum(image_control-image.squeeze()) > 0:
            print('filter and test data are not loading same image')

    return image, gt_vector, pr_vector

def save_prediction_masks(model, image_dataset, label_classes, DIR_PREDICTIONS):

    for count, id in enumerate(np.arange(len(image_dataset))):
        # make prediction
        _, _, predcition = get_image_gt_and_pr_masks(
            model,
            id,
            image_dataset,
            [],
            label_classes,
            filter_to_one_roof_only=False
        )
        image_name = image_dataset.ids[id]
        filepath = os.path.join(DIR_PREDICTIONS, image_name)
        cv2.imwrite(filepath, predcition)
        # # for debugging:
        # filepath = os.path.join(DIR_PREDICTIONS + '_visible', image_name)
        # cv2.imwrite(filepath, predcition * 255 /(len(label_classes)-1))
    return


save_prediction_masks(model, valid_dataset, LABEL_CLASSES_SUPERSTRUCTURES, DIR_PREDICTIONS)
