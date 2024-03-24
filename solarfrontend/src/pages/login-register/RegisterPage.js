import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { USER } from "../../api/api";

const defaultTheme = createTheme();

export default function SignInSide() {
  const [selectedDate, setSelectedDate] = React.useState(null);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleOpenSnackbar = () => {
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const [userDetails, setUserDetails] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthDate: "",
    company_id: "",
  });

  const [companyDetails, setCompanyDetails] = React.useState({
    name: "",
    vat_number: "",
    vat_office: "",
    address: {
      street: "",
      house_number: "",
      country: "",
      city: "",
      postcode: "",
      addition: "",
    },
  });
  const yolla = async () => {
    if (activeStep === steps.length - 1) {
      if (userDetails.password !== userDetails.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      if (activeStep === 2) {
        console.log("sihnup");
        navigate("/login");
        handleOpenSnackbar();
      }
      console.log("uer ", userDetails, " hebele2: ", companyDetails);
      userDetails.name = userDetails.firstName + " " + userDetails.lastName;

      delete userDetails.firstName;
      delete userDetails.lastName;
      console.log("userlan: ", USER)
      const [response, error] = await USER.register(
        userDetails,
        companyDetails
      );
      console.log("error: ",error)
      if (error) {
        console.error("Kayıt sırasında hata oluştu:", error);
      } else {
        console.log("Kullanıcı başarıyla kaydedildi:", response);
      }
    } else {
      handleNext();
    }
  };

  const steps = [
    "Personal Information",
    "Company Information",
    "Address Information",
  ];
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    console.log("active", activeStep);
    if (activeStep === 2) {
      yolla();
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const [gender, setGender] = React.useState("");

  const handleChange = (event) => {
    setGender(event.target.value);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box sx={{ width: "100%", mt: "6%" }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                // if (isStepOptional(index)) {
                //   labelProps.optional = (
                //     <Typography variant="caption">Optional</Typography>
                //   );
                // }
                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            {activeStep === 0 && (
              <Box component="form" noValidate sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      value={userDetails.firstName}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          firstName: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      value={userDetails.lastName}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          lastName: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={userDetails.email}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          email: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={userDetails.password}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          password: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={userDetails.confirmPassword}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          confirmPassword: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="gender-select-label">Gender</InputLabel>
                      <Select
                        labelId="gender-select-label"
                        id="gender-select"
                        value={userDetails.gender}
                        label="Gender"
                        onChange={(event) =>
                          setUserDetails({
                            ...userDetails,
                            gender: event.target.value,
                          })
                        }
                      >
                        <MenuItem value={"male"}>Male</MenuItem>
                        <MenuItem value={"female"}>Female</MenuItem>
                        <MenuItem value={"other"}>Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={userDetails.birthDate || "2017-05-24"}
                      onChange={(event) =>
                        setUserDetails({
                          ...userDetails,
                          birthDate: event.target.value,
                        })
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                      sx={{ justifyContent: "center", width: "100%" }} // Center the button horizontally
                    >
                      Upload Photo
                      <VisuallyHiddenInput type="file" />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            {activeStep === 1 && (
              <Box component="form" noValidate sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="companyName"
                      label="Company Name"
                      name="companyName"
                      value={companyDetails.name}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          name: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="vatNumber"
                      label="Vat Number"
                      name="vatNumber"
                      value={companyDetails.vat_number}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          vat_number: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="vatOffice"
                      label="VAT Office"
                      name="vatOffice"
                      value={companyDetails.vat_office}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          vat_office: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                      sx={{ justifyContent: "center", width: "100%" }} // Center the button horizontally
                    >
                      Upload Logo
                      <VisuallyHiddenInput type="file" />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            {activeStep === 2 && (
              <Box component="form" noValidate sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="street"
                      label="Street"
                      name="street"
                      value={companyDetails.address.street}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            street: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="houseNumber"
                      label="House Number"
                      name="houseNumber"
                      value={companyDetails.address.house_number}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            house_number: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="country"
                      label="Country"
                      name="country"
                      value={companyDetails.address.country}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            country: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="city"
                      label="City"
                      name="city"
                      value={companyDetails.address.city}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            city: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="postCode"
                      label="Post Code"
                      name="postCode"
                      value={companyDetails.address.postcode}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            postcode: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="additionalInfo"
                      label="Additional Info"
                      name="additionalInfo"
                      value={companyDetails.address.addition}
                      onChange={(event) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: {
                            ...companyDetails.address,
                            addition: event.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              {activeStep === 0 ? (
                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    mt: 1,
                    backgroundColor: "white", // Açık mavi arka plan rengi
                    color: "primary", // Yazı rengi beyaz
                    "&:hover": {
                      backgroundColor: "white", // Fare ile üzerine gelindiğinde farklı bir mavi
                    },
                  }}
                >
                  Already have an account?
                </Button>
              ) : (
                <Button color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}

              <Box sx={{ flex: "1 1 auto" }} />
              {/* {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  Skip
                </Button>
              )} */}
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? "Sign Up" : "Next"}
              </Button>
            </Box>
          </Box>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            Account created successfully. 
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
