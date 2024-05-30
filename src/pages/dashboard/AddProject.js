import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  AppBar,
  Tabs,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Map from "./Map";
import DrawIcon from "@mui/icons-material/Draw";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CUSTOMERS, PROJECT } from "./../../api/api";
import SimulationTest from "../homepage/SimulationTest";
import axios from "axios";

const MAP_WIDTH = 512;
const MAP_HEIGHT = 512;
const mapSize = [MAP_WIDTH, MAP_HEIGHT];

export default function AddProject() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    company_name: "",
    address: "",
    phone: ""
  });
  
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("1");
  const [mapAddress, setMapAddress] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [currentCenter, setCurrentCenter] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(20);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [formData, setFormData] = useState({});

  const onCenterChange = (center) => {
    setCurrentCenter(center);
  };

  const onZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const onMapClick = (latLng) => {
    setClickedLatLng(latLng);
  };

  const [addressExpanded, setAddressExpanded] = useState(true);
  const [projectData, setProjectData] = useState({
    name: "",
    consumption: "",
    consumption_period: "",
    projectscol: "",
    cosine_factor: "",
    export_limit: "",
    notes: "",
    customer_id: selectedCustomerId,
    consumption_profile: {
      date: "",
      energy_consumed: "",
      device_name: "",
    },
    address: {
      street: "",
      house_number: "",
      addition: "",
      postcode: "",
      city: "",
      country: "",
      suburb: "",
      town: "",
    },
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("consumption_profile.") || name.includes("address.")) {
      const [key, subKey] = name.split(".");
      setProjectData((prevState) => ({
        ...prevState,
        [key]: {
          ...prevState[key],
          [subKey]: value,
        },
      }));
    } else {
      setProjectData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    if (panel === "address") {
      if (isExpanded || validateAddressForm()) {
        setAddressExpanded(isExpanded);
      }
    } else {
      setExpanded(isExpanded ? panel : false);
    }
  };

  useEffect(() => {
    console.log("Seçilen müşteri ıd:", selectedCustomerId);
    const fetchCustomers = async () => {
      const [data, error] = await CUSTOMERS.getAll();
      if (data && data.length > 0) {
        console.log("data", data);
        setCustomers(data);
        setSelectedCustomerId(data[0]._id);
      } else {
        console.error("Müşteriler yüklenirken bir hata oluştu", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (selectedCustomerId) {
        const [data, error] = await CUSTOMERS.byId(selectedCustomerId);
        if (data) {
          setCustomerDetails({
            name: data.name || "Ad Bilinmiyor",
            email: data.email || "E-posta Bilinmiyor",
            company_name: data.company_name || "Company name bilinmiyor",
            address: data.address || "Adres bilinmiyor",
            phone: data.phone || "Telefon bilinmiyor",
          });
        } else {
          console.error("Müşteri detayları yüklenirken bir hata oluştu", error);
          setCustomerDetails({ name: "", email: "", company_name: "", address: "", phone: "" });
        }
      }
    };
    fetchCustomerDetails();
  }, [selectedCustomerId]);


  const handleCustomerChange = async (event) => {
    const newSelectedCustomerId = event.target.value;
    setSelectedCustomerId(newSelectedCustomerId);

    setProjectData((prevState) => ({
      ...prevState,
      customer_id: newSelectedCustomerId,
    }));

    const [data, error] = await CUSTOMERS.byId(newSelectedCustomerId);
    if (data) {
      setCustomerDetails({
        name: data.name || "Ad Bilinmiyor",
        email: data.email || "E-posta Bilinmiyor",
        company_name: data.company_name || "Company name bilinmiyor",
        address: data.address || "Adres bilinmiyor",
        phone: data.phone || "Telefon bilinmiyor",
      });
    } else {
      console.error("Müşteri detayları yüklenirken bir hata oluştu", error);
      setCustomerDetails({ name: "", email: "", company_name: "", address: "", phone: "" });
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    console.log(projectData);
    let response, error;
    [response, error] = await PROJECT.postProject(formData);
    if (response) {
        setSnackbarMessage("Project saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      //   setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
    } else {
        console.error("Proje oluşturulurken bir hata oluştu", error);
        setSnackbarMessage("Project not saved!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!projectData.consumption) errors.consumption = "Fill this area";
    if (!projectData.consumption_period)
      errors.consumption_period = "Fill this area";
    if (!projectData.projectscol) errors.projectscol = "Fill this area";
    if (!projectData.cosine_factor) errors.cosine_factor = "Fill this area";
    if (!projectData.export_limit) errors.export_limit = "Fill this area";
    if (!projectData.notes) errors.notes = "Fill this area";
    if (!projectData.consumption_profile.device_name)
      errors.device_name = "Fill this area";
    if (!projectData.consumption_profile.energy_consumed)
      errors.energy_consumed = "Fill this area";
    if (!projectData.consumption_profile.date) errors.date = "Fill this area";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (value === "1") {
      if (validateForm()) {
        setValue("2");
      }
    } else if (value === "3" && currentCenter) {
      const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${currentCenter.lat},${currentCenter.lng}&zoom=${currentZoom}&size=${mapSize[0]}x${mapSize[1]}&maptype=satellite&key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us`;
      setScreenshot(staticMapURL);
      setFormData((prevState) => ({
        ...prevState,
        solarPanel: {
          roofImage: staticMapURL,
          currentCenter,
          currentZoom,
          panelsToJSON: [], // başlangıçta boş panel dizisi
        },
      }));
      setValue("4");
    } else {
      setValue((prevValue) => String(Number(prevValue) + 1));
    }
    // Form verilerini topla ve formData'ya ekle
    setFormData((prevState) => ({
      ...prevState,
      ...projectData,
    }));
  };

  const handleFinish = async () => {
    console.log("finish formdata", formData);
    handleSubmit();
  };

  const handleCancel = () => {
    if (value > 1) {
      setValue((prevValue) => String(Number(prevValue) - 1));
    } else {
      console.log("İlk tab'dayız");
    }
  };

  const renderConfirmButton = () => {
    return value < 4 ? (
      <Button onClick={handleNext} variant="contained" color="primary">
        Next
      </Button>
    ) : (
      <Button onClick={handleFinish} variant="contained" color="primary">
        Finish
      </Button>
    );
  };

  const handleSavePhoto = () => {
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = "MapScreenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const latLngToPoint = (lat, lng, mapWidth, mapHeight, mapZoom) => {
    const siny = Math.sin((lat * Math.PI) / 180);
    const y = 0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI);
    const x = (lng + 180) / 360;
    const scale = 1 << mapZoom;

    return [
      Math.floor(mapWidth * x * scale),
      Math.floor(mapHeight * y * scale),
    ];
  };
  const pixelToLatLng = (x, y, mapCenter, zoom, mapSize) => {
    const scale = 1 << zoom; // 2 üzeri zoom
    console.log(
      "x",
      x,
      "y",
      y,
      "mapCenter",
      mapCenter[1],
      "zoom",
      zoom,
      "mapSize",
      mapSize[1]
    );
    console.log("scale", scale);
    // Longitude calculation
    const lng = mapCenter.lng + ((x - mapSize[0] / 2) / (256 * scale)) * 360;
    console.log(mapCenter.lng + ((x - mapSize[0] / 2) / (256 * scale)) * 360);
    // Latitude calculation
    const adjustedY =
      y -
      mapSize[1] / 2 +
      latLngToPoint(
        mapCenter.lat,
        mapCenter.lng,
        mapSize[0],
        mapSize[1],
        zoom
      )[1];
    const worldY = adjustedY / (scale * mapSize[1]);
    const n = Math.PI - 2 * Math.PI * worldY;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    console.log("lat", lat, "lng", lng);
    return [parseFloat(lat.toFixed(8)), parseFloat(lng.toFixed(8))];
  };

  // Your latLngToPoint function adapted for React

  const handleMapClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left; // x position within the element.
    const y = event.clientY - rect.top; // y position within the element.

    const latLng = pixelToLatLng(x, y, currentCenter, currentZoom, mapSize);
    console.log("latLng", latLng);
    setClickedLatLng({ lat: latLng[0], lng: latLng[1] });
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!projectData.address.street) errors.street = "Fill this area";
    if (!projectData.address.house_number)
      errors.house_number = "Fill this area";
    if (!projectData.address.postcode) errors.postcode = "Fill this area";
    if (!projectData.address.city) errors.city = "Fill this area";
    if (!projectData.address.country) errors.country = "Fill this area";
    if (!projectData.address.suburb) errors.suburb = "Fill this area";
    if (!projectData.address.town) errors.town = "Fill this area";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        position="static"
        color="default"
        sx={{ borderRadius: "50px", mx: "auto", maxWidth: "100%" }}
      >
        <Tabs
          value={value}
          // onChange={handleChange}
          centered
          variant="fullWidth"
          sx={{ ".MuiTabs-flexContainer": { justifyContent: "center" } }}
        >
          <Tab icon={<HomeIcon />} label="Project" value="1" />
          <Tab icon={<PersonAddIcon />} label="Customers" value="2" />
          <Tab icon={<MapIcon />} label="Maps" value="3" />
          <Tab icon={<DrawIcon />} label="Panels" value="4" />
        </Tabs>
      </AppBar>

      <TabContext value={value}>
        <TabPanel value="1">
          <Accordion
            expanded={true}
            onChange={handleAccordionChange("NETPARAMETERS")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">NET PARAMETERS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Project Name"
                    margin="normal"
                    value={projectData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="consumption"
                    label="Consumption"
                    margin="normal"
                    value={projectData.consumption}
                    onChange={handleInputChange}
                    error={!!formErrors.consumption}
                    helperText={formErrors.consumption}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="consumption_period"
                    label="Consumption Period"
                    margin="normal"
                    value={projectData.consumption_period}
                    onChange={handleInputChange}
                    error={!!formErrors.consumption_period}
                    helperText={formErrors.consumption_period}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="projectscol"
                    label="Projectscol"
                    margin="normal"
                    value={projectData.projectscol}
                    onChange={handleInputChange}
                    error={!!formErrors.projectscol}
                    helperText={formErrors.projectscol}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="cosine_factor"
                    label="Cosine Factor"
                    margin="normal"
                    value={projectData.cosine_factor}
                    onChange={handleInputChange}
                    error={!!formErrors.cosine_factor}
                    helperText={formErrors.cosine_factor}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="export_limit"
                    label="Export Limit"
                    margin="normal"
                    value={projectData.export_limit}
                    onChange={handleInputChange}
                    error={!!formErrors.export_limit}
                    helperText={formErrors.export_limit}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="notes"
                    label="Notes"
                    margin="normal"
                    value={projectData.notes}
                    onChange={handleInputChange}
                    error={!!formErrors.notes}
                    helperText={formErrors.notes}
                  />
                </Grid>
              </Grid>
              <FormControlLabel control={<Checkbox />} label="Export Limit" />
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={true}
            onChange={handleAccordionChange("projectDetails")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">PROJECT DETAILS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="consumption_profile.device_name"
                    label="Device Name"
                    margin="normal"
                    value={projectData.consumption_profile.device_name}
                    onChange={handleInputChange}
                    error={!!formErrors.device_name}
                    helperText={formErrors.device_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="consumption_profile.energy_consumed"
                    label="Energy Consumed"
                    margin="normal"
                    value={projectData.consumption_profile.energy_consumed}
                    onChange={handleInputChange}
                    error={!!formErrors.energy_consumed}
                    helperText={formErrors.energy_consumed}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    name="consumption_profile.date"
                    label="Date"
                    type="date"
                    value={projectData.consumption_profile.date}
                    onChange={handleInputChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!formErrors.date}
                    helperText={formErrors.date}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value="2">
          <Accordion
            expanded={true}
            onChange={handleAccordionChange("Customer")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Customer</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Customer
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedCustomerId}
                    label="Customer"
                    onChange={handleCustomerChange}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer._id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Company Name"
                  margin="normal"
                  value={customerDetails.company_name || ""}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                />

                <TextField
                  fullWidth
                  label="Email"
                  margin="normal"
                  value={customerDetails.email || ""}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value="3" sx={{ p: 2 }}>
          <Accordion
            expanded={addressExpanded}
            onChange={handleAccordionChange("address")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Address</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.suburb"
                    label="Suburb"
                    margin="normal"
                    value={projectData.address.suburb}
                    onChange={handleInputChange}
                    error={!!formErrors.suburb}
                    helperText={formErrors.suburb}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.street"
                    label="Street"
                    margin="normal"
                    value={projectData.address.street}
                    onChange={handleInputChange}
                    error={!!formErrors.street}
                    helperText={formErrors.street}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.house_number"
                    label="House Number"
                    margin="normal"
                    value={projectData.address.house_number}
                    onChange={handleInputChange}
                    error={!!formErrors.house_number}
                    helperText={formErrors.house_number}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.town"
                    label="Town"
                    margin="normal"
                    value={projectData.address.town}
                    onChange={handleInputChange}
                    error={!!formErrors.town}
                    helperText={formErrors.town}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.city"
                    label="City"
                    margin="normal"
                    value={projectData.address.city}
                    onChange={handleInputChange}
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.country"
                    label="Country"
                    margin="normal"
                    value={projectData.address.country}
                    onChange={handleInputChange}
                    error={!!formErrors.country}
                    helperText={formErrors.country}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.postcode"
                    label="Postcode"
                    margin="normal"
                    value={projectData.address.postcode}
                    onChange={handleInputChange}
                    error={!!formErrors.postcode}
                    helperText={formErrors.postcode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="address.addition"
                    label="Addition"
                    margin="normal"
                    value={projectData.address.addition}
                    onChange={handleInputChange}
                    error={!!formErrors.addition}
                    helperText={formErrors.addition}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (validateAddressForm()) {
                        const fullAddress = `${projectData.address.suburb},${projectData.address.street},${projectData.address.house_number}, ${projectData.address.postcode},${projectData.address.town}, ${projectData.address.city}`;
                        setMapAddress(fullAddress);
                        setAddressExpanded(false);
                      }
                    }}
                  >
                    Show Map
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <div style={{ width: "100%", height: "75vh" }}>
            <Map
              address={mapAddress}
              onCenterChange={onCenterChange}
              onZoomChange={onZoomChange}
              onMapClick={onMapClick}
            />
          </div>
          {/* {clickedLatLng && (
            <div>
              <p>Clicked Coordinates:</p>
              <p>Latitude: {clickedLatLng.lat}</p>
              <p>Longitude: {clickedLatLng.lng}</p>
            </div>
          )} */}
        </TabPanel>

        <TabPanel value="4">
          <SimulationTest
            screenshot={screenshot}
            currentCenter={currentCenter}
            currentZoom={currentZoom}
            formData={formData}
            setFormData={setFormData}
          />
          {screenshot && (
            <div>
              {/* <img
                src={screenshot}
                alt="Static Map"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                onClick={handleMapClick}
              />
              {clickedLatLng && (
                <div>
                  <p>Clicked Coordinates:</p>
                  <p>Latitude: {clickedLatLng.lat}</p>
                  <p>Longitude: {clickedLatLng.lng}</p>
                </div>
              )} */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePhoto}
              >
                Save Photo
              </Button>
            </div>
          )}
        </TabPanel>
      </TabContext>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          {renderConfirmButton()}
          <Button
            onClick={handleCancel}
            variant="contained"
            color="secondary"
            sx={{ ml: 2 }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          "& .MuiSnackbarContent-root": { fontSize: "1.2rem", width: "100%" },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
