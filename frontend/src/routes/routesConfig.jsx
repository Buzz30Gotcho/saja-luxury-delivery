import HistoriqueLivraisons from "../pages/coursier/HistoriqueLivraisons";
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
import OrderTracking from "../pages/OrderTracking";
import CompteUser from "../pages/CompteUser";
import CoursierDashboard from "../pages/coursier/CoursierDashboard";
import LoginCoursier from "../pages/coursier/LoginCoursier";
import RegisterCoursier from "../pages/coursier/RegisterCoursier";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteMerchant from "./ProtectedRouteMerchant";
import ProtectedRouteCoursier from "./ProtectedRouteCoursier";
import CoursierLayout from "../components/CoursierLayout";
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
  <>
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
      <Route path="/merchant/login" element={<LoginMerchant />} />
      <Route path="/merchant/register" element={<RegisterMerchant />} />

      {/* User protected routes */}
      <Route
        path="/compte_user"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-tracking/:orderId"
        element={
          <ProtectedRoute>
            <OrderTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute role="customer">
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute >
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

    {/* COURSIER APP - COMPLETELY SEPARATE FROM CUSTOMER SITE */}
    {/* Public routes (no header) */}
    <Route path="/coursier/login" element={<LoginCoursier />} />
    <Route path="/coursier/register" element={<RegisterCoursier />} />

    {/* Protected routes with layout */}
    <Route element={<CoursierLayout />}>
      <Route
        path="/coursier/dashboard"
        element={
          <ProtectedRouteCoursier>
            <CoursierDashboard />
          </ProtectedRouteCoursier>
        }
      />

      <Route
        path="/coursier/historique"
        element={
          <ProtectedRouteCoursier>
            <HistoriqueLivraisons />
          </ProtectedRouteCoursier>
        }
      />
    </Route>
  </>
);
