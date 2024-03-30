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
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import PlaceIcon from "@mui/icons-material/Place";
import NoteIcon from "@mui/icons-material/Note";
import MapIcon from "@mui/icons-material/Map";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CUSTOMERS, PROJECT } from "./../../api/api";

export default function AddProject() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
  });
  const [expanded, setExpanded] = React.useState(false);
  const [value, setValue] = React.useState("1");

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

  // Drawer'ı kontrol etmek için fonksiyon
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // İkon listesi
  const icons = [<HomeIcon />, <InfoIcon />, <PlaceIcon />, <NoteIcon />];

  useEffect(() => {
    console.log("buaraya girdim");
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
    console.log("buaraya girdimm");
    const fetchCustomerDetails = async () => {
      if (selectedCustomerId) {
        const [data, error] = await CUSTOMERS.byId(selectedCustomerId);
        if (data) {
          setCustomerDetails({
            name: data.name || "Ad Bilinmiyor",
            email: data.email || "E-posta Bilinmiyor",
          });
        } else {
          console.error("Müşteri detayları yüklenirken bir hata oluştu", error);
          setCustomerDetails({ name: "", email: "" });
        }
      }
    };
    fetchCustomerDetails();
  }, [selectedCustomerId]);

  const handleCustomerChange = async (event) => {
    const newSelectedCustomerId = event.target.value;
    setSelectedCustomerId(newSelectedCustomerId);

    // customer_id'yi projectData içinde güncelle
    setProjectData((prevState) => ({
      ...prevState,
      customer_id: newSelectedCustomerId,
    }));

    // Müşteri detaylarını çek
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
      // Başarılı oluşturma sonrası işlemler
    } else {
      console.error("Proje oluşturulurken bir hata oluştu", error);
      // Hata yönetimi
    }
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
          <Tab icon={<PlaceIcon />} label="Location" value="2" />
          <Tab icon={<MapIcon />} label="Maps" value="3" />
          <Tab icon={<NoteIcon />} label="Panels" value="4" />
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
                    name="consumption_profile.date" // Bu alanın doğru olduğundan emin olun
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
                    name="address.addition"
                    label="Addition"
                    margin="normal"
                    value={projectData.address.addition}
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
              </Grid>
            </AccordionDetails>
          </Accordion>
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
                  label="Name"
                  margin="normal"
                  value={customerDetails.name || ""}
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

              {/* <Grid item xs={12} md={6}>
              </Grid> */}
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value="3" sx={{ p: 0 }}>
          <div style={{ width: "100%", height: "75vh" }}>
            <Map />
          </div>
        </TabPanel>

        <TabPanel value="4"></TabPanel>
      </TabContext>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Confirm
          </Button>
          <Button variant="contained" color="secondary" sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
