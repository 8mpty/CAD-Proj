import React from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lost & Found
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/items">
            Items
          </Button>
          <Button color="inherit" component={Link} to="/report">
            Report Item
          </Button>
          <Button color="inherit" component={Link} to="/notifications">
            Subscribe to Notifications
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
