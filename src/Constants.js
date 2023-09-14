import {Platform} from 'react-native';

export const API_URL =
  Platform.OS === 'android' ? 'http://192.168.1.9:3000' : 'http://localhost:3000';
  Platform.OS === 'ios' ? 'http://192.168.1.9:3000' : 'http://localhost:3000';
export const MERCHANT_ID = 'merchant.com.stripe.react.native';