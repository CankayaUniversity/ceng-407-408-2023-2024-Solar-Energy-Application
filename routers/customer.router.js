const express = require("express");
const Address = require("../Models/Address");
const Customer = require("../Models/Customer");
const User = require("../Models/User");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();
const axios = require('axios');
//DIGITURK MUSTERI MANTIĞIYLA ID BAĞLAMAYI YAP



router.post("/customers/create-customer", authenticateUser, async (req, res) => {
  console.log("reqqq", req.body);
  const customerData = req.body;
  try {
      const address = req.body.address;

      // Adresten koordinatları al
      const coordinates = await getCoordinatesFromAddress(address);
      console.log("coordinates", coordinates);

      // Koordinatları adres bilgisine ekle
      address.latitude = coordinates.latitude.toString();
      address.longitude = coordinates.longitude.toString();

      // Yeni adres nesnesi oluştur ve kaydet
      const newAddress = new Address(address);
      await newAddress.save();

      // customerData'ya adres ID'sini ve koordinatları ekle
      customerData.address_id = newAddress._id;
      customerData.latitude = coordinates.latitude;
      customerData.longitude = coordinates.longitude;

      // Mevcut kullanıcının şirket bilgisini al
      const currentUser = req.user;
      console.log("currr", currentUser);

      // Yeni müşteri verisine şirket bilgisini ekle
      customerData.company_id = currentUser.company_id;

      // Yeni müşteri nesnesi oluştur ve kaydet
      const customer = new Customer(customerData);
      await customer.save();
      res.status(201).send(customer);
  } catch (e) {
      console.error(e); // Hata loglaması
      res.status(400).send(e.message);
  }
});


// Adres bilgisinden koordinatları almak için yardımcı fonksiyon
async function getCoordinatesFromAddress(address) {
  let encodedAddress;
  if (typeof address === 'string') {
    encodedAddress = encodeURIComponent(address);
  } else if (typeof address === 'object') {
    // Eğer address bir nesne ise, nesneyi uygun bir şekilde stringe dönüştür
    // Örneğin, adresin street, city, country gibi özellikleri varsa, bunları kullanarak bir adres stringi oluşturabilirsiniz.
    encodedAddress = encodeURIComponent( address.house_number + ', ' + address.street + ', ' + address.suburb + ', ' + address.town + ', ' + address.postcode + ', ' + address.country );
  } else {
    throw new Error('Geçersiz adres formatı');
  }

  const apiKey = '660883944cfe3221313858wzhe0754b'; 
  // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
  const url =`https://geocode.maps.co/search?q=${encodedAddress}&api_key=${apiKey}`
  console.log("url",url);
  try {
    const response = await axios.get(url);
    console.log("ress",response.data[0].lat);
    const { lat,lon } = response.data[0];
    console.log("lat,lon",lat.length);
    if (lat.length > 0 && lon.length > 0) {
     
      console.log("lat ve lon amq",lat,lon);
      return { latitude: lat, longitude: lon};
    } else {
      
    }
  } catch (error) {
    throw new Error('Koordinatları alırken bir hata oluştu: ' + error.message);
  }
}

router.get("/customers", async (req, res) => {
  try {
    const queryParams = req.query
    console.log("asdsa",queryParams)
    const customers = await Customer.find(queryParams);
    if (!customers) {
      throw new Error("No customer found");
    }
    res.status(201).send(customers);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const customers = await Customer.findById(req.params.id);
    if (!customers) {
      throw new Error("No customer found");
    }
    res.status(201).send(customers);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/customers/:id", async (req, res) => {
  const customer = req.customer;
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) {
      throw new Error("No company found");
    }
    res.status(201).send(customer);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    const user = req.user;
    
    if (!customer) {
      throw new Error("No customer found");
    }
    if (user.company_id.toString() !== customer.company_id.toString()) {
      throw new Error("You are not authorized to delete this company");
    }
    res.status(201).send(customer);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
