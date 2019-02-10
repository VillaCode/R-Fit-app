import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Environment, ILatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import axios from 'axios';
interface OnInit {
  ngOnInit(): void
};
declare var google;
// let pathLocal = [], runPath;
let isTracking, startTime, endTime;
const options = {
  enableHighAccuracy: true, timeout: 30000,
};
//NO CRASHEES PLS
@Component({
  selector: 'page-corre',
  templateUrl: 'corre.html'
})
export class CorreTab implements OnInit {
  pathLocal: ILatLng[];
  isTracking: boolean;
  map: GoogleMap;
  // mapElement: HTMLElement;
  constructor(public navCtrl: NavController, public googleMaps: GoogleMaps, public geolocation: Geolocation) {

  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {


    try {
      this.pathLocal = [];
      Environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyADpe3tsTbjXVhsnGiu2TKzxqA1XH185to',
        'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyADpe3tsTbjXVhsnGiu2TKzxqA1XH185to'
      });
      // console.log("---------------hola------------\n\n\n");
      this.geolocation.getCurrentPosition(options).then((resp) => {
        // const location = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        let mapOptions: GoogleMapOptions = {
          camera: {
            target: {
              lat: resp.coords.latitude,
              lng: resp.coords.longitude
            },
            zoom: 21,
          }
        };
        this.map = GoogleMaps.create('map', mapOptions);
        // let HND_AIR_PORT: ILatLng = { lat: 35.548852, lng: 139.784086 };
        // let SFO_AIR_PORT: ILatLng = { lat: 37.615223, lng: -122.389979 };
        // this.pathLocal.push(HND_AIR_PORT);
        // this.pathLocal.push(SFO_AIR_PORT);
        // let polylineOptions = {
        //   points: this.pathLocal,
        //   // points: AIR_PORTS
        // }
        // this.map.addPolyline(polylineOptions).then((polyline)=>{

        //    console.log(polyline.getPoints());
        // });
      }).catch((error) => {
        console.log('Error getting location', error);
      });


    } catch (error) {
      alert('error de : ' + error);
    }
  }


  startTracking() {
    startTime = new Date();
    isTracking = true;
    this.geolocation.getCurrentPosition(options).then((resp) => {
      //console.log(resp);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
    window.setInterval(() => {
      if (!isTracking) {
        return
      }
      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.storePosition(resp);
        console.log(resp.coords.accuracy);
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }, 5000);
  }

  stopTracking() {
    isTracking = false;
    let distanciaTotal = 0;
    endTime = new Date();
    let timeDiff = endTime - startTime;
    timeDiff /= 1000;
    let seconds = Math.round(timeDiff);
    for (let i = 0; i < this.pathLocal.length - 1; i++) {
      console.log(this.getDistanceFromLatLonInKm(this.pathLocal[i].lat, this.pathLocal[i].lng, this.pathLocal[i + 1]
        .lat, this.pathLocal[i + 1].lng));
      distanciaTotal += this.getDistanceFromLatLonInKm(this.pathLocal[i].lat, this.pathLocal[i].lng, this.pathLocal[
        i + 1].lat, this.pathLocal[i + 1].lng)
    }
    //console.log(distanciaTotal,seconds);
    const Url = 'https://thawing-mountain-76893.herokuapp.com/profile/recibirDistancia';
    let informacionDeRun = {
      usuario_id: 8,
      distancia: distanciaTotal,
      fecha: new Date(),
      tiempo: seconds
    };
    let json = JSON.stringify(informacionDeRun);
    console.log(informacionDeRun);
    axios({
      method: 'post',
      url: Url,
      data: {
        json
      }
    })
      .then(data => console.log("Se envío" + JSON.stringify(data)))
      .catch(err => console.log("--------------------------------\n" + err + "\n-----------------"));
  }

  storePosition(position) {
    if (position.coords.accuracy < 80) {
      let latlng: ILatLng;
      latlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      this.pathLocal.push(latlng);
      if (this.pathLocal.length > 1) {
        let polylineOptions = {
          points: this.pathLocal,
        }
        this.map.addPolyline(polylineOptions).then((polyline) => {
          console.log("---------SE AÑADIO UN PUNTO---------");
        });
      }

      // runPath.getPath().push(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    }
    console.log(position.coords.accuracy);
  }
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

}
