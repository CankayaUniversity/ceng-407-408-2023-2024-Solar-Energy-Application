import React, { useEffect } from "react";

const Map = ({ address, onLocationSelect }) => {
  useEffect(() => {
    // initMap fonksiyonunu window üzerinde tanımla
    window.initMap = function () {
      if (!window.google) {
        console.error("Google Maps yüklenemedi.");
        return;
      }
      // Geocoder'ı başlat
      const geocoder = new window.google.maps.Geocoder();
      if (address) {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === "OK") {
            const map = new window.google.maps.Map(document.getElementById('map'), {
              center: results[0].geometry.location,
              zoom: 20,
              mapTypeId: window.google.maps.MapTypeId.SATELLITE
            });

            window.google.maps.event.addListener(map, 'click', function(event) {
              onLocationSelect({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            });
          } else {
            alert("Geocode başarısız oldu: " + status);
          }
        });
      }
    };

    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        window.initMap(); // Eğer google maps objesi zaten varsa, doğrudan initMap'i çağır
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [address, onLocationSelect]);

  return <div id="map" style={{ height: "100%", width: "100%" }}></div>;
};

export default Map;
