import React, { useState,useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { 
  CardField, 
  StripeProvider, 
  useConfirmPayment, 
  usePaymentSheet,
  Address,
  AddressDetails,
  PaymentSheetError,
  AddressSheet,
  BillingDetails,
  AddressSheetError,
  useStripe,
 } from "@stripe/stripe-react-native";

import {MERCHANT_ID,API_URL} from './Constants'


// //ADD localhost address of your server
// const API_URL = "http://192.168.1.11:3000";

const StripeApp=({PUBLISHABLE_KEY})=>{
  
  const [ready,setReady]=useState(false)
  const [loading,setLoading]=useState(false)
  const {initPaymentSheet,presentPaymentSheet,resetPaymentSheetCustomer}=usePaymentSheet()
  const [clientSecret,setClientSecret]=useState()
  const [addressSheetVisible,setAddressSheetVisible]=useState(false)
  const [paymentSheetEnabled,setPaymentSheetEnabled]=useState(false)
  

  useEffect(()=>{
    initialisePaymentSheet();
    
  }, [])
  
  const initialisePaymentSheet=async(shippingDetails?:AddressDetails)=>{
    const {paymentIntent,setupIntent,ephemeralKey,customer}= await fetchPaymentSheetParams()
    console.log(setupIntent)
    const address:Address={
      city: 'San Francisco',
      country: 'AT',
      line1: '510 Townsend St.',
      line2: '123 Street',
      postalCode: '94102',
      state: 'California',
    }
    const billingDetails:BillingDetails={
      name: 'Jane Doe',
      email: 'foo@bar.com',
      phone: '555-555-555',
      address: address,
    }

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
      

      customerId:customer,
      customerEphemeralKeySecret:ephemeralKey,
      // paymentIntentClientSecret:paymentIntent,
      setupIntentClientSecret:setupIntent,
      customFlow:false,
      merchantDisplayName:"xxTESTxx",
      allowsDelayedPaymentMethods:true,
      style:'automatic',
      returnURL:'stripe-example://stripe-redirect',
      defaultBillingDetails:billingDetails,
      defaultShippingDetails:shippingDetails,
     
      

      // defaultBillingDetails:{
      //   name:"Billy Joel",
      // },
      applePay:{
        merchantCountryCode:"TH",
        
      },
      googlePay:{
        merchantCountryCode:'TH',
        testEnv:true,
        currencyCode:'thb',
      }
    })
    if(!error){
      setPaymentSheetEnabled(true);

    }else if(error.code===PaymentSheetError.Failed){
      Alert.alert(`Paymentsheet init failed with error code: ${error.code}`,error.message)
    }else if(error.code===PaymentSheetError.Canceled){
      Alert.alert(`Paymentsheet init was canceled with code: ${error.code}`,error.message)
    }
  }


  const fetchPaymentSheetParams=async()=>{
    const response=await fetch(`${API_URL}/payment-sheet-setup-intent`,{
      method:"POST",
      headers:{
        'Content-Type':'application/json',
      }
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
    if(!clientSecret){
      return;
    }
    setLoading(true)

    const {error} = await presentPaymentSheet()
    if (!error){
      Alert.alert("Success","The payment was confirmed successfully!")
    }else{
      switch(error.code){
        case PaymentSheetError.Failed:
          Alert.alert(`PaymentSheet present failed with error code: ${error.code}`,
          error.message)
          setPaymentSheetEnabled(false)
          break

        case PaymentSheetError.Failed:
          Alert.alert(
            `PaymentSheet present was canceled with code: ${error.code}`,
            error.message)
            break

        case PaymentSheetError.Timeout:
          Alert.alert(
            `Paymentsheet present timed out: ${error.code}`
          )
          break
      }
      setLoading(false)
        
      
    }
  }
  async function buy(){
    if(!clientSecret){
      return;
    }
    setLoading(true)
    const {error} = await presentPaymentSheet()
    if (error){
      Alert.alert(`Error code: ${error.code}`,error.message)
    }else{
      Alert.alert("Success","The payment was confirmed successfully!")
      setLoading(false)
    }
  }
  return(
    <View style={styles.container}>
      <StripeProvider
          PUBLISHABLE_KEY={PUBLISHABLE_KEY}
          merchantIdentifier={MERCHANT_ID}
          onInit={initialisePaymentSheet}
        >
        <Button
          variant='default'
          loading={loading}
          disabled={!paymentSheetEnabled}
          title="Add shipping"
          onPress={()=>setAddressSheetVisible(true)}/>
        <Button
          variant='primary'
          loading={loading}
          disabled={!paymentSheetEnabled}
          title={
            paymentSheetEnabled && !loading ? 'Checkout' : 'Fetching payment intent...'
          }
          onPress={openPaymentSheet}/>
        <Button 
          variant='primary'
          loading={loading}
          disabled={!paymentSheetEnabled}
          title={
            paymentSheetEnabled && !loading ? 'trigger payment sheet timeout' : 'Fetching payment intent...'
          }
          onPress={async()=>{
            if(!clientSecret){
              return;
            }
            setLoading(true)
            const{error}=await presentPaymentSheet()
            if(error){
              Alert.alert(`${error.code}`,error.message)
            }
            setLoading(false)
          }}/>
        <AddressSheet
          visible={addressSheetVisible}
          onSubmit={async(result)=>{
            setPaymentSheetEnabled(false)
            setAddressSheetVisible(false)
            console.log(JSON.stringify(result,null,2))
            await initialisePaymentSheet(result)
          }}
          onError={(err)=>{
            if(err.code===AddressSheetError.Failed){
              Alert.alert('There was an error.','Check the logs for details.')
              console.log(err?.localizedMessage)
            }
            setAddressSheetVisible(false)
          }}
          presentationStyle={'popover'}
          animationStyle={'flip'}
          appearance={{}}
          defaultValues={{
            name: 'Michael Scott',
            phone: '111-222-3333',
            isCheckboxSelected: true,
            address: {
              country: 'United States',
              line1: 'Dunder Mifflin',
              postalCode: '12345',
              city: 'Scranton',
            },
          }}
          additionalFields={{
            phoneNumber:'required',
            checkboxLabel:'Send emails for more information update'
          }}
          allowedCountries={['TH']}
          autocompleteCountries={['TH']}
          primaryButtonTitle={"use this address"}
          sheetTitle={'ASDASDSAD'}
          />
        <Button 
          title='reset customer'
          onPress={async()=>{
            await resetPaymentSheetCustomer()
          }}/>
        <View style={styles.button}>
          <Button title={'Buy'} onPress={buy} disabled={loading ||!ready}/>
          
        </View>
        
        

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
