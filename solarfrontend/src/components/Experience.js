import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

export const Experience = ({
  roofImage,
  isSelecting,
  addPanelMode,
  setPanelPosition,
  onPanelPlace
}) => {
  const [roofTexture, setRoofTexture] = useState(null);
  const planeRef = useRef();
  const selectionMeshRef = useRef();
  const { camera, gl, scene } = useThree();
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const isDragging = useRef(false);
  const selectionBorderRef = useRef(); // Seçim sınırı için referans

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

      if (intersects.length > 0) {
        const intersect = intersects[0];
        setPanelPosition(intersect.point); // Tıklanan noktanın pozisyonunu kaydet
      }

      if(addPanelMode){
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
      console.log("handleMosueDown");
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
      console.log("handleMosueUp");
      console.log("selectionstart", selectionStart);
      console.log("selectionend", selectionEnd);
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
            0, // Z ekseninde bir değer, burada örnek olarak 0 verilmiştir
          ]}
          scale={[
            Math.abs(selectionEnd.x - selectionStart.x),
            Math.abs(selectionEnd.y - selectionStart.y),
            1, // Z ekseninde ölçeklendirme, burada örnek olarak 1 verilmiştir
          ]}
          visible={true} // Bu mesh'in her zaman görünür olmasını sağlayın
        >
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshBasicMaterial
            color="rgba(0, 255, 0, 0.5)"
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      )}
    </>
  );
};
