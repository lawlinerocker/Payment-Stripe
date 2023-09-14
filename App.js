import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import  StripeApp  from './src/StripeApp';
import React from "react"
import { StripeProvider } from '@stripe/stripe-react-native';
export default function App() {
  return (
    <StripeProvider
      publishableKey='pk_test_51MZcCtCZp5yHCVLLauwAwoC54CoJZS0j7xt974JeCBl85RfpR4NPF1JEmBFF7AxkXjrFj6Lp7luD47K4Jo5nuITW00ca68xEpx'
    >
      <StripeApp/>
    </StripeProvider>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
