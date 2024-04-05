import React, { useEffect } from "react";

const Map = ({ address }) => {
  useEffect(() => {
    window.initMap = function () {
      if (!window.google) {
        console.error("Google Maps yüklenemedi.");
        return;
      }
      // Geocoder'ı başlat
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
          const map = new window.google.maps.Map(
            document.getElementById("map"),
            {
              center: results[0].geometry.location,
              zoom: 20,
              mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            }
          );
          // new window.google.maps.Marker({
          //   map: map,
          //   position: results[0].geometry.location,
          // });
        } else {
          alert("Geocode başarısız oldu: " + status);
        }
      });
    };

    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        window.initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us&callback=initMap`; // YOUR_API_KEY kısmını gerçek API anahtarınızla değiştirin
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [address]);

  return <div id="map" style={{ height: "100%", width: "100%" }}></div>;
};

export default Map;
