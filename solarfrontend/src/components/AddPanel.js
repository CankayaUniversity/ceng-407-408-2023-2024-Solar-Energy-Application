import React, { useState, useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // GLTFLoader'ı import et
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadOriginalModel } from "./LoadOriginalModel";

const loadGLTFModel = async (path, onLoad) => {
  const loader = new GLTFLoader();
  loader.load(
    path,
    (gltf) => onLoad(gltf.scene),
    undefined,
    (error) => console.error(error)
  );
};

export const AddPanel = ({ position, isPlaced, isCancelled }) => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const modelRef = useRef();
  const { scene } = useThree();
  const [rotation, setRotation] = useState(0); // Başlangıç dönüş açısı 0 derece. Panelin dönmesi için gerekli
  const light = new THREE.AmbientLight(undefined, 0.5); // soft white light with 0.5 intensity
  const [rotationX, setRotationX] = useState(Math.PI / 2);

  useEffect(() => {}, [scene]);

  useEffect(() => {
    // 'position' prop'u her değiştiğinde modelin konumunu güncelle
    if (modelRef.current && position) {
      modelRef.current.position.copy(position);
    }
  }, [position]);

  useEffect(() => {
    // Model yalnızca bir kez yüklenir

    // Model varsa ve sahnede ise, modeli sahneden kaldır
    console.log(
      "isp: ",
      isPlaced,
      " model.ref: ",
      modelRef.current,
      " iscan: ",
      isCancelled
    );
    if (modelRef.current && isCancelled) {
      console.log("isCancelled: ", isCancelled);
      scene.remove(modelRef.current);
      modelRef.current = null;
      console.log("girdi");
    }

    console.log("abuduk");
    if (!modelRef.current) {
      scene.add(light);
      loadOriginalModel((originalModel) => {
        const modelClone = originalModel.clone();
        modelClone.rotation.y = Math.PI / 2;
        modelClone.scale.set(2, 4, 2); // Boyutları iki katına çıkarır
        modelClone.rotation.x = Math.PI / 2;
        modelClone.position.copy(position);
        scene.add(modelClone);
        modelRef.current = modelClone;
      });
    }
  }, [scene, isCancelled]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // `+` tuşuna basıldığında dönüş açısını artır
      if (event.key === "+" || event.key === "NumpadAdd") {
        setRotation((prevRotation) => prevRotation + 0.1); // Açıyı artır
      }
      // `-` tuşuna basıldığında dönüş açısını azalt
      else if (event.key === "-" || event.key === "NumpadSubtract") {
        setRotation((prevRotation) => prevRotation - 0.1); // Açıyı azalt
      } else if (event.key === "ArrowUp") {
        setRotationX((prevRotation) => prevRotation + 0.1); // Increase X rotation
      } else if (event.key === "ArrowDown") {
        setRotationX((prevRotation) => prevRotation - 0.1); // Decrease X rotation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      modelRef.current.rotation.x = rotationX; // Y ekseninde dönüşü güncelle
    }
  }, [rotation, rotationX]);

  return null;
};

// import React, { useState, useEffect, useRef } from "react";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // GLTFLoader'ı import et
// import { useThree } from "@react-three/fiber";
// import * as THREE from "three";
// import { loadOriginalModel } from "./LoadOriginalModel";

// const loadGLTFModel = async (path, onLoad) => {
//   const loader = new GLTFLoader();
//   loader.load(
//     path,
//     (gltf) => onLoad(gltf.scene),
//     undefined,
//     (error) => console.error(error)
//   );
// };

// export const AddPanel = ({ position, isVisible }) => {
//   const [model, setModel] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const modelRef = useRef();
//   const { scene } = useThree();
//   const [rotation, setRotation] = useState(0); // Başlangıç dönüş açısı 0 derece. Panelin dönmesi için gerekli

//   useEffect(() => {
//     // 'position' prop'u her değiştiğinde modelin konumunu güncelle
//     if (modelRef.current && position) {
//       modelRef.current.position.copy(position);
//     }
//   }, [position]);

//   useEffect(() => {
//     if (isVisible) {
//       // Modeli yükle
//       if (!modelRef.current) {
//         loadOriginalModel((originalModel) => {
//           const modelClone = originalModel.clone();
//           modelClone.scale.set(2, 3, 2);
//           modelClone.rotation.x = Math.PI / 2;
//           modelClone.position.copy(position);
//           scene.add(modelClone);
//           modelRef.current = modelClone;
//         });
//       }
//     } else {
//       // Modeli kaldır
//       if (modelRef.current) {
//         console.log("Model sahneden kaldırılıyor...");
//         scene.remove(modelRef.current);
//         modelRef.current = null;
//       }
//     }
//   }, [isVisible, position, scene]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       // `+` tuşuna basıldığında dönüş açısını artır
//       if (event.key === "+" || event.key === "NumpadAdd") {
//         setRotation((prevRotation) => prevRotation + 0.1); // Açıyı artır
//       }
//       // `-` tuşuna basıldığında dönüş açısını azalt
//       else if (event.key === "-" || event.key === "NumpadSubtract") {
//         setRotation((prevRotation) => prevRotation - 0.1); // Açıyı azalt
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   useEffect(() => {
//     if (modelRef.current) {
//       modelRef.current.rotation.y = rotation; // Y ekseninde dönüşü güncelle
//     }
//   }, [rotation]);

//   return null;
// };

// import React, { useState, useEffect, useRef } from "react";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { useThree } from "@react-three/fiber";
// import * as THREE from "three";
// import { loadOriginalModel } from "./LoadOriginalModel";

// export const AddPanel = ({ position, isVisible }) => {
//   const [model, setModel] = useState(null);
//   const [modelLoaded, setModelLoaded] = useState(false);
//   const modelRef = useRef();
//   const { scene } = useThree();
//   const [rotation, setRotation] = useState(0);

//   useEffect(() => {
//     if (isVisible && !modelLoaded) {
//       loadOriginalModel((originalModel) => {
//         const modelClone = originalModel.clone();
//         modelClone.scale.set(2, 3, 2);
//         modelClone.rotation.x = Math.PI / 2;
//         modelClone.position.copy(position);
//         scene.add(modelClone);
//         modelRef.current = modelClone;
//         setModelLoaded(true);  // Set model loaded to true to prevent re-loading
//       });
//     } else if (!isVisible && modelRef.current) {
//       scene.remove(modelRef.current);
//       modelRef.current = null;
//       setModelLoaded(false);  // Reset the model loaded flag
//     }
//   }, [isVisible, position, scene]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "+" || event.key === "NumpadAdd") {
//         setRotation((prevRotation) => prevRotation + 0.1);
//       } else if (event.key === "-" || event.key === "NumpadSubtract") {
//         setRotation((prevRotation) => prevRotation - 0.1);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   useEffect(() => {
//     if (modelRef.current) {
//       modelRef.current.rotation.y = rotation;
//     }
//   }, [rotation]);

//   return null;
// };
