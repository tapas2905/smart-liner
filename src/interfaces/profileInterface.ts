export interface ProfileInterface {
  name: string | null;
  userCode: string | null;
  shippingMethod: string | null;
  discountPercentage: string | null;
  accountEmail: string | null;
  invoiceEmail: string;
  profilePictureUrl?: string | null;
}