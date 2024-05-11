import React, { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useLocation } from "react-router-dom";
import { auth } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const lightColor = "rgba(255, 255, 255, 0.7)";

function Header(props) {
  const { onDrawerToggle, onTabChange } = props;
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);

    if (onTabChange) {
      onTabChange(newValue);
    }
  };
  const handleChangeAltTab = (event, newValue) => {
    setSelectedTab(newValue);
    
    if (onTabChange) {
      onTabChange(newValue);
    }
  };
  const onProfileClick = () => {
    window.location.href = "/profile";
  };
  const navigate = useNavigate();
  const onLogoutClick = () => {
    auth.logout();
    navigate('/login');
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [tabs, setTabs] = useState([
    { label: "Projects", id: "projects" },
    { label: "Customers", id: "customers" },
  ]);

  const [altTabs, setAltTabs] = useState([{ label: "Add Customer", id: "addCustomer" }]);
  return (
    <React.Fragment>
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar>
          <Typography color="inherit" variant="h5" component="h1">
            Welcome
          </Typography>

          <Grid container spacing={1} alignItems="center">
            <Grid sx={{ display: { sm: "none", xs: "block" } }} item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={handleMenuOpen}
              >
                <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={onProfileClick}>Profile</MenuItem>

                <MenuItem onClick={onLogoutClick}>Logout</MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Divider />
      <AppBar
        style={{ alignItems: "center" }}
        component="div"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
      >
        <Tabs
          value={selectedTab}
          textColor="inherit"
          onChange={handleChangeTab}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} style={{ fontSize: "20px" }} />
          ))}
        </Tabs>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  onTabChange: PropTypes.func,
};

export default Header;
