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

import {PUBLISHABLE_KEY,MERCHANT_ID,API_URL} from './Constants'


// //ADD localhost address of your server
// const API_URL = "http://192.168.1.11:3000";

const StripeApp=({PUBLISHABLE_KEY})=>{
  
  const [ready,setReady]=useState(false)
  
  const {loading,initPaymentSheet,presentPaymentSheet}=usePaymentSheet()
  const {resetPaymentSheetCustomer}=useStripe()
  const [clientSecret,setClientSecret]=useState()
  const [addressSheetVisible,setAddressSheetVisible]=useState(false)
  const [paymentSheetEnabled,setPaymentSheetEnabled]=useState(false)
  

  useEffect(()=>{
    initialisePaymentSheet();
    
  }, [])
  
  
  const initialisePaymentSheet=async(shippingDetails,AddressDetails)=>{
    const {paymentIntent,setupIntent,ephemeralKey,customer}= await fetchPaymentSheetParams()
    console.log(setupIntent)
    setClientSecret(setupIntent)
    const Address={
      city: 'San Francisco',
      country: 'AT',
      line1: '510 Townsend St.',
      line2: '123 Street',
      postalCode: '94102',
      state: 'California',
    }
    const BillingDetails={
      name: 'Jane Doe',
      email: 'foo@bar.com',
      phone: '555-555-555',
      address: Address,
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
      

      customerID:customer,
      customerEphemeralKeySecret:ephemeralKey,
      paymentIntentClientSecret:paymentIntent,
      setupIntentClientSecret:setupIntent,
      customFlow:false,
      merchantDisplayName:"xxTESTxx",
      allowsDelayedPaymentMethods:true,
      style:'automatic',
      returnURL:'stripe-example://stripe-redirect',
      defaultBillingDetails:BillingDetails,
      defaultShippingDetails:shippingDetails,
     
      

      // defaultBillingDetails:{
      //   name:"Billy Joel",
      // },
      // applePay:{
      //   merchantCountryCode:"TH",
      //   testEnv:true,
      //   currencyCode:'thb',
      // },
      // googlePay:{
      //   merchantCountryCode:'TH',
      //   testEnv:true,
      //   currencyCode:'thb',
      // }
    })
    if(!error){
      setPaymentSheetEnabled(true)
      setReady(true)

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
    setReady(true)

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
      setReady(false)
        
      
    }
  }
  const handlePayPress=async()=>{
    if(!clientSecret){
      return;
    }
    setReady(true)
    const {error,paymentIntent} = await presentPaymentSheet()
    if (error){
      Alert.alert(`Error code: ${error.code}`,error.message)
    }else{
      Alert.alert("Success","The payment was confirmed successfully!")
      setReady(false)
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
          onPress={()=>{setAddressSheetVisible(true)
          // console.log(paymentSheetEnabled)
          } }
          
          />
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
            setReady(true)
            const{paymentIntent,error}=await presentPaymentSheet({timeout:'100'},clientSecret,{
              type:'Card',
              BillingDetails:{
                email:'www.pzana@hotmail.co.th',
                name:'Jane Doe',
              }
            })
            if(error){
              Alert.alert(`${error.code}`,error.message)
            }else{
              Alert.alert(`Payment Successful. \nBilled for  ${paymentIntent?.amount}`)
            }
            setReady(false)
          }}/>
        {/* <AddressSheet
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
          /> */}
        <Button 
          title='reset customer'
          onPress={async()=>{
            await resetPaymentSheetCustomer()
          }}/>
        <View style={styles.button}>
          <Button title={'Buy'} onPress={handlePayPress} disabled={loading}/>
          
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
