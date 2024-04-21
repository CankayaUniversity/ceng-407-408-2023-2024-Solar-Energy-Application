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
