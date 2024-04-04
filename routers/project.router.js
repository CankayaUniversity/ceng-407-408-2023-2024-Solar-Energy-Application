const express = require("express");
const Address = require("../Models/Address");
const Customer = require("../Models/Customer");
const Project = require("../Models/Project");
const router = express.Router();
const ConsumptionProfile = require("../Models/ConsumptionProfile");

router.post("/project/create-project", async (req, res) => {
  const projectData = req.body;
  
  try {
      // Adresten koordinatları al
      const coordinates = await getCoordinatesFromAddress(req.body.address);
      
      // Koordinatları adres bilgisine ekle
      const addressWithCoords = {
          ...req.body.address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
      };

      const address = new Address(addressWithCoords);
      await address.save();
      projectData.address_id = address._id;

      if (req.body.consumptionProfile) {
          const consumptionProfile = new ConsumptionProfile(req.body.consumptionProfile);
          await consumptionProfile.save();
          projectData.consumption_profiles_id = consumptionProfile._id;
      }

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


router.get("/project", async (req, res) => {
  try {
    const queryParams = req.quary
    console.log("projectquary",queryParams)
    const project = await Project.find(queryParams);
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/project/:id", async (req, res) => {
  const project = req.project;
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
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

    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
