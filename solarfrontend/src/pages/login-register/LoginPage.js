import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import loginCover from "../../assets/images/login.jpg";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import MuiLink from "@mui/material/Link";

import PropTypes from "prop-types";
import Toolbar from "@mui/material/Toolbar";

import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { auth } from "../../api/auth";
import { useNavigate } from "react-router-dom";

function Header(props) {
  const { sections, title } = props;

  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Button size="small">Subscribe</Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Toolbar>
      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: "space-between", overflowX: "auto" }}
      >
        {sections.map((section) => (
          <Link
            color="inherit"
            noWrap
            key={section.title}
            variant="body2"
            href={section.url}
            sx={{ p: 1, flexShrink: 0 }}
          >
            {section.title}
          </Link>
        ))}
      </Toolbar>
    </React.Fragment>
  );
}

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Solar Energy App © "}
      {/* <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '} */}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignInSide() {
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* useTheme() hook'unu burada kullanmayın */}
      <MyComponent /> {/* Yeni bileşeninizi burada kullanın */}
    </ThemeProvider>
  );

  function MyComponent() {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailChange = (event) => {
      setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
      setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      console.log({
        email: email,
        password: password,
      });
    };

    const navigate = useNavigate();

    useEffect(() => {
      const accestoken = localStorage.getItem("accessToken");
      if (accestoken) {
        console.log("Token alındı:", accestoken); // Konsolda token'ı log'la
        navigate("/paperbase"); // Giriş başarılıysa, kullanıcıyı paperbase sayfasına yönlendir
      }
    }, []);

    const signin = async () => {
      const token = await auth.login(email, password);

      const userprofile = localStorage.getItem("userProfile");
      const userProfile = JSON.parse(userprofile);

      try {
        const accestoken = localStorage.getItem("accessToken");
        if (accestoken) {
          console.log("Token alındı:", accestoken); // Konsolda token'ı log'la
          navigate("/paperbase"); // Giriş başarılıysa, kullanıcıyı paperbase sayfasına yönlendir
        } else {
          // Giriş başarısızsa, bir hata mesajı gösterebilirsiniz
          alert("Giriş başarısız");
        }
      } catch (error) {
        // Hata yakalama
        alert('Yanlış şifre veya e-mail.');
      }
    };

    return (
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${loginCover})`, // Resmi kullanmak için güncellenmiş yol
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
            [theme.breakpoints.down("sm")]: {
              backgroundImage: "none", // Bu ekran boyutunda arka plan görüntüsünü kaldırır
            },
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email} // Bind the TextField to the email state variable
                onChange={handleEmailChange} // Update the email state on change
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password} // Bind the TextField to the password state variable
                onChange={handlePasswordChange} // Update the password state on change
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                component={RouterLink}
                onClick={signin}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <MuiLink component={RouterLink} to="/sign-up" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </MuiLink>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
};
