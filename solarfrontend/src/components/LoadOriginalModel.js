import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const modelPath = "solarpanelll.obj"; // Model path
const materialPath = "solarpanel.mtl"; // Material file path

let originalModel = null; // Cache for the original model

export const loadOriginalModel = async (onLoad) => {
  if (originalModel) {
    console.log("Original model cached, returning.");
    onLoad(originalModel);
    return;
  }

  console.log("Loading materials...");
  const mtlLoader = new MTLLoader();
  mtlLoader.load(materialPath, (materials) => {
    materials.preload();
    console.log("Materials loaded.");

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);  // Set the loaded materials
    console.log("Loading model...");
    objLoader.load(
      modelPath,
      (obj) => {
        originalModel = obj;
        onLoad(originalModel);
      },
      undefined,
      (error) => console.error("Error loading the model:", error)
    );
  });
};
