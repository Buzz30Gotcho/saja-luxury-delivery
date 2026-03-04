import React from "react";
import { Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ShopDetail from "../pages/ShopDetail";
import ShopList from "../pages/ShopList";
import ProductDetail from "../pages/ProductDetail";
import ProductCatalogue from "../pages/ProductCatalogue";
import CartPage from "../pages/CartPage";
import Checkout from "../pages/Checkout";
import CompteUser from "../pages/CompteUser";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteMerchant from "./ProtectedRouteMerchant";
// Merchant pages
import LoginMerchant from "../pages/merchant/LoginMerchant";
import RegisterMerchant from "../pages/merchant/RegisterMerchant";


// Pages temporaires utilisateur
const Orders = () => <div>Mes Commandes</div>;
const Favorites = () => <div>Mes Favoris</div>;
const Addresses = () => <div>Mes Adresses</div>;
const Payment = () => <div>Paiement</div>;
const Help = () => <div>Aide</div>;
const Settings = () => <div>Paramètres</div>;

export const routes = (
  <Route element={<Layout />}>
    {/* Public routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/shops" element={<ShopList />} />
    <Route path="/shop/:id" element={<ShopDetail />} />
    <Route path="/catalogue" element={<ProductCatalogue />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/category/:category" element={<Home />} />

    {/* Merchant public routes */}

    <Route path="/merchant/login" element={   <LoginMerchant />
    
    } />

       <Route path="/merchant/register" element={  <RegisterMerchant />} />
    

    {/* User protected routes */}
    <Route
      path="/compte_user"
      element={
        <ProtectedRoute role="user">
          <CompteUser />
        </ProtectedRoute>
      }
    />
    <Route
      path="/cart"
      element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute role="user">
          <Checkout />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute role="user">
          <Orders />
        </ProtectedRoute>
      }
    />
    <Route
      path="/favorites"
      element={
        <ProtectedRoute role="user">
          <Favorites />
        </ProtectedRoute>
      }
    />
    <Route
      path="/addresses"
      element={
        <ProtectedRoute role="user">
          <Addresses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payment"
      element={
        <ProtectedRoute role="user">
          <Payment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/help"
      element={
        <ProtectedRoute role="user">
          <Help />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute role="user">
          <Settings />
        </ProtectedRoute>
      }
    />


    {/* renvoie vers le home si il ne trouve pas la page */}
    <Route path="*" element={<Navigate to="/" />} />
  </Route>
);
