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

export default function AddProject() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
  });
  const [expanded, setExpanded] = React.useState(false);
  const [value, setValue] = React.useState("1");
  const [mapAddress, setMapAddress] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentCenter, setCurrentCenter] = useState(null);
  // const [edgeLengths, setEdgeLengths] = useState([]);

  // const handleLocationSelect = (location) => {
  //   if (location && location.lat && location.lng) {
  //     setSelectedLocation(location);
  //     const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=20&size=1200x1200&maptype=satellite&key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us`;
  //     setScreenshot(staticMapURL);
  //   } else {
  //     console.error("Geçerli bir konum sağlanmadı");
  //   }
  // };

  const onCenterChange = (center) => {
    setCurrentCenter(center);
  };

  // const takeStaticMapScreenshot = () => {
  //   const addressForAPI = `${projectData.address.suburb},${projectData.address.street},${projectData.address.house_number}, ${projectData.address.postcode},${projectData.address.town}, ${projectData.address.city}`;
  //   const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
  //     addressForAPI
  //   )}&zoom=20&size=1200x1200&maptype=satellite&key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us`;
  //   setScreenshot(staticMapURL);
  // };

  const [projectData, setProjectData] = useState({
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
    setExpanded(isExpanded ? panel : false);
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
          });
        } else {
          console.error("Müşteri detayları yüklenirken bir hata oluştu", error);
          setCustomerDetails({ name: "", email: "" });
        }
      }
    };
    fetchCustomerDetails();
  }, [selectedCustomerId]);

  // useEffect(() => {
  //   console.log("Güncel Kenar Uzunlukları:", edgeLengths);
  // }, [edgeLengths]);

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
      });
    } else {
      console.error("Müşteri detayları yüklenirken bir hata oluştu", error);
      setCustomerDetails({ name: "", email: "" });
    }
  };

  const handleSubmit = async () => {
    console.log(projectData);
    const [data, error] = await PROJECT.postProject(projectData);
    if (data) {
      console.log("Proje başarıyla oluşturuldu:", data);
    } else {
      console.error("Proje oluşturulurken bir hata oluştu", error);
    }
  };

  const handleNext = () => {
    if (value === "3" && currentCenter) {
      const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${currentCenter.lat},${currentCenter.lng}&zoom=20&size=1200x1200&maptype=satellite&key=AIzaSyCbE_AjQyCkjKY8KYNyGJbz2Jy9uEhO9us`;
      setScreenshot(staticMapURL);
    }
    if (value < 4) {
      setValue((prevValue) => String(Number(prevValue) + 1));
    } else {
      console.log("Son tab'dayız, bu kısım çalışmamalı.");
    }
  };

  const handleFinish = async () => {
    handleSubmit();
  };

  const handleCancel = () => {
    if (value > 1) {
      setValue((prevValue) => String(Number(prevValue) - 1));
    } else {
      console.log("İlk tab'dayız, daha fazla geri gidemeyiz.");
    }
  };

  const renderConfirmButton = () => {
    return value < 4 ? (
      <Button onClick={handleNext} variant="contained" color="primary">
        Confirm
      </Button>
    ) : (
      <Button onClick={handleFinish} variant="contained" color="primary">
        Finish
      </Button>
    );
  };

  const handleSavePhoto = () => {
    const link = document.createElement("a");
    link.href = screenshot; // Screenshot'ın URL'si
    link.download = "MapScreenshot.png"; // Kaydedilecek dosya adı
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onChange={handleChange}
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
            expanded={expanded === "NETPARAMETERS"}
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
                    name="consumption"
                    label="Consumption"
                    margin="normal"
                    value={projectData.consumption}
                    onChange={handleInputChange}
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
                  />
                </Grid>
                {/* <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Electricity Net</InputLabel>
                    <Select label="Electricity Net">
                      <MenuItem value="230V">230V L-N</MenuItem>
                    </Select>
                  </FormControl>
                </Grid> */}
              </Grid>
              <FormControlLabel control={<Checkbox />} label="Export Limit" />
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "projectDetails"}
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
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value="2">
          <Accordion
            expanded={expanded === "Customer"}
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
            expanded={expanded === "address"}
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const fullAddress = `${projectData.address.suburb},${projectData.address.street},${projectData.address.house_number}, ${projectData.address.postcode},${projectData.address.town}, ${projectData.address.city}`;
                      setMapAddress(fullAddress);
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
              // onEdgesUpdate={setEdgeLengths}
            />
          </div>
        </TabPanel>

        <TabPanel value="4">
          <SimulationTest screenshot={screenshot} />
          {screenshot && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSavePhoto}
            >
              Save Photo
            </Button>
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
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
