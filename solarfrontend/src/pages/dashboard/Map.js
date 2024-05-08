import React, { useEffect, useRef, useState } from 'react';

const Map = ({ address, onCenterChange }) => {
  const [center, setCenter] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const initialCenter = results[0].geometry.location;
          setCenter(initialCenter);
          if (!mapRef.current) {
            mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
              center: initialCenter,
              zoom: 20,
              mapTypeId: window.google.maps.MapTypeId.SATELLITE
            });
  
            onCenterChange({ lat: initialCenter.lat(), lng: initialCenter.lng() });
  
            mapRef.current.addListener('dragend', () => {
              const newCenter = mapRef.current.getCenter();
              setCenter(newCenter);
              onCenterChange({ lat: newCenter.lat(), lng: newCenter.lng() });
            });
          }
        } else {
          console.error("Geocode başarısız oldu: " + status);
        }
      });
    };
  
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initMap = initMap;
    }
  }, [address, onCenterChange]);
  

  return <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }}></div>;
};

export default Map;

// import React, { useEffect, useRef, useState } from "react";

// const Map = ({ address, onCenterChange, onEdgesUpdate }) => {
//   const mapRef = useRef(null);
//   const mapContainerRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const [edgeLengths, setEdgeLengths] = useState([]);  

//   const loadGoogleMapsAPI = () => {
//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us&libraries=drawing,geometry`;
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
//     script.onload = initMap;
//   };

//   const initMap = () => {
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ address }, (results, status) => {
//       if (status === "OK" && results[0]) {
//         const initialCenter = results[0].geometry.location;
//         mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
//           center: initialCenter,
//           zoom: 20,
//           mapTypeId: window.google.maps.MapTypeId.SATELLITE,
//         });
//         setupDrawingManager();

//         mapRef.current.addListener('center_changed', () => {
//           const newCenter = mapRef.current.getCenter();
//           onCenterChange({ lat: newCenter.lat(), lng: newCenter.lng() });
//         });
//       } else {
//         console.error("Geocode failed: " + status);
//       }
//     });
//   };

//   const setupDrawingManager = () => {
//     const drawingManager = new window.google.maps.drawing.DrawingManager({
//       drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
//       drawingControl: true,
//       drawingControlOptions: {
//         position: window.google.maps.ControlPosition.TOP_CENTER,
//         drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
//       },
//       polygonOptions: {
//         fillColor: "#ffff00",
//         fillOpacity: 0.1,
//         strokeWeight: 2,
//         clickable: true,
//         editable: true,
//         zIndex: 1,
//       },
//     });

//     drawingManager.setMap(mapRef.current);
//     window.google.maps.event.addListener(
//       drawingManager,
//       "polygoncomplete",
//       (polygon) => {
//         const path = polygon.getPath();
//         const lengths = [];
//         for (let i = 0; i < path.getLength(); i++) {
//           const startPoint = path.getAt(i);
//           const endPoint = path.getAt((i + 1) % path.getLength());
//           const distance = window.google.maps.geometry.spherical.computeDistanceBetween(startPoint, endPoint);
//           lengths.push(distance);
//         }
//         onEdgesUpdate(lengths);
//         setEdgeLengths(lengths);
//         if (!infoWindowRef.current) {
//           infoWindowRef.current = new window.google.maps.InfoWindow();
//         }
//         const totalLength = lengths.reduce((a, b) => a + b, 0);
//         infoWindowRef.current.setContent(`Toplam Çevre Uzunluğu: ${totalLength.toFixed(2)} metre`);
//         infoWindowRef.current.setPosition(path.getAt(0));
//         infoWindowRef.current.open(mapRef.current);
//       }
//     );
//   };

//   useEffect(() => {
//     loadGoogleMapsAPI();
//   }, [address]);

//   useEffect(() => {
//     console.log("Kenar Uzunlukları:", edgeLengths);
//   }, [edgeLengths]);

//   return <div id="map-container" ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />;
// };

// export default Map;
