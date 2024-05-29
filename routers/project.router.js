const express = require("express");
const Address = require("../Models/Address");
const Customer = require("../Models/Customer");
const Project = require("../Models/Project");
const SolarPanel = require("../Models/SolarPanel"); // SolarPanel modelini ekleyin
const router = express.Router();
const ConsumptionProfile = require("../Models/ConsumptionProfile");
const authenticateUser = require("../middleware/authenticateUser");
const axios = require('axios');


router.post("/project/create-project",authenticateUser, async (req, res) => {
  const projectData = req.body;
  
  try {
      // Adresten koordinatları al
      //const coordinates = await getCoordinatesFromAddress(req.body.address);
      
      // Koordinatları adres bilgisine ekle
      const addressWithCoords = {
          ...req.body.address,
          latitude: req.body.solarPanel.currentCenter.lat,
          longitude: req.body.solarPanel.currentCenter.lng
      };

      const address = new Address(addressWithCoords);
      await address.save();
      projectData.address_id = address._id;

      if (req.body.consumptionProfile) {
          const consumptionProfile = new ConsumptionProfile(req.body.consumptionProfile);
          await consumptionProfile.save();
          projectData.consumption_profiles_id = consumptionProfile._id;
      }

      const solarPanelData = req.body.solarPanel;
        // panelsToJSON verisini doğru formatta alıp almadığınızı kontrol edin
    if (!Array.isArray(solarPanelData.panelsToJSON)) {
      throw new Error("panelsToJSON should be an array");
    }

    // panelsToJSON verilerini doğru formatta saklayın
    solarPanelData.panelsToJSON = solarPanelData.panelsToJSON.map(panel => ({
      data: panel
    }));
      // Solar Panel oluştur
      const solarPanel = new SolarPanel(solarPanelData);
      await solarPanel.save();
      projectData.solarpanel_id = solarPanel._id; // Solar Panel ID'sini proje verisine ekleyin
      projectData.user_id = req.user._id
      const project = new Project(projectData);
      await project.save();
      res.status(201).send(project);
  } catch (e) {
      res.status(400).send(e.message);
  }
});

async function getCoordinatesFromAddress(address) {
  let encodedAddress;
  if (typeof address === 'string') {
    encodedAddress = encodeURIComponent(address);
  } else if (typeof address === 'object') {
    // Eğer address bir nesne ise, nesneyi uygun bir şekilde stringe dönüştür
    // Örneğin, adresin street, city, country gibi özellikleri varsa, bunları kullanarak bir adres stringi oluşturabilirsiniz.
    encodedAddress = encodeURIComponent( address.house_number + ', ' + address.street + ', ' + address.suburb + ', ' + address.town + ', ' + address.postcode + ', ' + address.city + ', ' + address.country );
  } else {
    throw new Error('Geçersiz adres formatı');
  }

  const apiKey = 'AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us'; 
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


router.get("/project",authenticateUser, async (req, res) => {
  try {
    const queryParams = req.user._id;
    console.log("projectquery", queryParams);
    const project = await Project.find(queryParams).populate('solarpanel_id'); // SolarPanel verisini dahil edin
    if (!project) {
      throw new Error("No project found");
    }
    res.status(200).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('solarpanel_id'); // SolarPanel verisini dahil edin
    if (!project) {
      throw new Error("No project found");
    }
    res.status(200).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/project/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!project) {
      throw new Error("No project found");
    }

    // Solar Panel güncellemesi varsa
    if (req.body.solarPanel) {
      await SolarPanel.findByIdAndUpdate(project.solarpanel_id, req.body.solarPanel, {
        new: true,
      });
    }

    res.status(200).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/project/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      throw new Error("No project found");
    }

    // İlgili Solar Panel kaydını da silin
    await SolarPanel.findByIdAndDelete(project.solarpanel_id);

    res.status(200).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
