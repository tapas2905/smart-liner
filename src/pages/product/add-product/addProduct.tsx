/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Formik, Form, FieldArray, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import alert from '../../../services/alert';
import styles from './addProduct.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { FormDataField, PurchaseOrder, Country, State } from '../../../interfaces/productInterface';
import api from '../../../services/api';
import endpoints from '../../../helpers/endpoints';
import debounce from 'lodash.debounce';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';

const AddProduct: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statesMap, setStatesMap] = useState<Map<number, State[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [poFormLoading, setPoFormLoading] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [isUploadFile, setIsUploadFile] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formikRef = useRef<FormikProps<FormDataField>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedGetProductSkuList = useMemo(
    () =>
      debounce(async (input: string) => {
        setLoading(true);
        try {
          const res = await api.get(`${endpoints.product.getProducts}?page=1&page_size=15${input ? `&keyword=${input}` : ""}`);
          if (res.status === 200) {
            setItems(res.data.items);
          }
        } catch (err: any) {
          alert(err?.response?.data?.detail || err?.message, "error");
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedGetProductSkuList(searchQuery);
    return () => {
      debouncedGetProductSkuList.cancel();
    };
  }, [searchQuery, debouncedGetProductSkuList]);

  useEffect(()=> {
    setIsAttachFile(!!searchParams.get("attachFile"));
    getCountries();
    formikRef.current?.setValues(initialFormValues);
  }, [searchParams]);

  const getCountries = async () => {
    try {
      const res = await api.get(endpoints.product.getCountries);
      if(res.status === 200) {
        setCountries(res.data);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message, "error");
    }
  }
  const getStates = async (countryId: string, poIndex: number) => {
  try {
    const res = await api.get(endpoints.product.getStates(countryId));
    if(res.status === 200) {
      setStatesMap(prevMap => new Map(prevMap).set(poIndex, res.data));
    }
  } catch (err: any) {
    alert(err?.response?.data?.detail || err?.message, "error");
  }
}
  

  // Yup validation schema for a single item
  const itemSchema = Yup.object().shape({
    itemSkuId: Yup.object().required("Item is required"),
    quantity: Yup.number()
      .required("Quantity is required")
      .min(1, "Quantity must be at least 1")
      .integer("Quantity must be an integer"),
  });

  // Yup validation schema for a single purchase order
  const purchaseOrderSchema = Yup.object().shape({
    purchaseOrder: Yup.string().required("Purchase Order is required"),
    purchaseDate: Yup.string().optional(),
    recipientFirstName: Yup.string().required(
      "Recipient First Name is required"
    ),
    recipientLastName: Yup.string().required("Recipient Last Name is required"),
    recipientAddress1: Yup.string().required("Recipient Address 1 is required"),
    recipientAddress2: Yup.string().optional(),
    recipientCountryCode: Yup.string().required(
      "Recipient Country Code is required"
    ),
    recipientState: Yup.string().required("Recipient State is required"),
    recipientZip: Yup.string()
      .required("Recipient Zip is required")
      .matches(/^\d{5}(-\d{4})?$/, "Invalid Zip Code"),
    recipientPhoneNumber: Yup.string()
      .optional()
      .matches(/^\d{10}$/, "Phone number must be 10 digits"),
    items: Yup.array().of(itemSchema).min(1, "At least one item is required"),
  });

  // Yup validation schema for the entire form (an array of purchase orders)
  const validationSchema = Yup.object().shape({
    purchaseOrders: Yup.array()
      .of(purchaseOrderSchema)
      .min(1, "At least one Purchase Order is required"),
  });

  // Initial values for a new, empty purchase order
  const initialNewPurchaseOrder: PurchaseOrder = {
    purchaseOrder: "",
    purchaseDate: "",
    recipientFirstName: "",
    recipientLastName: "",
    recipientAddress1: "",
    recipientAddress2: "",
    recipientCountryCode: "",
    recipientState: "",
    recipientZip: "",
    recipientPhoneNumber: "",
    items: [{ itemSkuId: null, quantity: 1 }],
  };

  const initialFormValues: FormDataField = {
    purchaseOrders: [initialNewPurchaseOrder], // Start with one empty purchase order
  };

  // Submit Purchase Order 
   const handleSubmit = async (values: FormDataField) => {
    try {
      setPoFormLoading(true);
      const payload = values.purchaseOrders.map((po) => ({
        ...po,
        items: po.items.map((item) => ({
          itemSkuId: item.itemSkuId?.skuId,
          quantity: item.quantity,
        })),
      }));
      const res = await api.post(endpoints.product.placeOrder, payload);
      if (res.data) {
        alert(res.data?.message, "success");
        navigate("/");
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message, "error");
    } finally {
      setPoFormLoading(false);
    }
  };

  const patchPoData = async (extractData: PurchaseOrder[]) => {
    try {
      const newStatesMap = new Map<number, State[]>();
      for (let i = 0; i < extractData.length; i++) {
        const po = extractData[i];
        if (po.recipientCountryCode) {
          try {
            const stateRes = await api.get(
              endpoints.product.getStates(po.recipientCountryCode)
            );
            if (stateRes.status === 200) {
              newStatesMap.set(i, stateRes.data);
            }
          } catch (err: any) {
            alert(
              `Error fetching states for country ${po.recipientCountryCode}: ${
                err?.response?.data?.detail || err?.message
              }`,
              "error"
            );
          }
        }
      }
      setStatesMap(newStatesMap);

      const patchedPurchaseOrders: PurchaseOrder[] = extractData.map((po) => {
        const transformedItems = po.items.map((item: any) => {
          return {
            itemSkuId: item?.skuId ? item : null,
            quantity: item.quantity,
          };
        });

        return {
          ...po,
          purchaseDate: po.purchaseDate
            ? moment(po.purchaseDate).format("YYYY-MM-DD")
            : "",
          recipientCountryCode: po.recipientCountryCode.toString(),
          recipientState: po.recipientState.toString(),
          items: transformedItems,
        };
      });
      setIsAttachFile(false);
      formikRef.current?.setValues({ purchaseOrders: patchedPurchaseOrders });
    } catch (error: any) {
      alert(error?.response?.data?.detail || error?.message, "error");
    }
  };

  const uploadFileClick = () => {
    fileInputRef.current?.click();
  };

 const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedMimeTypes = new Set([
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/pdf",
    "text/csv",
    "message/rfc822",
  ]);

  const allowedExtensions = new Set([
    ".csv",
    ".txt",
    ".pdf",
    ".xls",
    ".xlsx",
    ".eml",
  ]);
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const isFileTypeAllowed = allowedMimeTypes.has(file.type);
  const isExtensionAllowed = allowedExtensions.has(fileExtension);

  if (!isFileTypeAllowed && !isExtensionAllowed) {
    alert("Please select only Excel, text, PDF, CSV, or EML files.", "error");
    event.target.value = '';
    return;
  }
  setIsUploadFile(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.postForm(endpoints.product.extractOrder, formData);
    if (res.data?.orders) {
      // patchPoData(res.data.orders);
    } 
  } catch (err: any) {
    const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred.";
    alert(errorMessage, "error");
  } finally {
    setIsUploadFile(false);
  }
};

  
  return (
    <>
    <div className={styles.addProductBdyPrt}>
      {isAttachFile && (
        <div className={styles.uploadFileBox}>
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <h2>Upload your file here</h2>
          <p>Files supported: TXT, PDF, EXCEL, EML</p>
          <div className={styles.addProductInputFileField}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .txt, text/plain, .pdf, application/pdf, .eml, message/rfc822"
              style={{ display: "none" }}
            />

            <button type="button" onClick={uploadFileClick} disabled={isUploadFile}>
              {!isUploadFile ? 'Browse' : (<span className={styles.uploadBtnLoader}><CircularProgress size="22px"/> Please wait...</span>)}
            </button>

          </div>
        </div>
      )}
      
        <div className={styles.container} style={{display: !isAttachFile ? 'block' : 'none'}}>
        <div className={styles.pageTitle}>
          <h1>Please Enter Your Order For Submission</h1>
        </div>
        
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize = {true}
          innerRef={formikRef}
        >
          {({ values, setFieldValue, errors, touched }) => (
          <Form className="main-form">
            <FieldArray name="purchaseOrders">
              {({ push, remove }) => (
                <>
                  {values.purchaseOrders.map((po, poIndex) => (
                    <div key={poIndex} className={styles.addProductFormBox}>
                        <div className={styles.purchaseOrderTitleRow}>
                          <h2 className={styles.purchaseOrderTitle}>Purchase Order #{poIndex + 1}</h2>
                          {values.purchaseOrders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                remove(poIndex);
                                setStatesMap(prevMap => {
                                  const newMap = new Map(prevMap);
                                  newMap.delete(poIndex);
                                  return newMap;
                                });
                              }}
                              className={styles.removePoButton}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>

                        {/* Purchase Order Details */}
                        <div className={styles.smartLinerFormClmThree}>
                          <ul>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.purchaseOrder`}>
                                Purchase Order
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.purchaseOrder`}
                                name={`purchaseOrders.${poIndex}.purchaseOrder`}
                                type="text"
                                placeholder="Enter Your ID"
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.purchaseOrder`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.purchaseDate`}>
                                Purchase Date (Optional)
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.purchaseDate`}
                                name={`purchaseOrders.${poIndex}.purchaseDate`}
                                type="date"
                                max={moment().format('YYYY-MM-DD')}
                                className={styles.noCalenderIcon}
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.purchaseDate`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientFirstName`}>
                                Recipient First Name
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.recipientFirstName`}
                                name={`purchaseOrders.${poIndex}.recipientFirstName`}
                                type="text"
                                placeholder="Enter First Name"
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientFirstName`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientLastName`}>
                                Recipient Last Name
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.recipientLastName`}
                                name={`purchaseOrders.${poIndex}.recipientLastName`}
                                type="text"
                                placeholder="Enter Last Name"
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientLastName`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientAddress1`}>
                                Recipient Address 1
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.recipientAddress1`}
                                name={`purchaseOrders.${poIndex}.recipientAddress1`}
                                type="text"
                                placeholder="Enter Address 1"
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientAddress1`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientAddress2`}>
                                Recipient Address 2 (Optional)
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.recipientAddress2`}
                                name={`purchaseOrders.${poIndex}.recipientAddress2`}
                                type="text"
                                placeholder="Enter Address 2"
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientAddress2`} component="p" className={styles.errorMessage} />
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientCountryCode`}>
                                Recipient Country Code
                              </label>
                             <Field
                                as="select"
                                id={`purchaseOrders.${poIndex}.recipientCountryCode`}
                                value={values.purchaseOrders[poIndex].recipientCountryCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const { value } = e.target;
                                  setFieldValue(`purchaseOrders.${poIndex}.recipientCountryCode`, value);
                                  setFieldValue(`purchaseOrders.${poIndex}.recipientState`, '');
                                  if(value) {
                                    getStates(value, poIndex);
                                  } else {
                                    setStatesMap(prevMap => {
                                      const newMap = new Map(prevMap);
                                      newMap.delete(poIndex); // Clear states for this PO if no country selected
                                      return newMap;
                                    });
                                  }
                                }}
                              >
                                <option value="">Select country code</option>
                                {countries.map((country: Country) => <option key={country.id} value={country.id}>{country.threeLetterCode}</option>)}
                              </Field>
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientCountryCode`} component="p" className={styles.errorMessage} />
                            </li>
                            <li className={styles.stateZipRow}>
                              <div className={styles.stateField}>
                                <label htmlFor={`purchaseOrders.${poIndex}.recipientState`}>
                                  Recipient State
                                </label>
                               <Field
                                  as="select"
                                  id={`purchaseOrders.${poIndex}.recipientState`}
                                  name={`purchaseOrders.${poIndex}.recipientState`}
                                  placeholder="Enter State"
                                >
                                  <option value="">Select state</option>
                                  {(statesMap.get(poIndex) || []).map((state: State) => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                  ))}
                                </Field>
                                <ErrorMessage name={`purchaseOrders.${poIndex}.recipientState`} component="p" className={styles.errorMessage} />
                              </div>
                              <div className={styles.zipField}>
                                <label htmlFor={`purchaseOrders.${poIndex}.recipientZip`}>
                                  Recipient Zip
                                </label>
                                <Field
                                  id={`purchaseOrders.${poIndex}.recipientZip`}
                                  name={`purchaseOrders.${poIndex}.recipientZip`}
                                  type="text"
                                  placeholder="Enter Zip Code"
                                  maxLength="5"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const { value } = e.target;
                                  const strippedValue = value.replace(/\D/g, '');
                                  setFieldValue(`purchaseOrders.${poIndex}.recipientZip`, strippedValue);
                                }}
                                />
                                <ErrorMessage name={`purchaseOrders.${poIndex}.recipientZip`} component="p" className={styles.errorMessage} />
                              </div>
                            </li>
                            <li>
                              <label htmlFor={`purchaseOrders.${poIndex}.recipientPhoneNumber`}>
                                Recipient Phone Number (Optional)
                              </label>
                              <Field
                                id={`purchaseOrders.${poIndex}.recipientPhoneNumber`}
                                name={`purchaseOrders.${poIndex}.recipientPhoneNumber`}
                                type="text"
                                placeholder="Enter Phone Number"
                                maxLength="10"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const { value } = e.target;
                                  const strippedValue = value.replace(/\D/g, '');
                                  setFieldValue(`purchaseOrders.${poIndex}.recipientPhoneNumber`, strippedValue);
                                }}
                              />
                              <ErrorMessage name={`purchaseOrders.${poIndex}.recipientPhoneNumber`} component="p" className={styles.errorMessage} />
                            </li>
                          </ul>
                        </div>

                        {/* Items Section for this Purchase Order */}
                        <div className={styles.productItmPrt}>
                          <div className={styles.productItmTable}>
                            <div className={styles.proTableHead}>
                              <ul>
                                <li>Item</li>
                                <li>Quantity</li>
                                <li>Action</li>
                              </ul>
                            </div>
                            <FieldArray name={`purchaseOrders.${poIndex}.items`}>
                              {({ push: pushItem, remove: removeItem }) => (
                                <div className={styles.proTableBody}>
                                  {values.purchaseOrders[poIndex].items.map((item, itemIndex) => (
                                    <ul key={itemIndex}>
                                      <li data-label="Item" className={styles.selectItemDropdown}>
                                         <Autocomplete
                                            options={items}
                                            value={values.purchaseOrders[poIndex].items[itemIndex].itemSkuId || null}
                                            getOptionLabel={(option) => option?.sku}
                                            onChange={(event: any, newValue: any | null) => {
                                              setFieldValue(`purchaseOrders.${poIndex}.items.${itemIndex}.itemSkuId`, newValue);
                                            }}
                                            onInputChange={(event, newInputValue) => {
                                              setSearchQuery(newInputValue);
                                            }}
                                            loading={loading}
                                            renderOption={(props, option) => (
                                              <li {...props} key={itemIndex + option.skuId}>
                                              {option.sku}
                                              </li>
                                              )}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Select item"
                                                InputProps={{
                                                  ...params.InputProps,
                                                  endAdornment: (
                                                    <>
                                                      {params.InputProps.endAdornment}
                                                    </>
                                                  ),
                                                }}
                                              />
                                            )}
                                          />
                                        <ErrorMessage name={`purchaseOrders.${poIndex}.items.${itemIndex}.itemSkuId`} component="p" className={styles.errorMessage} />
                                      </li>
                                      <li data-label="Quantity" className={styles.quantityField}>
                                        <div className={styles.quantityBtnInput}>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setFieldValue(
                                                `purchaseOrders.${poIndex}.items.${itemIndex}.quantity`,
                                                Math.max(1, item.quantity - 1)
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-minus"></i>
                                          </button>
                                          <Field
                                            name={`purchaseOrders.${poIndex}.items.${itemIndex}.quantity`}
                                            type="number"
                                            min="1"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setFieldValue(
                                                `purchaseOrders.${poIndex}.items.${itemIndex}.quantity`,
                                                item.quantity + 1
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-plus"></i>
                                          </button>
                                        </div>
                                        <ErrorMessage name={`purchaseOrders.${poIndex}.items.${itemIndex}.quantity`} component="p" className="error-message" />
                                      </li>
                                      <li data-label="Action" className={styles.itemDeleteBtn}>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(itemIndex)}
                                          disabled={values.purchaseOrders[poIndex].items.length === 1}
                                        >
                                          <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                      </li>
                                    </ul>
                                  ))}
                                </div>
                              )}
                            </FieldArray>
                          </div>
                          <div className={styles.addItem}>
                            <button
                              type="button"
                              onClick={() => {
                                setFieldValue(`purchaseOrders.${poIndex}.items`, [...values.purchaseOrders[poIndex].items, { itemSkuId: null, quantity: 1 }]);
                                setSearchQuery('');
                              }}
                            >
                              <i className="fa-solid fa-circle-plus"></i>
                              <span>Add Additional Item</span>
                            </button>
                          </div>
                        </div>
                        
                    </div>
                  ))}

                  {/* Additional Po and  Submit Item Button */}
                  <div className={styles.addSubmitBtn}>
                    <ul>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            push(initialNewPurchaseOrder);
                            setSearchQuery('');
                          }}
                          className={styles.addPoBtn}
                          disabled={poFormLoading}
                        >
                          <span>Add additional PO</span>
                        </button>
                      {/* Ensure errors.purchaseOrders is a string before rendering */}
                      {touched.purchaseOrders && typeof errors.purchaseOrders === 'string' && (
                        <div className="error-message">{errors.purchaseOrders}</div>
                      )}
                      </li>
                      <li>
                        <button
                          type="submit"
                          className={styles.submitBtn}
                          disabled={poFormLoading}
                        >
                          Submit Purchase Items
                        </button>
                      </li>
                    </ul>
                  </div>                    
                </>
              )}
            </FieldArray>
            
          </Form>
          )}
        </Formik>        

      </div>
     
    </div>
    </>
  );
};

export default AddProduct;
