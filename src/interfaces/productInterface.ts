export interface ProductListInterface {
  skuId: string | null;
  sku: string | null;
  yearStart: string | null;
  yearEnd: string | null;
  make: string | null;
  model: string;
  inventoryQuantity: number;
  mainWb: string | null;
  costAvg: number | null;
  discountedPrice: number | null;
}
export interface Item {
  itemSkuId: any;
  quantity: number;
}

export interface PurchaseOrder {
  purchaseOrder: string;
  purchaseDate?: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientAddress1: string;
  recipientAddress2?: string;
  recipientCountryCode: string;
  recipientState: string;
  recipientZip: string;
  recipientPhoneNumber?: string;
  items: Item[];
}

export interface FormDataField {
  purchaseOrders: PurchaseOrder[];
}

export interface Country {
  id: number;
  name: string;
  twoLetterCode: string;
  threeLetterCode: string;
}
export interface State {
  id: string;
  name: string;
  code: string;
}
