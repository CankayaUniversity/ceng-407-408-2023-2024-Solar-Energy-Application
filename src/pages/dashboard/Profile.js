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
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
// import LockResetIcon from "@mui/icons-material/LockReset";
import { USER } from "../../api/api";
import { useNavigate } from "react-router-dom";

function Profile({ onCancel }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    gender: "",
    birthDate: "",
    password: "",
  });

  const navigate = useNavigate();

  // const [oldPassword, setOldPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    USER.getProfile().then(([data, error]) => {
      if (data) {
        console.log("Profil bilgileri yüklendi:", data);
        setUser({
          ...data,
          birthDate: data.birthDate.split("T")[0], // ISO string formatından tarihi alın
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
  };

  // const handlePasswordChange = (e) => {
  //   if (e.target.name === "currentPassword") {
  //     setOldPassword(e.target.value);
  //   } else if (e.target.name === "newPassword") {
  //     setNewPassword(e.target.value);
  //   }
  // };

  const handleSave = () => {
    console.log("data", user);
    USER.updateProfile(user._id, {
      name: user.name,
      email: user.email,
      password: user.password,
      gender: user.gender,
      birthDate: user.birthDate,
    }).then(([data, error]) => {
      if (!error) {
        alert("Profil güncellendi!");
        navigate("/paperbase");
      } else {
        alert("Profil güncellenemedi!");
      }
    });
  };

  const handleCancel = () => {
    navigate("/paperbase");
  };

  // const handleUpdatePassword = () => {
  //   if (oldPassword && newPassword) {
  //     USER.updateProfile(user.id, { oldPassword, newPassword }) // API'nize göre değişiklik yapabilirsiniz
  //       .then(([data, error]) => {
  //         if (data) {
  //           console.log('Şifre güncellendi:', data);
  //           alert('Şifre başarıyla güncellendi.');
  //           setOldPassword('');
  //           setNewPassword('');
  //         } else {
  //           console.error('Şifre güncellenirken hata oluştu:', error);
  //           alert('Eski şifre yanlış veya diğer hata!');
  //         }
  //       });
  //   } else {
  //     alert('Lütfen eski ve yeni şifre alanlarını doldurunuz.');
  //   }
  // };

  return (
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
            label="New Password"
            fullWidth
            name="password"
            type="password"
            value={user.password}
            onChange={handleInputChange}
            placeholder="Enter new password"
          />
        </Grid>
        {/* <Grid item xs={12}>
          <TextField
            label="New Password"
            fullWidth
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
          />
        </Grid> */}
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
        {/* <Grid item xs={12} align="center">
          <Button
            startIcon={<LockResetIcon />}
            variant="contained"
            color="secondary"
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>
        </Grid> */}
      </Grid>
    </Paper>
  );
}

export default Profile;
