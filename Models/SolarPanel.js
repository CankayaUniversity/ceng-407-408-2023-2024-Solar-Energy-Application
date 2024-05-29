const mongoose = require('mongoose');

// Vector3 schema definition
const vector3Schema = new mongoose.Schema({
  x: Number,
  y: Number,
  z: Number
});

// Child schema definition
const childSchema = new mongoose.Schema({
  isObject3D: Boolean,
  uuid: String,
  name: String,
  type: String,
  parent: String, // Parent's UUID
  position: vector3Schema,
  rotation: {
    _x: Number,
    _y: Number,
    _z: Number,
    _order: String
  },
  scale: vector3Schema
});

// Quaternion schema definition
const quaternionSchema = new mongoose.Schema({
  isQuaternion: Boolean,
  _x: Number,
  _y: Number,
  _z: Number,
  _w: Number
});

// Layers schema definition
const layersSchema = new mongoose.Schema({
  mask: Number
});

// Matrix schema definition
const matrixSchema = new mongoose.Schema({
  elements: [Number]
});

// UserData schema definition
const userDataSchema = new mongoose.Schema({
  batchIndex: Number,
  isPanel: Boolean,
  startPosition: vector3Schema,
  currentPosition: vector3Schema
});

// Solar Panel schema definition
const solarPanelSchema = new mongoose.Schema({
  roofImage: String,
  panels: [{
    batchIndex: Number,
    isPanel: Boolean,
    startPosition: vector3Schema,
    currentPosition: vector3Schema,
    animations: Array,
    callback: String, // This can be a string representation of the function
    castShadow: Boolean,
    children: [childSchema],
    frustumCulled: Boolean,
    isGroup: Boolean,
    isObject3D: Boolean,
    layers: layersSchema,
    matrix: matrixSchema,
    matrixAutoUpdate: Boolean,
    matrixWorld: matrixSchema,
    matrixWorldAutoUpdate: Boolean,
    matrixWorldNeedsUpdate: Boolean,
    name: String,
    parent: String, // Parent's UUID
    position: vector3Schema,
    quaternion: quaternionSchema,
    receiveShadow: Boolean,
    renderOrder: Number,
    rotation: {
      isEuler: Boolean,
      _x: Number,
      _y: Number,
      _z: Number,
      _order: String
    },
    scale: vector3Schema,
    type: String,
    up: vector3Schema,
    userData: userDataSchema,
    uuid: String
  }]
});

module.exports = mongoose.model('SolarPanel', solarPanelSchema);
