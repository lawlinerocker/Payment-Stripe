import React, { useState,useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { CardField, PlatformPayButton, StripeProvider, isPlatformPaySupported, useConfirmPayment, 
usePaymentSheet, usePlatformPay,useStripe } from "@stripe/stripe-react-native";
import {PUBLISHABLE_KEY,MERCHANT_ID,API_URL} from './Constants'



// //ADD localhost address of your server
// const API_URL = "http://192.168.1.11:3000";

const StripeApp=({PUBLISHABLE_KEY})=>{
  
  const [ready,setReady]=useState(false)
  const {initPaymentSheet,presentPaymentSheet,loading,resetPaymentSheetCustomer}=useStripe()
  const {isPlatformPaySupported,confirmPlatformPayPayment}=usePlatformPay()
  useEffect(()=>{
    initialisePaymentSheet();

  }, [])
  
  const initialisePaymentSheet=async()=>{
    const {paymentIntent,setupIntent,ephemeralKey,customer}= await fetchPaymentSheetParams()
    console.log(`setup intent token : ${paymentIntent} `)
    
    const {error}=await initPaymentSheet({
      appearance:{
        colors:{
          primary:'#FFB156', //#FFB156#40D727
          // background:'#ffffff',
          // componentBackground:'#abb2bf',
          componentDivider:'#e5c07b',
          primaryText:'#ffffff',
          icon:'#FFB156',
        
        },
        shapes:{
          borderRadius:25,
        }
      },

      customerID:customer,
      customerEphemeralKeySecret:ephemeralKey,
      paymentIntentClientSecret:paymentIntent,
      setupIntentClientSecret:setupIntent,
      merchantDisplayName:"xxTESTxx",
      allowsDelayedPaymentMethods:true,
      returnURL:'stripe-example://stripe-redirect',
      defaultBillingDetails:{
        name:"Jane Doe",
      },
      applePay:{
        merchantCountryCode:"TH",
      },
      googlePay:{
        merchantCountryCode:'TH',
        testEnv:true,
        currencyCode:'thb',
      }
    })
    if (error){
      Alert.alert(`Error code: ${error.code}`,error.message)

    }else{
      setReady(true)
    }
  }

  const fetchPaymentSheetParams=async()=>{
    // if(!(await isPlatformPaySupported())){
    //   Alert.alert(
    //     'Error',
    //     `${Platform.OS==='android'?'Google':'Apple'} Pay is not supported.`,
    //   )
    //   return
    // }
    const response=await fetch(`${API_URL}/payment-sheet`,{
      method:"POST",
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify({
       
        currency:'thb',
        items:['id-1'],
        request_three_d_secure:'any',
        
      })
    })
    const {paymentIntent,setupIntent,ephemeralKey,customer}=await response.json()
    return{
      paymentIntent,
      setupIntent,
      ephemeralKey,
      customer,
    }
  }

  const openPaymentSheet=async()=>{
    const {error}=await presentPaymentSheet()
    if(error){
      Alert.alert(`Error Code: ${error.code}`,error.message)

    }else{
      Alert.alert(`Success`,'Your payment method is successfully set up for future payment!s')
    }
  }

  const handlePayPress=async()=>{
    const {clientSecret,error} = await presentPaymentSheet()
    if (error){
      Alert.alert(`Error code: ${error.code}`,error.message)
    }else{
      Alert.alert("Success","The payment was confirmed successfully!")
      setReady(false)
    }
    const BillingDetails={
      name:'John Doe',
      email:'www.pzana@hotmail.co.th',

    }
  }
  return(
    <View style={styles.container}>
      <StripeProvider
          PUBLISHABLE_KEY={PUBLISHABLE_KEY}
          merchantIdentifier={MERCHANT_ID}
        >
        <View style={styles.button}>
          {/* <Button title={'Buy'} onPress={handlePayPress} disabled={loading || !ready}/> */}
          <Button
            variant='primary' 
            disabled={!ready}
            title={ loading ? 'Fetching payment intent...':'Checkout'  } 
            onPress={handlePayPress} 
            />
           
          {/* <PlatformPayButton
            onPress={handlePayPress} disabled={loading || !ready}/> */}
          {/* <Button title={'asdsad'} onPress={buy} disabled={loading || !ready}/> */}
        </View>
        <View>
        <Button
            variant='primary' 
            disabled={!ready}
            title={ loading ? 'Fetching payment setup...':'Setup'  } 
            onPress={openPaymentSheet} 
            /> 
        </View>
        {/* <Button
          title={'Logout'}
          onPress={async()=>{await resetPaymentSheetCustomer()}}/> */}
        </StripeProvider>
    </View>
  )
}
export default StripeApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent: "center",
    marginTop: 100,
   
   
  },
  button:{
    justifyContent:'center',
    flexDirection:"row",
    alignContent:'space-around',
    width:'50%'
  },
  input: {
    backgroundColor: "#efefefef",

    borderRadius: 8,
    fontSize: 20,
    height: 50,
    padding: 10,
  },
  card: {
    backgroundColor: "#efefefef",
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});
