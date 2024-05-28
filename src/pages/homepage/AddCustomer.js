import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Stack, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { CUSTOMERS, ADDRESS } from "../../api/api";

export default function AddCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [addresId, setAddressId] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    company_name: "",
    address: {
      street: "",
      houseNumber: "",
      country: "",
      city: "",
      postCode: "",
      addition: "",
      suburb: "",
      town: "",
    },
    vat_number: "",
    vat_office: "",
    phone: "",
    mobile: "",
    notes: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    const fetchCustomerAndAddressData = async () => {
      if (customerId && customerId !== "undefined") {
        const [customerResponse, customerError] = await CUSTOMERS.byId(
          customerId
        );
        if (customerError) {
          console.error(
            "Müşteri bilgisi yüklenirken hata oluştu:",
            customerError
          );
          return;
        }
        setAddressId(customerResponse.address_id);
        const [addressResponse, addressError] = await ADDRESS.byId(
          customerResponse.address_id
        );
        if (addressError) {
          console.error("Adres bilgisi yüklenirken hata oluştu:", addressError);
          return;
        }

        setCustomer({
          name: customerResponse.name || "",
          email: customerResponse.email || "",
          company_name: customerResponse.company_name || "",
          address: {
            street: addressResponse.street || "",
            houseNumber: addressResponse.house_number || "",
            suburb: addressResponse.suburb || "",
            town: addressResponse.town || "",
            country: addressResponse.country || "",
            city: addressResponse.city || "",
            postCode: addressResponse.postcode || "",
            addition: addressResponse.addition || "",
          },
          vat_number: customerResponse.vat_number || "",
          vat_office: customerResponse.vat_office || "",
          phone: customerResponse.phone || "",
          mobile: customerResponse.mobile || "",
          notes: customerResponse.notes || "",
        });
        
      }
    };

    fetchCustomerAndAddressData();
  }, [customerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prevState) => {
      const addressFields = [
        "street",
        "houseNumber",
        "country",
        "city",
        "postCode",
        "addition",
        "suburb",
        "town",
      ];

      const newState = { ...prevState };

      if (addressFields.includes(name)) {
        newState.address = { ...prevState.address, [name]: value };
      } else {
        newState[name] = value;
      }
      return newState;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const customerData = {
      name: customer.name,
      company_name: customer.company_name,
      email: customer.email,
      address: customer.address
        ? {
            street: customer.address.street,
            house_number: customer.address.houseNumber,
            addition: customer.address.addition,
            postcode: customer.address.postCode,
            city: customer.address.city,
            country: customer.address.country,
            suburb: customer.address.suburb,
            town: customer.address.town,
          }
        : {}, 
      vat_number: customer.vat_number,
      vat_office: customer.vat_office,
      phone: customer.phone,
      mobile: customer.mobile,
      notes: customer.notes,
    };

    let response, error;
    if (customerId) {
      [response, error] = await CUSTOMERS.patchCustomer(customerId, customerData);
      if (error) {
        console.error("Failed to update user:", error);
        setSnackbarMessage("Failed to update user.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Updated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/paperbase");
      }, 2000);
    } else {
      [response, error] = await CUSTOMERS.postCustomer(customerData);
    }

    if (error) {
      console.error("İşlem sırasında bir hata oluştu:", error);
      setSnackbarMessage("Failed to register user.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage("Registered successfully.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => {
      window.location.reload(); 
    }, 2000);    
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <Box
          sx={{
            mt: 4,
            px: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h1" sx={{ alignSelf: "start" }}>
            Personal Information
          </Typography>

          <TextField
            id="name"
            name="name"
            label="Name"
            variant="outlined"
            value={customer.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            id="company_name"
            name="company_name"
            label="Company Name"
            variant="outlined"
            value={customer.company_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            id="email"
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            value={customer.email}
            onChange={handleChange}
            fullWidth
          />

          <Typography variant="h5" component="h1" sx={{ alignSelf: "start" }}>
            Address Information
          </Typography>

          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="street"
              name="street"
              label="Street"
              variant="outlined"
              value={customer.address.street}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="houseNumber"
              name="houseNumber"
              label="House Number"
              variant="outlined"
              value={customer.address.houseNumber}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="postCode"
              name="postCode"
              label="Post Code"
              variant="outlined"
              value={customer.address.postCode}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="suburb"
              name="suburb"
              label="Suburb"
              variant="outlined"
              value={customer.address.suburb}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="town"
              name="town"
              label="Town"
              variant="outlined"
              value={customer.address.town}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="city"
              name="city"
              label="City"
              value={customer.address.city}
              variant="outlined"
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="country"
              name="country"
              label="Country"
              variant="outlined"
              value={customer.address.country}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <TextField
            id="addition"
            name="addition"
            label="Addition"
            variant="outlined"
            value={customer.address.addition}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Typography variant="h5" component="h1" sx={{ alignSelf: "start" }}>
            Contact Information
          </Typography>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="vat_number"
              name="vat_number"
              label="VAT Number"
              variant="outlined"
              value={customer.vat_number}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="vat_office"
              name="vat_office"
              label="VAT Office"
              variant="outlined"
              value={customer.vat_office}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="phone"
              name="phone"
              label="Phone"
              variant="outlined"
              value={customer.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="mobile"
              name="mobile"
              label="Mobile"
              variant="outlined"
              value={customer.mobile}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <TextField
            id="notes"
            name="notes"
            label="Notes"
            variant="outlined"
            value={customer.notes}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ width: "100%", mt: 2 }}
          >
            Save
          </Button>
        </Box>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
        sx={{ '& .MuiSnackbarContent-root': { fontSize: '1.2rem', width: '100%' } }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
