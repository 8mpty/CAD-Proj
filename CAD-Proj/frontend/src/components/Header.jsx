import React from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box, useTheme, useScrollTrigger, Slide } from "@mui/material";
import { Link } from "react-router-dom";

const Header = () => {
  const trigger = useScrollTrigger();
  const theme = useTheme();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography 
              variant="h5" 
              component={Link} 
              to="/"
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}
            >
              Lost & Found
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                component={Link} 
                to="/items"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Browse Items
              </Button>
              <Button 
                component={Link} 
                to="/report"
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Report Item
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Header;