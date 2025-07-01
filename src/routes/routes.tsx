import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login/login";
import ProtectedRoute from "./protectedRoute";
import AuthRedirect from "./authRedirect";
import VerifyOtp from "../pages/auth/verify-otp/verifyOtp";
import AddProduct from "../pages/product/add-product/addProduct";
import ProductList from "../pages/product/product-list/productList";
import MyProfile from "../pages/my-profile/myProfile";
import PageNotFound from "../pages/page-not-found/pageNotFound";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

function AppRouter() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route element={<AuthRedirect />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* ProtectedRoute for routes that require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ProductList />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/add-product" element={<AddProduct />} />
        </Route>

        {/* Catch-all for 404 Not Found */}
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
      <Footer/>
    </Router>
  );
}

export default AppRouter;
