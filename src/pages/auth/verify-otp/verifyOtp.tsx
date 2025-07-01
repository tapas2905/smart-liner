/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import alert from "../../../services/alert";
import api from "../../../services/api";
import {
  LoginResponse,
  VerifyOtpPayload,
} from "../../../interfaces/authInterface";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../store/userSlice";
import { AppDispatch } from "../../../store";
import styles from './verifyotp.module.scss';
import endpoints from "../../../helpers/endpoints";

const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (!emailParam || !tokenParam) {
      alert("Something went wrong. Please try again.", "error");
      navigate("/login");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);

    // Clear query params from URL
    window.history.replaceState({}, document.title, "/verify-otp");
  }, [searchParams]);

  const handleVerify = async (value: { otp: string }) => {
    if (!value.otp || !email || !token) {
      alert("Something went wrong. Please try again.", "error");
      return;
    }
    const payload: VerifyOtpPayload = {
      otp: value.otp,
      email,
      verifyPageToken: token,
    };
    setLoading(true);
    try {
      const res = await api.post(endpoints.auth.verifyOtp, payload);
      if (res.data) {
        const data: LoginResponse = res.data;
        alert(
          res.data?.message || "You have successfully logged in.",
          "success"
        );
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
    } catch (error: any) {
      alert(error?.response?.data?.detail || error?.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const verifyOtpSchema = Yup.object().shape({
    otp: Yup.string()
      .required("OTP is required")
      .length(6, "OTP must be 6 digits"),
  });
  const initialValues = {
    otp: "",
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
  };

  return (
    <>
      <div className={styles.verifyOtpBodyPrt}>
        <div className={styles.container}>
          <Formik
            initialValues={initialValues}
            validationSchema={verifyOtpSchema}
            onSubmit={(value) => handleVerify(value)}
          >
            <Form>
              <div className={styles.verifyOtpFormBox}>
                <div className={styles.verifyOtpBoxHdn}>
                  <h2>Enter code</h2>
                  <p>Sent to {email}</p>
                </div>
                <div className={styles.verifyOtpFormField}>
                  <label>Your verification code</label>
                  <Field
                    type="text"
                    placeholder="Enter 6-digit code"
                    name="otp"
                    maxLength={6}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleOtpChange(e);
                    }}
                  />
                  <ErrorMessage name="otp" component="p" className={styles.verifyOtpError} />
                  <button 
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                <p className={styles.verifyOtpTermsService}>
                  <Link to="#">
                    Policies & Terms of Service
                  </Link>
                  <span>|</span>
                  <Link to="#">
                     Sign in with a different email
                  </Link>
                </p>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
