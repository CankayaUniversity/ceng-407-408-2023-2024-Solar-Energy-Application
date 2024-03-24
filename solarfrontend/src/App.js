import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Blog from './pages/homepage/Blog';
import LoginPage from '../src/pages/login-register/LoginPage';
import RegisterPage from '../src/pages/login-register/RegisterPage';
import Paperbase from './pages/dashboard/Paperbase';
import Profile from './pages/dashboard/Profile';
import Customers from './pages/homepage/Customers';
import Content from './pages/dashboard/Content';
import AddCustomer from './pages/homepage/AddCustomer';
import AddProject from './pages/dashboard/AddProject';

// Giriş yapılmış mı kontrol eden fonksiyon
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken'); // accessToken var mı kontrol et
  return token ? true : false;
};

// Korunan route bileşeni
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Giriş yapılmamışsa, LoginPage'e yönlendir
    return <Navigate to="/login" />;
  }
  return children; // Giriş yapılmışsa, çocuk bileşenleri (children) döndür
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Blog />} />
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
      </Routes>
    </Router>
  );
}

export default App;
