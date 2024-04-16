// models.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const modelPath = "solarpanel.glb"; // Modelin yolu
let originalModel = null; // Orijinal modeli saklamak için

// Modeli yükleme fonksiyonu
export const loadOriginalModel = async (onLoad) => {
  if (originalModel) {
    console.log("orjinal model boş returndeyim");
    onLoad(originalModel);
    return;
  }

  console.log("modeli load ediyorum");
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      originalModel = gltf.scene;
      onLoad(originalModel);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );
};
