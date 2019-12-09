import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Keyboard,
  PermissionsAndroid,
  Linking,
  Platform
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import _ from 'lodash'
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/FontAwesome";
import socketIO from "socket.io-client";


import apiPlaces from '../api-places'
import apiKey from '../google-api-key'
import BottomButtom from '../components/BottonButton';


class Driver extends Component {
  constructor( props ){
    super(props)
    this.state = {
      latitude: 0,
      longitude: 0,
      error: null,
      pointCoords: [],
      lookingForPassengers: false,
      passengerFound: false,
      routeResponse: [],
      buttonText: "Find Passenger"
    }
    this.requestPassenger = this.requestPassenger.bind(this)
    this.acceptPassengerRrequest = this.acceptPassengerRrequest.bind(this)
    this.bottonButtonFunction = this.requestPassenger
  }


  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'NativeTaxi Location App Permission',
          message:
            'NativeTaxi needs access to your location ' +
            'to know your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the locatio');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  componentDidMount(){
    this.requestLocationPermission()
    Geolocation.getCurrentPosition(
        (position) => {
            console.log(position.coords);
            
            this.setState({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude
            })
            // this.setState({
            //   longitude: '-75.6034606',
            //   latitude: '6.2707108'
            // })
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
    
    //navigator.geolocation.getCurrentPosition()
  }


  async getRouteDirections(destinationPlaceId) {
    try {
      const response = await apiPlaces.directions.routes(apiKey, destinationPlaceId, this.state.longitude, this.state.latitude)
      
      if (response.status === "OK") {
        const points = PolyLine.decode(response.routes[0].overview_polyline.points);
        const pointCoords = points.map(point => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          routeResponse: response,
        });
        
        
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords, {
          edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
        });
      }

    } catch (error) {
      console.error(error);
    }
  }

  handleChangeText = destination =>{
    this.setState({
      destination
    })
    //this.onChangeDestinationDebounced(destination);
  }


  handleSubmitEditing(){
    this.onChangeDestination(this.state.destination)
  }
  handleTouchEnd(){


  }
  
  iconFlag = <Icon name="flag" color="red" size={20}/>
  getMarker(){
    return <Marker 
            coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
            icon={this.iconFlag}
            />
  }

  async requestPassenger(){
    this.setState({
      lookingForPassengers: true
    })
    this.socket = socketIO.connect('http://192.168.0.3:3000')

    this.socket.on('connect', ()=>{
      this.socket.emit('lookingForPassengers')
    })

    this.socket.on('taxiRequest', routeResponse => {
      console.log(routeResponse);
      this.getRouteDirections(routeResponse.geocoded_waypoints[0].place_id);
      this.setState({
        lookingForPassengers: false,
        passengerFound: true,
        routeResponse,
        buttonText: "Passenger Found, Accept Ride?"
      });
      this.bottonButtonFunction = this.acceptPassengerRrequest
      
    })
  }
  acceptPassengerRrequest(){
    console.log("Accepted passenger!!!");
    this.socket.emit("driverLocation", 
      {
        latitude: this.state.latitude, 
        longitude: this.state.longitude
      })
    
    const passengerLocation = this.state.pointCoords[
      this.state.pointCoords.length - 1
    ]

    if (Platform.OS === 'ios') {
      Linking.openURL(
        // `http://maps.apple.com/?daddr=${passengerLocation.latitude},${passengerLocation.longitude}`
        `maps:0,0?q=Passenger@${passengerLocation.latitude},${passengerLocation.longitude}`
        )
    } else {
      Linking.openURL(
        // `https://www.google.com/dir/?api=1&destination=${passengerLocation.latitude},${passengerLocation.longitude}`
        `geo:0,0?q=${passengerLocation.latitude},${passengerLocation.longitude}(Passenger)`
        )
    }

  }
  render(){
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          hidden={false} 
          translucent={true} 
          backgroundColor='#FFFFFF00' 
          barStyle='dark-content' 
        />
        <MapView
          ref={map => {
            this.map = map;
          }}
          //provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
          onTouchEnd={()=>this.handleTouchEnd()}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="red"
          />
          {this.state.pointCoords.length > 1 && this.getMarker()}
        </MapView>
        <BottomButtom
          showIndicator={this.state.lookingForPassengers}
          buttonText={this.state.buttonText}
          styleTouchable={styles.findButton}
          styleFindButtonText={styles.findButtonText}
          onPress={() => this.bottonButtonFunction()}
        />
        
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({

  destination: {
    borderWidth: 0.5,
    borderColor: "grey",
    height: 40,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  locationSuggestion: {
    backgroundColor: "white",
    borderColor: "grey",
    padding: 5,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  findButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'black',
    marginTop: 'auto',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignSelf: 'center'
  },
  findButtonText: {
    color: 'white'
  }
 });

export default Driver;
