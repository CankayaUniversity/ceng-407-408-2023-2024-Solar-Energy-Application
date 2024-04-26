import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

function createHatchTexture() {
  const canvas = document.createElement('canvas');
  const size = 128; // Doku boyutu
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d');
  
  // Arka planı saydam olarak bırak (yani hiçbir şey yapma)
  
  // Çizgileri çiz
  context.strokeStyle = 'rgba(0, 0, 0, 2)'; // Siyah çizgi rengi, yarı saydam
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
  }, [addPanelMode, camera, setPanelPosition, gl.domElement]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(roofImage, (texture) => {
      setRoofTexture(texture);
    });
  }, [roofImage]);

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
    // Eğer seçilen nokta yoksa veya sadece bir nokta varsa çizgi çizme
    if (selectedRoofPoints.length < 2) return;

    // Seçilen noktaları birleştiren çizgiyi oluştur
    pointsGeometry.setFromPoints(selectedRoofPoints);
    const line = new THREE.Line(pointsGeometry, lineMaterial);

    scene.add(line);

    // Cleanup function: Component unmount olduğunda çizgiyi sahneden kaldır
    return () => {
      scene.remove(line);
      pointsGeometry.dispose();
    };
  }, [selectedRoofPoints, scene]);

  return (
    <>
      {roofTexture && (
        <mesh ref={planeRef} position={[0, 0, 0]}>
          <planeGeometry
            args={[window.innerWidth / 1.5, window.innerHeight, 1, 1]}
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
    </>
  );
};
