import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './myProfile.module.scss';
import { Formik, Form, Field, ErrorMessage, FormikProps  } from 'formik';
import { ProfileInterface } from '../../interfaces/profileInterface';
import * as Yup from 'yup';
import api from '../../services/api';
import alert from '../../services/alert';
import endpoints from '../../helpers/endpoints';
import noProfileImage from "../../assets/images/no_profile_image.webp";

const MyProfile: React.FC = () => {
  const [editableForm, setEditableForm] = useState<boolean>(false);
  const [profileInfo, setProfileInfo] = useState<ProfileInterface>();
  const [loading, setLoading] = useState<boolean>(false);
  const formikRef = useRef<FormikProps<ProfileInterface>>(null);
  useEffect(()=> {
    getProfileInfo();
  }, []);
  const initialProfile: ProfileInterface = {
    name: "",
    userCode: "",
    shippingMethod: "",
    discountPercentage: "",
    accountEmail: "",
    invoiceEmail: "",
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string(),
    userCode: Yup.string(),
    shippingMethod: Yup.string(),
    discountPercentage: Yup.string(),
    accountEmail: Yup.string(),
    invoiceEmail: Yup.string()
      .email("Invalid email format")
      .required("Invoice Email is required"),
  });
  const handleSubmit = async (Value: ProfileInterface) => {
    setLoading(true);
    try {
      const payload = {
        invoice_email: Value.invoiceEmail
      }
      const res = await api.post(endpoints.profile.updateProfile, payload);
      if (res.data) {
        alert(res.data?.message, "success");
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message, "error");
    } finally {
      setEditableForm(false);
      setLoading(false);
      getProfileInfo();
    }
  };
  const editProfile = () => {
    if(!editableForm) {
      setEditableForm(true);
    } else {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    }
  };
  const getProfileInfo = async () => {
    try {
      const res = await api.get(endpoints.profile.getProfileInfo);
      if(res.status === 200) {
        const data: ProfileInterface = res.data;
        setProfileInfo(data);
        formikRef.current?.setValues({
          name: data.name || "",
          userCode: data.userCode || "",
          shippingMethod: data.shippingMethod || "",
          discountPercentage: data.discountPercentage || "",
          accountEmail: data.accountEmail || "",
          invoiceEmail: data.invoiceEmail || "",
        });
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message, "error");
    }
  }
  return (
    <>

      <div className={styles.myProfileBdyPrt}>
        <div className={styles.container}>
          <div className={styles.myProfileBdyRow}>
            <div className={styles.myProfileLeftPrt}>
              <div className={styles.profileImgPrt}>
                <img
                  src={profileInfo?.profilePictureUrl || noProfileImage}
                  alt='Profile'
                  className={styles.profileImg}
                />
                <div className={styles.profileCameraIcon}>
                  <img
                    src='images/camera-icon.svg'
                    alt='camera icon'
                  />
                </div>
              </div>
              <div className={styles.editProfileBtn}>
               <button onClick={editProfile} disabled={loading}>
                  <i className={`fa-solid ${editableForm ? "fa-save" : "fa-pencil"}`}></i> <span>{editableForm ? "Save" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
            <div className={styles.myProfileRightPrt}>
              <h1>My Profile</h1>
              <div className={styles.smartLinerFormClmTwo}>
                <Formik
                initialValues={initialProfile}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                innerRef={formikRef}
                >
                  <Form>
                  <ul>
                    <li>
                      <label>Name</label>
                      <Field
                        name='name'
                        disabled
                      />
                      {editableForm && <ErrorMessage name="name" component="p" className={styles.errorMessage} />}
                    </li>
                    <li>
                      <label>User Code</label>
                      <Field
                        name='userCode'
                       disabled
                      />
                      {editableForm && <ErrorMessage name="userCode" component="p" className={styles.errorMessage} />}
                    </li>
                    <li>
                      <label>Shipping Method</label>
                      <Field
                        name='shippingMethod'
                        disabled
                      />
                     {editableForm && <ErrorMessage name="shippingMethod" component="p" className={styles.errorMessage} />}
                    </li>
                    <li>
                      <label>Discount Percentage</label>
                      <Field
                        name='discountPercentage'
                        disabled
                      />
                      <div className={styles.percentageIcon}>
                        <span>%</span>
                      </div>
                     {editableForm && <ErrorMessage name="discountPercentage" component="p" className={styles.errorMessage} />}
                    </li>
                    <li>
                      <label>Account Email</label>
                      <Field
                        name='accountEmail'
                        disabled
                      />
                     {editableForm && <ErrorMessage name="accountEmail" component="p" className={styles.errorMessage} />}
                    </li>
                    <li className={!editableForm ? "" : "inputFocus"}>
                      <label>Invoice Email</label>
                      <Field
                        name='invoiceEmail'
                        disabled={!editableForm}
                      />
                     {editableForm && <ErrorMessage name="invoiceEmail" component="p" className={styles.errorMessage} />}
                    </li>
                  </ul>
                  </Form>
                </Formik>
              </div>
              <p>If you would like to change anything in your account, to reach out to 
                <Link to={'#'}>orders@krameramerica.com</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default MyProfile;
