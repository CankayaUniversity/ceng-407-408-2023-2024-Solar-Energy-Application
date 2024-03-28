import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // GLTFLoader'ı import et
import { Experience } from "../../components/Experience";
import roofImage from "../../assets/images/roof.jpg";
import { Vector3 } from "three";
import * as THREE from "three";

function CameraControlled() {
  const { camera } = useThree();
  useEffect(() => {
    const initialDistance = 500;
    const maxDistance = 1000;
    const minDistance = 0;

    const updateCameraPosition = () => {
      if (camera.position.z > maxDistance) {
        camera.position.z = maxDistance;
      } else if (camera.position.z < minDistance) {
        camera.position.z = minDistance;
      }
    };

    updateCameraPosition();

    const handleMouseWheel = (event) => {
      camera.position.z -= event.deltaY * 0.1;
      updateCameraPosition();
    };

    document.addEventListener("wheel", handleMouseWheel);

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, [camera]);

  return null;
}

const loadGLBModel = async (glbPath) => {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      glbPath,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => {
        console.error("Error loading model:", error);
        reject(error); // Reject the promise with the error
      }
    );
  });
};

function SimulationTest() {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModelAsync = async () => {
      try {
        const loadedModel = await loadGLBModel("solarpanel.glb"); // Dosya yolu örneği
        console.log("anani sikm");
        loadedModel.scale.set(6, 10, 3);
        loadedModel.position.set(0, 0, 0);
        console.log("Loaded model: ", loadedModel);
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModelAsync();
  }, []);

  return (
    <Canvas
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <CameraControlled />
      <Experience roofImage={roofImage} />
      <OrbitControls enableRotate={true} />
      {model && <primitive object={model} rotation={[Math.PI / 2, 0, 0]} />}
    </Canvas>
  );
}

export default SimulationTest;
