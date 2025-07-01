export interface VerifyOtpPayload {
  otp: string;
  email: string;
  verifyPageToken: string;
}
export interface GoogleLoginPayload {
  email: string;
  name: string;
  verify_page_token: string;
}
export interface SendOtpResponse {
  verifyPageToken: string;
  message: string;
}
export interface DecodeGoogleTokenResponse {
  email: string;
  name: string;
}
export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePictureUrl: string | null;
  }
}