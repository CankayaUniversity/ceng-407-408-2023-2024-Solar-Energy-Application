import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  LinearProgress,
  Box,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { USER } from "../../api/api";
import { useNavigate } from "react-router-dom";
import Header from '../dashboard/Header';
import CssBaseline from '@mui/material/CssBaseline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Profile({ onCancel }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    gender: "",
    birthDate: "",
    password: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    USER.getProfile().then(([data, error]) => {
      if (data) {
        console.log("Profil bilgileri yüklendi:", data);
        setUser({
          ...data,
          birthDate: data.birthDate.split("T")[0],
          password: "",
        });
      } else {
        console.error("Profil bilgileri yüklenirken hata oluştu:", error);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(value.length > 5 ? 100 : (value.length / 5) * 100);
    }
  };

  const handleSave = () => {
    if (user.password === "" || user.password.length < 5) {
      setSnackbarMessage(
        user.password === ""
          ? "Please type the password correctly."
          : "Password must be at least 5 characters."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    USER.updateProfile(user._id, {
      name: user.name,
      email: user.email,
      password: user.password,
      gender: user.gender,
      birthDate: user.birthDate,
    }).then(([data, error]) => {
      if (!error) {
        setSnackbarMessage("Sucess Update Profile!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate("/paperbase");
        }, 2000);
      } else {
        setSnackbarMessage("Failed to update user.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 2000);
      }
    });
  };

  const handleCancel = () => {
    navigate("/paperbase");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Paper style={{ padding: "20px", maxWidth: 500, margin: "20px auto" }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} align="center">
            <Typography variant="h4">Profile Page</Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Avatar src={user.avatar} sx={{ width: 56, height: 56 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              name="name"
              value={user.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              fullWidth
              name="email"
              value={user.email}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="gender-select-label">Gender</InputLabel>
              <Select
                labelId="gender-select-label"
                id="gender-select"
                value={user.gender}
                label="Gender"
                onChange={(event) => {
                  setUser((prevUser) => ({
                    ...prevUser,
                    gender: event.target.value,
                  }));
                }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Birth Date"
              fullWidth
              name="birthDate"
              type="date"
              value={user.birthDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Current Password or New Password"
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ width: '100%', mt: 2, display: 'flex', alignItems: 'center' }}>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  height: 10,
                  flex: 1,
                  bgcolor: passwordStrength === 100 ? 'green' : 'red'
                }}
              />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {`${Math.round(passwordStrength)}%`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} align="right">
            <Button
              startIcon={<CancelIcon />}
              variant="outlined"
              color="error"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6} align="left">
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Save
            </Button>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{ '& .MuiSnackbarContent-root': { fontSize: '1.2rem', width: '100%' } }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default Profile;
