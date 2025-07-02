import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../store/userSlice";
import { AppDispatch } from "../../../store";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import alert from "../../../services/alert";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import api from "../../../services/api";
import {
  DecodeGoogleTokenResponse,
  LoginResponse,
  SendOtpResponse,
} from "../../../interfaces/authInterface";
import { jwtDecode } from "jwt-decode";
import styles from './login.module.scss';
import endpoints from "../../../helpers/endpoints";

const Login: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Google Client ID
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "";

  const handleSubmit = async (value: { email: string }) => {
    setLoading(true);
    try {
      const res = await api.post(endpoints.auth.sendOtp, value);
      if (res.data) {
        const data: SendOtpResponse = res.data;
        alert(data.message, "success");
        navigate(
          `/verify-otp?email=${value.email}&token=${data.verifyPageToken}`
        );
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || "OTP send failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler for successful Google login
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setLoading(true);
    try {
      // credentialResponse.credential contains the ID token
      const idToken = credentialResponse.credential;
      if (idToken) {
        const decodedToken: DecodeGoogleTokenResponse = jwtDecode(idToken);
        const payload = {
          email: decodedToken.email,
        };
        const res = await api.post(endpoints.auth.googleLogin, payload);
        if (res.data) {
          const data: LoginResponse = res.data;
          alert(res.data?.message || "You have successfully logged in.", "success");
          dispatch(
            setLogin({
              token: data.accessToken,
              userInfo: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                profileImage: data.user.profilePictureUrl
              },
            })
          );
        }
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler for failed Google login
  const handleGoogleFailure = (errorResponse?: any) => {
    alert("Google login failed. Please try again.", "error");
  };

  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });
  const initialValues = {
    email: "",
  };

  return (
    <>
    <div className={styles.loginBodyPrt}>
      <div className={styles.container}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={(value) => handleSubmit(value)}
          >
            <Form>
              <div className={styles.loginFormBox}>
                <div className={styles.loginBoxHdn}>
                  <h2>Sign in</h2>
                  <p>Choose how you'd like to sign in</p>
                </div>
                <div>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                  />
                </div>
                <div className={styles.loginOption}>
                  <p>or</p>
                </div>
                <div className={styles.loginFormField}>
                  <label
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter Your Email Address"
                  />
                  <ErrorMessage name="email" component="p" className={styles.loginError} />

                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    Continue
                  </button>
                </div>
                <p className={styles.loginTermsService}>
                  <Link to="https://www.smartliner-usa.com/pages/our-policies">
                    Policies & Terms of Service
                  </Link>
                </p>
              </div>
            </Form>
          </Formik>
        </GoogleOAuthProvider>
      </div>
    </div>
    </>
  );
};

export default Login;
