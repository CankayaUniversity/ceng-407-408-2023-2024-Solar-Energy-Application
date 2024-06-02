import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";
import { AddPanel } from "../components/AddPanel";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import axios from "axios";
import { setRedPixels } from "../pages/homepage/SimulationTest";

function Text({ text, position, size, color, rotation }) {
  const font = new FontLoader().parse(
    require("../fonts/helvetiker_regular.typeface.json")
  ); // Replace with your font file
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: size,
    depth: 0.1, // Adjust as needed
    curveSegments: 12,
    bevelEnabled: false,
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: color });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.copy(position);
  textMesh.rotation.z = rotation;
  textMesh.geometry.center(); // Metni ortalamak için

  return <primitive object={textMesh} />;
}

function createHatchTexture() {
  const canvas = document.createElement("canvas");
  const size = 512; // Doku boyutu
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  // Arka planı saydam olarak bırak (yani hiçbir şey yapma)

  // Çizgileri çiz
  context.strokeStyle = "rgba(0, 0, 0, 2)"; // Siyah çizgi rengi, yarı saydam
  context.lineWidth = 1; // Çizgi kalınlığı daha ince
  const step = 10; // Çizgiler arası mesafe
  for (let i = 0; i < size; i += step) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, size);
    context.stroke();

    // Diagonal çizgiler ekleyerek taralı görünümü zenginleştirebiliriz
    context.moveTo(0, i);
    context.lineTo(size, i);
    context.stroke();
  }

  // Canvas'tan bir doku oluştur
  return new THREE.CanvasTexture(canvas);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degree) => degree * (Math.PI / 180);

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1) ;
  const Δλ = toRadians(lon2 - lon1) ;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
}


export const Experience = ({
  roofImage,
  isSelecting,
  addPanelMode,
  setPanelPosition,
  onPanelPlace,
  roofSelectionActive,
  setSelectedRoofPoints,
  selectedRoofPoints,
  selectionStart,
  selectionEnd,
  setSelectionStart,
  setSelectionEnd,
  batchAddPanelMode,
  gridPositions,
  currentCenter,
  currentZoom,
  singleEditing,
}) => {
  const [roofTexture, setRoofTexture] = useState(null);
  const planeRef = useRef();
  const selectionMeshRef = useRef();
  const { camera, gl, scene } = useThree();

  const isDragging = useRef(false);
  const selectionBorderRef = useRef(); // Seçim sınırı için referans
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const pointsGeometry = new THREE.BufferGeometry();
  const hatchTexture = createHatchTexture();
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const MAP_WIDTH = 512;
  const MAP_HEIGHT = 512;
  const mapSize = [MAP_WIDTH, MAP_HEIGHT];
  const [clickPositions, setClickPositions] = useState([]);
  const [textPositions, setTextPositions] = useState([]);

  useEffect(() => {
    if (clickPositions.length < 2) return;
    if (roofSelectionActive) {
      const [firstClick, secondClick] = clickPositions.slice(-2);
      const distance = calculateDistance(
        firstClick.lat,
        firstClick.lng,
        secondClick.lat,
        secondClick.lng
      );

      console.log("Mesafe:", distance.toFixed(2), "m");

      // Calculate the midpoint
      // const midPoint = new THREE.Vector3(
      //   (firstClick.x + secondClick.x) / 2,
      //   (firstClick.y + secondClick.y) / 2,
      //   (firstClick.z + secondClick.z) / 2
      // );

      // Calculate rotation
      // const angle = Math.atan2(
      //   secondClick.y - firstClick.y,
      //   secondClick.x - firstClick.x
      // );

      // Correct the angle for text rotation
      // const correctedAngle = -angle;
      console.log("distance", distance);
      // // Add the distance text to the text positions array
      // setTextPositions((prevTextPositions) => [
      //   ...prevTextPositions,
      //   {
      //     position: midPoint,
      //     text: `${distance.toFixed(2)} m`,
      //     rotation: correctedAngle,
      //   },
      // ]);
    }
  }, [clickPositions]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!addPanelMode) return;

      // Fare konumunu hesaplama
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const { x, y, z } = intersects[0].point;
        setPanelPosition(new THREE.Vector3(x, y, z)); // Panelin konumunu güncelle
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [addPanelMode, camera, setPanelPosition, gl.domElement, singleEditing]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!singleEditing) return;

      // Fare konumunu hesaplama
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const { x, y, z } = intersects[0].point;
        setPanelPosition(new THREE.Vector3(x, y, z)); // Panelin konumunu güncelle
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [singleEditing, camera, setPanelPosition, gl.domElement, singleEditing]);

  const [isLoading, setIsLoading] = useState(true);

  const processRoofImage = async (url) => {
    try {
      console.log("url", url);
      const response = await axios.post(
        "http://localhost:5000/ml",
        { staticmapurl: url },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const processedImage = response.data;
      return processedImage;
    } catch (error) {
      console.error("Error processing image:", error);
      return null;
    }
  };

  // useEffect(() => {
  //   const loadAndProcessImage = async () => {
  //     if (roofImage) {
  //       const processedImageUrl = await processRoofImage(roofImage);
  //       console.log("processedImageUrl", processedImageUrl.path)
  //       if (processedImageUrl) {
  //         const loader = new THREE.TextureLoader();
  //         loader.load(roofImage, (texture) => {
  //           setRoofTexture(texture);
  //           setIsLoading(false);
  //         });
  //       }
  //     } else {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadAndProcessImage();
  // }, [roofImage]);

  useEffect(() => {
    const processImage = async () => {
      // if (true) { //test
        if (roofImage) { //original
        // roofImage = "staticmap.png"; //test
       const processedImageUrl = await processRoofImage(roofImage); //orijinal
        console.log("processedImageUrl", processedImageUrl.path); //orijinal
        const masked = processedImageUrl.path; //orijinal
        // const masked = "staticmapmask.png"; //test
        if (masked) {
          const loader = new THREE.TextureLoader();
          loader.load(roofImage, (texture) => {
            loader.load(masked, (maskTexture) => {
              const applyMask = () => {
                const maskCanvas = document.createElement("canvas");
                maskCanvas.width = maskTexture.image.width;
                maskCanvas.height = maskTexture.image.height;
                const maskCtx = maskCanvas.getContext("2d");
                maskCtx.drawImage(maskTexture.image, 0, 0);
                const maskData = maskCtx.getImageData(
                  0,
                  0,
                  maskCanvas.width,
                  maskCanvas.height
                );
                const canvas = document.createElement("canvas");
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(texture.image, 0, 0);
                const imageData = ctx.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                const data = imageData.data;
                const maskDataPixels = maskData.data;
                function getScreenScale() {
                  // Canvas ve ekran boyutları arasındaki ölçek oranını hesapla
                  const scaleX = window.innerWidth / canvas.width;
                  const scaleY = window.innerHeight / canvas.height;
                  
                  // En büyük ölçek değerini kullan
                  return Math.max(scaleX, scaleY);
                }
                
                const screenScale = getScreenScale(); // Ekran ölçeğini hesapla
                const lastScale = 0.4800750117*screenScale; 
                console.log("screenScale", screenScale); 

                let redPixels = []; // Kırmızı piksellerin koordinatlarını tutmak için dizi
                for (let i = 0; i < data.length; i += 4) {
                  if (
                    !(
                      maskDataPixels[i] === 0 &&
                      maskDataPixels[i + 1] === 0 &&
                      maskDataPixels[i + 2] === 128
                    )
                  ) {
                    data[i] = 255; // Red
                    data[i + 1] = 0; // Green
                    data[i + 2] = 0; // Blue

                    // Kırmızı piksellerin koordinatlarını kaydet
                    // Kırmızı piksellerin koordinatlarını kaydet
                    const x = (i / 4) % maskTexture.image.width;
                    const y = Math.floor(i / 4 / maskTexture.image.width);
                    //burada %125 ise ekran ölçeği 1.6 ile çarpılmalı
                    //çünkü 125*1.6=200
                    //eğer ekran ölçeği %100 ise 2 ile çarpılmalı çünkü 100*2=200
                    const worldX =
                      lastScale *
                      ((x / canvas.width) * texture.image.width -
                        texture.image.width / 2);
                    const worldY =
                    lastScale *
                      ((y / canvas.height) * texture.image.height -
                        texture.image.height / 2);
                    redPixels.push(new THREE.Vector3(worldX, -worldY, 0));
                  }
                }

                // Kırmızı pikselleri kaydet
                setRedPixels(redPixels);

                ctx.putImageData(imageData, 0, 0);
                const finalTexture = new THREE.CanvasTexture(canvas);
                setRoofTexture(finalTexture);
              };

              if (maskTexture.image.complete) {
                applyMask();
              } else {
                maskTexture.image.onload = applyMask;
              }
              setIsLoading(false);
            });
          });
        } else {
          setIsLoading(false);
        }
      }
    };

    processImage();
  }, [roofImage]);

  const [newSelectedPoints, setNewSelectedPoints] = useState([]);
  const [allLines, setAllLines] = useState([]);

  useEffect(() => {
    if (!roofSelectionActive) {
      if (newSelectedPoints.length > 0) {
        setAllLines((prevLines) => [...prevLines, [...newSelectedPoints]]);
        setNewSelectedPoints([]);
      }
      return;
    }

    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        setNewSelectedPoints((prevPoints) => [...prevPoints, point]);
        setSelectedRoofPoints((prevPoints) => [...prevPoints, point]);
        onPanelPlace(intersect.point);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [
    roofSelectionActive,
    camera,
    gl.domElement,
    onPanelPlace,
    setSelectedRoofPoints,
    newSelectedPoints,
  ]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!addPanelMode) return; // Sadece panel ekleme modu aktifken işlem yap

      // Fare konumunu hesaplama
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster kullanarak tıklanan noktayı bulma
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
      const intersects = raycaster.intersectObject(planeRef.current, true);

      if (intersects.length > 0 && addPanelMode) {
        const intersect = intersects[0];
        onPanelPlace(intersect.point);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [addPanelMode, camera, gl.domElement, setPanelPosition]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!singleEditing) return; // Sadece panel ekleme modu aktifken işlem yap

      // Fare konumunu hesaplama
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster kullanarak tıklanan noktayı bulma
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
      const intersects = raycaster.intersectObject(planeRef.current, true);

      console.log("exper");

      if (intersects.length > 0 && singleEditing) {
        const intersect = intersects[0];
        onPanelPlace(intersect.point);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [singleEditing, camera, gl.domElement, setPanelPosition]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (!isSelecting) return;
      isDragging.current = true;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const { x, y, z } = intersects[0].point;
        setSelectionStart({ x, y, z });
        setSelectionEnd(null);
      }
    };

    const handleMouseUp = (event) => {
      isDragging.current = false;

      if (!isSelecting || !selectionStart) return;
    };

    const handleMouseMove = (event) => {
      if (!isSelecting || !isDragging.current || !selectionStart) return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const { x, y, z } = intersects[0].point;
        setSelectionEnd({ x, y, z });
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, gl.domElement, selectionStart, camera]);

  useFrame(() => {
    if (!selectionStart || !selectionEnd || !isDragging.current) {
      if (selectionMeshRef.current) {
        selectionMeshRef.current.visible = false;
      }
      return;
    }

    if (!selectionMeshRef.current) {
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: "rgba(0, 255, 0, 0.5)",
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new Mesh(geometry, material);
      selectionMeshRef.current = mesh;
      scene.add(mesh);
    }

    const mesh = selectionMeshRef.current;
    mesh.visible = true;

    mesh.position.x = (selectionStart.x + selectionEnd.x) / 2;
    mesh.position.y = (selectionStart.y + selectionEnd.y) / 2;
    mesh.scale.x = Math.abs(selectionEnd.x - selectionStart.x);
    mesh.scale.y = Math.abs(selectionEnd.y - selectionStart.y);
  });

  const renderPanelPreviews = () => {
    if (!batchAddPanelMode || gridPositions.length === 0) return null;

    // return gridPositions.map((position, index) => (
    //   <AddPanel
    //     key={index}
    //     position={position}
    //     isVisible={true} /* other props */
    //   />
    // ));
  };

  const latLngToPoint = (lat, lng, mapWidth, mapHeight, mapZoom) => {
    const siny = Math.sin((lat * Math.PI) / 180);
    const y = 0.5 - (Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));
    const x = (lng + 180) / 360;
    const scale = 1 << mapZoom;

    return [
      Math.floor(mapWidth * x * scale),
      Math.floor(mapHeight * y * scale),
    ];
  };

  const pixelToLatLng = (x, y, mapCenter, zoom, mapSize) => {
    const scale = 1 << zoom; // 2 üzeri zoom
    console.log(
      "x",
      x,
      "y",
      y,
      "mapCenter",
      mapCenter[1],
      "zoom",
      zoom,
      "mapSize",
      mapSize[1]
    );
    console.log("scale", scale);
    // Longitude calculation
    const lng = mapCenter.lng + ((x - mapSize[0] / 2) / (256 * scale)) * 360;
    console.log(mapCenter.lng + ((x - mapSize[0] / 2) / (256 * scale)) * 360);
    // Latitude calculation
    const adjustedY =
      y -
      mapSize[1] / 2 +
      latLngToPoint(
        mapCenter.lat,
        mapCenter.lng,
        mapSize[0],
        mapSize[1],
        zoom
      )[1];
    const worldY = adjustedY / (scale * mapSize[1]);
    const n = Math.PI - 2 * Math.PI * worldY;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    console.log("lat", lat, "lng", lng);
    return [parseFloat(lat.toFixed(8)), parseFloat(lng.toFixed(8))];
  };

  // Your latLngToPoint function adapted for React

  const handleMapClick = (event) => {
    //burası tıklanılan yerin metresini ölçüyor. test için kapatıldı açılacak
    const rect = gl.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // x position within the element.
    const y = event.clientY - rect.top; // y position within the element.
    const latLng = pixelToLatLng(x, y, currentCenter, currentZoom, mapSize);
    console.log("latLng", latLng);
    setClickedLatLng({ lat: latLng[0], lng: latLng[1] });
    // Convert clicked pixel position to 3D world position
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeRef.current);
    if (intersects.length > 0) {
      const intersect = intersects[0].point;
      setClickPositions(prevPositions => {
        const newPositions = [...prevPositions, { lat: latLng[0], lng: latLng[1], ...intersect }];
        return newPositions.length > 2 ? newPositions.slice(-2) : newPositions;
      });
    }
  };

  useEffect(() => {
    const handleClick = (event) => {
      handleMapClick(event);
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [currentCenter, currentZoom, mapSize]);

  useEffect(() => {
    if (!roofSelectionActive) return;

    const handleClick = (event) => {
      // Tıklama pozisyonunu hesapla
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster ile çatı üzerindeki noktayı bul
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        // Seçilen noktaları güncelle
        setSelectedRoofPoints((prevPoints) => [...prevPoints, point]);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [roofSelectionActive, setSelectedRoofPoints, camera, gl.domElement]);

  // Seçilen noktaları birleştiren çizgiyi oluştur
  useEffect(() => {
    const linesToDraw = [...allLines, newSelectedPoints];
    setTextPositions([]); // İlk olarak textPositions'ı temizle
    linesToDraw.forEach((points) => {
      if (points.length < 2) return;

      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(pointsGeometry, lineMaterial);
      scene.add(line);

      // Add distance text for each segment
      //açılacak
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // Pixel coordinates to latitude and longitude
        const p1LatLng = pixelToLatLng(p1.x, p1.y, currentCenter, currentZoom, mapSize);
        const p2LatLng = pixelToLatLng(p2.x, p2.y, currentCenter, currentZoom, mapSize);

         // Calculate distance
        const distance = calculateDistance(p1LatLng[0], p1LatLng[1], p2LatLng[0], p2LatLng[1]).toFixed(2) + " m";

        const midPoint = new THREE.Vector3(
          (p1.x + p2.x) / 2,
          (p1.y + p2.y) / 2,
          (p1.z + p2.z) / 2
        );

        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        // Set the text position only if it's on the line
        setTextPositions(prevTextPositions => [
          ...prevTextPositions,
          { position: midPoint, text: distance, rotation: angle },
        ]);
      }

      // Cleanup function: Component unmount olduğunda çizgiyi sahneden kaldır
      return () => {
        scene.remove(line);
        pointsGeometry.dispose();
      };
    });
  }, [newSelectedPoints, allLines, scene]);

  return (
    <>
      {renderPanelPreviews()}
      {isLoading && (
        <mesh position={[0, 0, 0]}>
          <Text text="Loading..." position={[0, 0, 0]} size={1} color="black" />
        </mesh>
      )}
      {!isLoading && roofTexture && (
        <mesh ref={planeRef} position={[0, 0, 0]}>
          <planeGeometry
            args={[window.innerWidth / 2, window.innerHeight, 1, 1]}
          />
          <meshBasicMaterial map={roofTexture} />
        </mesh>
      )}
      {selectionStart && selectionEnd && (
        <mesh
          position={[
            (selectionStart.x + selectionEnd.x) / 2,
            (selectionStart.y + selectionEnd.y) / 2,
            0,
          ]}
          scale={[
            Math.abs(selectionEnd.x - selectionStart.x),
            Math.abs(selectionEnd.y - selectionStart.y),
            1,
          ]}
          visible={true}
        >
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshBasicMaterial
            map={hatchTexture} // Taralı doku burada kullanılır
            side={THREE.DoubleSide}
            transparent={true}
          />
        </mesh>
      )}

      {textPositions.map((textPos, index) => (
        <Text
          key={index}
          text={textPos.text}
          position={textPos.position}
          size={15}
          color="black"
          rotation={textPos.rotation}
        />
      ))}
    </>
  );
};
