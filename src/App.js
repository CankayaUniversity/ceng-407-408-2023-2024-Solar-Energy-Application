import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Blog from './pages/homepage/Blog';
import LoginPage from '../src/pages/login-register/LoginPage';
import RegisterPage from '../src/pages/login-register/RegisterPage';
import Paperbase from './pages/dashboard/Paperbase';
import Profile from './pages/dashboard/Profile';
import Customers from './pages/homepage/Customers';
import Content from './pages/dashboard/Content';
import AddCustomer from './pages/homepage/AddCustomer';
import AddProject from './pages/dashboard/AddProject';
import SimulationTest from "./pages/homepage/SimulationTest";
import WelcomeScreen from './pages/welcome/WelcomeScreen';

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken'); 
  return token ? true : false;
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children; 
};

function App() {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuth(!!token); 
  }, []);

  if (isAuth === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    ); 
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuth ? <Navigate to="/paperbase" /> : <WelcomeScreen />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<RegisterPage />} />
        <Route path="/paperbase" element={
          <ProtectedRoute>
            <Paperbase />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Content />
          </ProtectedRoute>
        } />
        <Route path="/addcustomer" element={
          <ProtectedRoute>
            <AddCustomer />
          </ProtectedRoute>
        } />
        <Route path="/add-project" element={
          <ProtectedRoute>
            <AddProject />
          </ProtectedRoute>
        } />
        <Route path="/add-customer/:customerId" element={
          <ProtectedRoute>
            <AddCustomer />
          </ProtectedRoute>
        } />
        <Route path="/add-sim" element={
          <ProtectedRoute>
            <SimulationTest />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
