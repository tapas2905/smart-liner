import * as Swal from "sweetalert2";
import { AlertType } from "../types/alertType";

const alert = (message: string, type: AlertType) => {
  return Swal.default.fire({
    title: message,
    icon: type,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });
};
export default alert;
