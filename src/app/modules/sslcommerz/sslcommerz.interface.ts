export interface ISSLCommerzPayload {
  amount: number;
  transactionId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface ISSLCommerzResponse {
  status: string;
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
}
