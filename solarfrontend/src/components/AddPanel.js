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

export const AddPanel = ({ position, isVisible }) => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const modelRef = useRef();
  const { scene } = useThree();
  const [rotation, setRotation] = useState(0); // Başlangıç dönüş açısı 0 derece. Panelin dönmesi için gerekli

  useEffect(() => {
    // 'position' prop'u her değiştiğinde modelin konumunu güncelle
    if (modelRef.current && position) {
      modelRef.current.position.copy(position);
    }
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      // Modeli yükle
      if (!modelRef.current) {
        loadOriginalModel((originalModel) => {
          const modelClone = originalModel.clone();
          modelClone.scale.set(2, 3, 2);
          modelClone.rotation.x = Math.PI / 2;
          modelClone.position.copy(position);
          scene.add(modelClone);
          modelRef.current = modelClone;
        });
      }
    } else {
      // Modeli kaldır
      if (modelRef.current) {
        console.log("Model sahneden kaldırılıyor...");
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
    }
  }, [isVisible, position, scene]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // `+` tuşuna basıldığında dönüş açısını artır
      if (event.key === "+" || event.key === "NumpadAdd") {
        setRotation((prevRotation) => prevRotation + 0.1); // Açıyı artır
      }
      // `-` tuşuna basıldığında dönüş açısını azalt
      else if (event.key === "-" || event.key === "NumpadSubtract") {
        setRotation((prevRotation) => prevRotation - 0.1); // Açıyı azalt
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation; // Y ekseninde dönüşü güncelle
    }
  }, [rotation]);

  return null;
};

//   useEffect(() => {
//     const loadModelAsync = async () => {
//       try {
//         const loadedModel = await loadGLBModel("solarpanel.glb"); // Dosya yolu örneği
//         loadedModel.scale.set(1, 3, 2);
//         //loadedModel.scale.set(roofWidth / 10, roofHeight / 4, 1); //according tp roof heigh and with
//         loadedModel.position.set(15, 15, 15);
//         console.log("Loaded model: ", loadedModel);
//         setModel(loadedModel);
//       } catch (error) {
//         console.error("Error loading model:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadModelAsync();
//   }, []);

// const loadGLBModel = async (glbPath) => {
//   const loader = new GLTFLoader();
//   return new Promise((resolve, reject) => {
//     loader.load(
//       glbPath,
//       (gltf) => resolve(gltf.scene),
//       undefined,
//       (error) => {
//         console.error("Error loading model:", error);
//         reject(error); // Reject the promise with the error
//       }
//     );
//   });
// };

//   useEffect(() => {
//     // Paneli yükleme ve konumlandırma kodları...
//     const geometry = new THREE.BoxGeometry(10, 1, 10); // Geçici bir kutu geometrisi
//     const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.copy(position); // Prop olarak geçirilen konuma paneli yerleştir
//     scene.add(mesh);

//     return () => {
//       // Temizlik işlemleri
//       scene.remove(mesh);
//     };
//   }, [position, scene]);

//   return (
//     <>{model && <primitive object={model} rotation={[Math.PI / 2, 0, 0]} />}</>
//   );
// console.log("abuduk");
// if (!modelRef.current) {
//   console.log("leyn");
//   loadGLTFModel("solarpanel.glb", (model) => {
//     model.scale.set(2, 3, 2); // Örnek ölçeklendirme
//     model.rotation.x = Math.PI / 2;
//     modelRef.current = model;
//     scene.add(model);
//     console.log("1");
//   });
// }
//
