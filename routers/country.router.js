const express = require("express");
const router = express.Router();
const Country = require("../Models/Country");
const authenticateUser = require("../middleware/authenticateUser");
const countryData = require('../countrydata'); // countryData modülünü import edin

router.post("/countries", async (req, res) => {
    try {
        const countries = countryData.getData(); // Tüm ülkelerin listesini al
        await Country.insertMany(countries); // Tüm ülkeleri MongoDB'ye kaydet
        res.status(201).send("Tüm ülkeler başarıyla kaydedildi");
    } catch (error) {
        console.error(error); // Hata konsola yazdırılıyor
        res.status(500).send("Sunucu hatası: " + error.message); // Hata iletisi istemciye gönderiliyor
    }
});


router.get("/countries", async(req, res) => {
    //query eklemek gerekebilir bi bak
    try {
        const countries = await Country.find({})
        if(!countries){
            throw new Error("No countries found");
        }
        res.status(201).send(countries);
    }
    catch (e){
        res.status(500).send(e.message);
    }
});

router.get("/countries/:id", async (req, res) => {
    try {
        const countries = await Country.find(req.params.id);
    if(!countries){
        throw new Error("No countries found");
    }
    res.status(201).send(countries);
    } catch (e) {
        res.status(500).send(e.message);

    }
});

router.patch("/countries/:id", async (req,res) => {

});
// şimdilik herkes silme işlemi yapabilir roller ayarlanacak
router.delete("/countries/:id", async (req, res) => {
   try{
    const countries = await Country.findByIdAndDelete(req.params.id);
    if(!countries){
        throw new Error("No countries found");
    }
    res.status(201).send(countries);
   }catch (e) {
    res.status(500).send(e.message);

}
});
    
module.exports = router;
