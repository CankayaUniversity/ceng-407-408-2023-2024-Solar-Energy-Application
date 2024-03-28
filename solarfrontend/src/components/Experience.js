import React, { useState, useEffect } from "react";
import { TextureLoader } from "three";
import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

export const Experience = ({ roofImage }) => {
  const [roofTexture, setRoofTexture] = useState(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(roofImage, (texture) => {
      setRoofTexture(texture);
      setTextureLoaded(true);
    });
  }, [roofImage]);

  return (
    <>
      {textureLoaded && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry
            args={[window.innerWidth / 1.5, window.innerHeight, 1, 1]}
          />
          <meshBasicMaterial map={roofTexture} />
        </mesh>
      )}
    </>
  );
};
