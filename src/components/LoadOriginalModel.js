// LoadOriginalModel.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let originalModel = null; // Orijinal modeli saklamak için

export const loadOriginalModel = async (modelPath, onLoad) => {
  console.log("originalModel", originalModel, " modelPath", modelPath)
  if (originalModel && originalModel.path === modelPath) {
    onLoad(originalModel);
    console.log('scenesiz')
    return;
  }

  console.log("modeli load ediyorum", modelPath);
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      originalModel = { scene: gltf.scene, path: modelPath };
      console.log('Scenesli')
      onLoad(originalModel.scene);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );
};


// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// // Orijinal modeli saklamak için bir obje kullanarak model yollarını dinamik olarak yönetelim
// const loadedModels = {};

// export const loadOriginalModel = async (modelPath, onLoad) => {
//   if (loadedModels[modelPath]) {
//     onLoad(loadedModels[modelPath]);
//     return;
//   }

//   console.log("Modeli load ediyorum: ", modelPath);
//   const loader = new GLTFLoader();
//   loader.load(
//     modelPath,
//     (gltf) => {
//       loadedModels[modelPath] = gltf.scene;
//       onLoad(loadedModels[modelPath]);
//     },
//     undefined,
//     (error) => {
//       console.error(error);
//     }
//   );
// };




// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

// const modelPath = "b.obj"; // Model path
// const materialPath = "b.mtl"; // Material file path

// let originalModel = null; // Cache for the original model

// export const loadOriginalModel = async (onLoad) => {
//   if (originalModel) {
//     console.log("Original model cached, returning.");
//     onLoad(originalModel);
//     return;
//   }

//   console.log("Loading materials...");
//   const mtlLoader = new MTLLoader();
//   mtlLoader.load(materialPath, (materials) => {
//     materials.preload();
//     console.log("Materials loaded.");

//     const objLoader = new OBJLoader();
//     objLoader.setMaterials(materials); // Set the loaded materials
//     console.log("Loading model...");
//     objLoader.load(
//       modelPath,
//       (obj) => {
//         originalModel = obj;
//         onLoad(originalModel);
//       },
//       undefined,
//       (error) => console.error("Error loading the model:", error)
//     );
//   });
// };
