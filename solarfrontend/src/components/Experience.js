import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

export const Experience = ({ roofImage, isSelecting, selection, selectionend }) => {
  const [roofTexture, setRoofTexture] = useState(null);
  const planeRef = useRef();
  const selectionMeshRef = useRef();
  // `scene` nesnesini de `useThree` hook'u aracılığıyla alıyoruz
  const { camera, gl, scene } = useThree();
  const [selectionStart, setSelectionStart] = useState(selection);
  const [selectionEnd, setSelectionEnd] = useState(selectionend);
  const isDragging = useRef(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(roofImage, (texture) => {
      setRoofTexture(texture);
    });
  }, [roofImage]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (!isSelecting) return;
      console.log("handleMosueDown");
      isDragging.current = true;

      // const { offsetX, offsetY } = event;
      // const x = (offsetX / gl.domElement.clientWidth) * 2 - 1;
      // const y = -(offsetY / gl.domElement.clientHeight) * 2 + 1;

      // setSelectionStart({ x, y });
      // setSelectionEnd(null); // Yeni seçim başladığında önceki bitişi temizle
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster kullanarak mouse pozisyonunu sahne koordinatlarına dönüştür
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
      // const { offsetX, offsetY } = event;
      // const x = (offsetX / gl.domElement.clientWidth) * 2 - 1;
      // const y = -(offsetY / gl.domElement.clientHeight) * 2 + 1;

      // setSelectionEnd({ x, y });
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

    // gl.domElement.addEventListener("mousedown", handleMouseDown);
    // gl.domElement.addEventListener("mouseup", handleMouseUp);
    // gl.domElement.addEventListener("mousemove", handleMouseMove);

    // return () => {
    //   gl.domElement.removeEventListener("mousedown", handleMouseDown);
    //   gl.domElement.removeEventListener("mouseup", handleMouseUp);
    //   gl.domElement.removeEventListener("mousemove", handleMouseMove);
    // };
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
      // Düzeltme: `scene.add(mesh)` burada kullanılıyor
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
