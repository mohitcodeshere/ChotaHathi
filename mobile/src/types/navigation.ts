export type RootStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: { phoneNumber: string };
  Home:  undefined;
  Booking: {
    serviceType: string;
    serviceTitle: string;
    loadType: string;
    city: string;
  };
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

export type AuthStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: { phoneNumber:  string };
};