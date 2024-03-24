import React from 'react';

const Map = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Burada gerçek bir Google Haritası entegrasyonu yapılabilir */}
      <iframe
        width="100%"
        height="100%"
        frameBorder="0" style={{border:0}}
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.998168487639!2d5.469722515807719!3d52.21319197975625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c7e674b1a3a6f9%3A0xf0c7b13d0ee5f7e!2sAmersfoort!5e0!3m2!1sen!2snl!4v1645623306901!5m2!1sen!2snl"
        allowFullScreen=""
        aria-hidden="false"
        tabIndex="0"
      ></iframe>
    </div>
  );
};

export default Map;
