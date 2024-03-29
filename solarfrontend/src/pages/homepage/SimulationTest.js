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
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
  };

  useEffect(() => {
    const loadModelAsync = async () => {
      try {
        const loadedModel = await loadGLBModel("solarpanel.glb"); // Dosya yolu örneği
        loadedModel.scale.set(1, 3, 2);
        //loadedModel.scale.set(roofWidth / 10, roofHeight / 4, 1); //according tp roof heigh and with
        loadedModel.position.set(15, 15, 15);
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
    <>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <button
          onClick={handleSelectModeToggle}
          style={{
            position: "absolute", // Butonun üstte ve görünür olmasını sağlar
            zIndex: 100, // Canvas'ın üzerinde görünmesini sağlar
            top: "10px", // Sayfanın üstünden 10px aşağıda
            left: "10px", // Sayfanın solundan 10px içerde
          }}
        >
          Select Roof Area
        </button>
        <button
          onClick={() => {
            setSelectionStart(null);
            setSelectionEnd(null);
          }}
          style={{
            position: "absolute",
            zIndex: 100,
            top: "30px",
            left: "10px",
          }}
        >
          Clear Selection
        </button>
        <Canvas
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            color: "red",
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <CameraControlled />
          <Experience
            roofImage={roofImage}
            isSelecting={isSelecting}
            selection={selectionStart}
            selectionend={selectionEnd}
          />
          <OrbitControls enableRotate={false} />
          {model && <primitive object={model} rotation={[Math.PI / 2, 0, 0]} />}
        </Canvas>
      </div>
    </>
  );
}

export default SimulationTest;

// import React, { useRef, useState } from "react";
// import * as THREE from "three";

// function SimulationTest() {
//   const [mouseDown, setMouseDown] = useState(false);
//   const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
//   const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
//   const scene = useRef(null);
//   const renderer = useRef(null);

//   const init = () => {
//     // Scene oluşturma
//     const newScene = new THREE.Scene();
//     scene.current = newScene;

//     // Kamera oluşturma
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.z = 5;

//     // Renderer oluşturma
//     const newRenderer = new THREE.WebGLRenderer();
//     newRenderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.current = newRenderer;

//     // Mouse eventleri dinleme
//     document.addEventListener("mousedown", onDocumentMouseDown, false);
//     document.addEventListener("mousemove", onDocumentMouseMove, false);
//     document.addEventListener("mouseup", onDocumentMouseUp, false);

//     animate();
//   };

//   const animate = () => {
//     requestAnimationFrame(animate);
//     renderer.current.render(
//       scene.current,
//       console.log("children", scene.current)
//       //scene.current.children[0].children[0].children[0].camera
//     );
//   };

//   const onDocumentMouseDown = (event) => {
//     event.preventDefault();
//     setMouseDown(true);
//     setStartPoint({
//       x: (event.clientX / window.innerWidth) * 2 - 1,
//       y: -(event.clientY / window.innerHeight) * 2 + 1,
//     });

//     drawRectangle(startPoint, endPoint)
//   };

//   const onDocumentMouseMove = (event) => {
//     event.preventDefault();
//     if (mouseDown) {
//       setEndPoint({
//         x: (event.clientX / window.innerWidth) * 2 - 1,
//         y: -(event.clientY / window.innerHeight) * 2 + 1,
//       });
//     }
//   };

//   const onDocumentMouseUp = (event) => {
//     event.preventDefault();
//     setMouseDown(false);
//     setEndPoint({
//       x: (event.clientX / window.innerWidth) * 2 - 1,
//       y: -(event.clientY / window.innerHeight) * 2 + 1,
//     });
//   };

//   const drawRectangle = (start, end) => {
//     const width = Math.abs(start.x - end.x);
//     const height = Math.abs(start.y - end.y);
//     const geometry = new THREE.PlaneGeometry(width, height);
//     const material = new THREE.MeshBasicMaterial({
//       color: 0xff0000,
//       side: THREE.DoubleSide,
//     });
//     const rectangle = new THREE.Mesh(geometry, material);
//     rectangle.position.x = (start.x + end.x) / 2;
//     rectangle.position.y = (start.y + end.y) / 2;
//     scene.current.add(rectangle);

//     const squareSize = Math.min(width, height);
//     const squareGeometry = new THREE.PlaneGeometry(squareSize, squareSize);
//     const squareMaterial = new THREE.MeshBasicMaterial({
//       color: 0x00ff00,
//       side: THREE.DoubleSide,
//     });
//     const squares = [];
//     const rows = Math.floor(height / squareSize);
//     const cols = Math.floor(width / squareSize);
//     for (let i = 0; i < rows; i++) {
//       for (let j = 0; j < cols; j++) {
//         const square = new THREE.Mesh(squareGeometry, squareMaterial);
//         square.position.x =
//           rectangle.position.x - width / 2 + squareSize / 2 + j * squareSize;
//         square.position.y =
//           rectangle.position.y + height / 2 - squareSize / 2 - i * squareSize;
//         scene.current.add(square);
//         squares.push(square);
//       }
//     }
//   };

//   window.addEventListener("resize", () => {
//     scene.current.children[0].children[0].children[0].camera.aspect =
//       window.innerWidth / window.innerHeight;
//     scene.current.children[0].children[0].children[0].camera.updateProjectionMatrix();
//     renderer.current.setSize(window.innerWidth, window.innerHeight);
//   });

//   React.useEffect(() => {
//     init();
//   }, []);

//   return (
//     <div
//       ref={(ref) => (ref ? ref.appendChild(renderer.current.domElement) : null)}
//     />
//   );
// }
