import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Stack, Typography, TextField, Button } from "@mui/material";
import { CUSTOMERS, ADDRESS } from "../../api/api";

export default function AddCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setcustomer] = useState({
    name: "",
    email: "",
    street: "",
    houseNumber: "",
    country: "",
    city: "",
    postCode: "",
    addition: "",
    vat_number: "",
    vat_office: "",
    phone: "",
    mobile: "",
    notes: "",
  });
//bura address eklenicek eğer yapacaksak update için 
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

        const [addressResponse, addressError] = await ADDRESS.byId(
          customerResponse.address_id
        );
        if (addressError) {
          console.error("Adres bilgisi yüklenirken hata oluştu:", addressError);
          return;
        }

        setcustomer({
          name: customerResponse.name || "",
          email: customerResponse.email || "",
          street: addressResponse.street || "",
          houseNumber: addressResponse.house_number || "",
          country: addressResponse.country || "",
          city: addressResponse.city || "",
          postCode: addressResponse.postcode || "",
          addition: addressResponse.addition || "",
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
    setcustomer((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const customerUpdateData = {
      name: customer.name,
      vat_number: customer.vat_number,
      vat_office: customer.vat_office,
      phone: customer.phone,
      mobile: customer.mobile,
      notes: customer.notes,
    };

    const [customerUpdateResponse, customerUpdateError] = await CUSTOMERS.patchCustomer(customerId, customerUpdateData);
  
    if (customerUpdateError) {
      console.error("Error:", customerUpdateError);
      return;
    }
  
    console.log("Succses");
    navigate("/paperbase");
  };
  

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Typography color="inherit" variant="h5" component="h1">
            Personal Information
          </Typography>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="name"
              name="name"
              label="Name"
              variant="standard"
              value={customer.name}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <TextField
            id="email"
            name="email"
            label="Email"
            type="email"
            variant="standard"
            value={customer.email}
            onChange={handleChange}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />

          <Typography
            color="inherit"
            variant="h5"
            component="h1"
            sx={{ mt: 2 }}
          >
            Address Information
          </Typography>
          <TextField
            id="street"
            name="street"
            label="Street"
            variant="standard"
            value={customer.street}
            onChange={handleChange}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="houseNumber"
              name="houseNumber"
              label="House Number"
              variant="standard"
              value={customer.houseNumber}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              id="country"
              name="country"
              label="Country"
              variant="standard"
              value={customer.country}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="city"
              name="city"
              label="City"
              variant="standard"
              value={customer.city}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              id="postCode"
              name="postCode"
              label="Post Code"
              variant="standard"
              value={customer.postCode}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Stack>
          <TextField
            id="addition"
            name="addition"
            label="Addition"
            variant="standard"
            value={customer.addition}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            sx={{ mb: 2 }}
            disabled
          />

          <Typography
            color="inherit"
            variant="h5"
            component="h1"
            sx={{ mt: 2 }}
          >
            Contact Information
          </Typography>
          <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
            <TextField
              id="vat_number"
              name="vat_number"
              label="VAT Number"
              variant="standard"
              value={customer.vat_number}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="vat_office"
              name="vat_office"
              label="VAT Office"
              variant="standard"
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
              variant="standard"
              value={customer.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              id="mobile"
              name="mobile"
              label="Mobile"
              variant="standard"
              value={customer.mobile}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <TextField
            id="notes"
            name="notes"
            label="Notes"
            variant="standard"
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
            sx={{ width: "100%" }}
          >
            Save
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <Box
          sx={{
            display: "flex",
            background: "#eaeff1",
            justifyContent: "center",
            alignItems: "center",
            height: "98%",
          }}
        >
          <Box
            component="img"
            sx={{
              display: "flex",
              background: "#eaeff1",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
            alt="The house from the offer."
            src="https://f.hubspotusercontent30.net/hubfs/6069238/images/blogs/meauring-roofs.jpg"
          />
        </Box>
      </Grid>
    </Grid>
  );
}
