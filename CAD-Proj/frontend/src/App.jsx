import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Header from './components/Header';
import Home from './pages/Home';
import Items from './pages/Items';
import ReportItem from './pages/ReportItem';
import NotificationSubscription from './components/NotificationSubscription'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/report" element={<ReportItem />} />
          <Route path="/notifications" element={<NotificationSubscription />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;