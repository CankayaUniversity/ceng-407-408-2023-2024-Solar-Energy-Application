import * as React from "react";
import PropTypes from "prop-types";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

function Header(props) {
  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Button size="small">Solar App</Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1, marginLeft: "auto", marginRight: "auto" }}
        >
          Solar
          <span style={{ color: "#ffa726" }}>App</span>
          lication
        </Typography>

        <IconButton>
          <SearchIcon />
        </IconButton>
        <Button
          component={RouterLink}
          to="/sign-up"
          variant="outlined"
          size="small"
        >
          Sign up
        </Button>
        <Button
          component={RouterLink}
          to="/login"
          variant="outlined"
          size="small"
        >
          Sign in
        </Button>
      </Toolbar>
      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: "space-between", overflowX: "auto" }}
      ></Toolbar>
    </React.Fragment>
  );
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

export default Header;
