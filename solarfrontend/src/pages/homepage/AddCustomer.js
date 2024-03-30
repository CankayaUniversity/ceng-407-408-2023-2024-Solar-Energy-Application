import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Stack, Typography, TextField, Button } from "@mui/material";
import { CUSTOMERS, ADDRESS } from "../../api/api";

export default function AddCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [addresId, setAddressId] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: {
      street: "",
      houseNumber: "",
      country: "",
      city: "",
      postCode: "",
      addition: "",
    },
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
    setCustomer((prevState) => {
      const newState = { ...prevState };
      if (newState.address.hasOwnProperty(name)) {
        // Adres bilgilerini güncelle
        newState.address[name] = value;
      } else {
        // Diğer müşteri bilgilerini güncelle
        newState[name] = value;
      }
      return newState;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // const customerData = {
    //   name: customer.name,
    //   email: customer.email,
    //   address: {
    //     street: customer.address.street,
    //     houseNumber: customer.address.houseNumber,
    //     country: customer.address.country,
    //     city: customer.address.city,
    //     postCode: customer.address.postCode,
    //     addition: customer.address.addition,
    //   },
    //   vat_number: customer.vat_number,
    //   vat_office: customer.vat_office,
    //   phone: customer.phone,
    //   mobile: customer.mobile,
    //   notes: customer.notes,
    // };

    // // POST işlemi için tam müşteri bilgilerini kullan
    // const [response, error] = await CUSTOMERS.postCustomer(customerData);
    // if (error) {
    //   console.error("Müşteri eklenirken hata oluştu:", error);
    // } else {
    //   console.log("Müşteri başarıyla eklendi:", response);
    //   navigate("/paperbase");
    // }

    // const customerData = {
    //   name: customer.name,
    //   email: customer.email,
    //   address: {
    //     street: customer.address.street,
    //     houseNumber: customer.address.houseNumber,
    //     country: customer.address.country,
    //     city: customer.address.city,
    //     postCode: customer.address.postCode,
    //     addition: customer.address.addition,
    //   },
    //   vat_number: customer.vat_number,
    //   vat_office: customer.vat_office,
    //   phone: customer.phone,
    //   mobile: customer.mobile,
    //   notes: customer.notes,
    // };
  
    const addressData = {
      street: customer.street,
      house_number: customer.houseNumber,
      country: customer.country,
      city: customer.city,
      postcode: customer.postCode,
      addition: customer.addition,
    };
    const customerInfo = {
      name: customer.name,
      email: customer.email,
      vat_number: customer.vat_number,
      vat_office: customer.vat_office,
      phone: customer.phone,
      mobile: customer.mobile,
      notes: customer.notes,
    };

    if (customerId) {
      const [response, error] = await CUSTOMERS.patchCustomer(
        customerId,
        customerInfo
      );
      if (error) {
        console.error("Müşteri güncellenirken hata oluştu:", error);
        return;
      }
      console.log("Müşteri başarıyla güncellendi:", response);

      // Adres bilgilerini güncelle
      if (addresId) {
        const [addressResponse, addressError] = await ADDRESS.patchAddress(
          addresId,
          addressData
        );
        if (addressError) {
          console.error("Adres güncellenirken hata oluştu:", addressError);
          return;
        }
        console.log("Adres başarıyla güncellendi:", addressResponse);
      }

      navigate("/paperbase");
    } else {
      const [addressResponse, addressError] = await ADDRESS.putAddress(
        addressData,
        addresId
      );
      if (addressError) {
        console.error("Adres kaydedilirken bir hata oluştu:", addressError);
        return;
      }
      // Adres başarıyla kaydedildiğinde müşteri bilgisi ile birlikte müşteriyi kaydet
      customerInfo.address_id = addressResponse._id;
      const [customerResponse, customerError] = await CUSTOMERS.postCustomer(
        customerInfo
      );
      if (customerError) {
        console.error("Müşteri kaydedilirken bir hata oluştu:", customerError);
      } else {
        console.log("Yeni müşteri başarıyla kaydedildi:", customerResponse);
        navigate("/paperbase");
      }
    }
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
            />
            <TextField
              id="country"
              name="country"
              label="Country"
              variant="standard"
              value={customer.country}
              onChange={handleChange}
              fullWidth
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
            />
            <TextField
              id="postCode"
              name="postCode"
              label="Post Code"
              variant="standard"
              value={customer.postCode}
              onChange={handleChange}
              fullWidth
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
