/*global google*/
import React, {useCallback, useMemo, useRef, useState} from "react";
import logo from "./logo.svg"
import { formatRelative} from 'date-fns'
import {GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  InfoWindow,
    Circle,
    DirectionsRenderer,} from "react-google-maps";

function Map() {
  const [selectedpark, setSelectedpark]=useState(null);
  const [waypoints, setWaypoints]=useState([]);
  console.log(waypoints);
  const [markers, setMarkers]=useState([]);

  const onMapClick = useCallback((event)=>{setMarkers((current)=>[
      ...current,{
          lat:event.latLng.lat(),
          lng:event.latLng.lng(),
          time: new  Date()
      }
  ]);
      setWaypoints((current)=>[
          ...current,{location:{
              lat:event.latLng.lat(),
              lng:event.latLng.lng(),
          }}
      ])},[markers]);
  //useState will casue re-render, useRef will not, data in it can be used anywhere
  const mapRef =useRef();

  const onMapload =useCallback((map)=>{
      mapRef.current=map;
  },[]);

  const options= useMemo(
      ()=>({
          disableDeaultUI:true,
          clickableIcons:false,
      }),[]);

  const center=useMemo(()=>({lat:-33.865143,lng:151.209900}),[])
    // const waypointsList=useMemo(()=>([
    //     {location:{lat:-33.855143,lng:151.204900}},
    //     {location:{lat:-33.845143,lng:151.274900}}
    // ]),[])
  const [directions,setDirections] = useState();

  const fetchDirections=(target)=>{
      if (!center) return;
      const  service= new google.maps.DirectionsService();
      let lasttarget=waypoints.pop();
      service.route(
          {
              origin:center,
              destination:target,
              travelMode: google.maps.TravelMode.DRIVING,
              waypoints:waypoints
          },
          (result, status)=>{
              if (status==="OK" && result){
                    setDirections(result);
              }
          }
      );
      setWaypoints((current)=>[
          ...current,lasttarget
      ])
  }
  const svgFunction=(number)=>{
      let svg= `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" x="0" y="0" viewBox="0 0 64 64"
     style="enable-background:new 0 0 512 512" xml:space="preserve"><g><g xmlns="http://www.w3.org/2000/svg" id="Map_Pin-2" data-name="MapPin"><path d="m32 0a24.028 24.028 0 0 0 -24 24c0 16.228 22.342 38.756 23.293 39.707a1 1 0 0 0 1.414 0c.951-.951 23.293-23.479 23.293-39.707a24.028 24.028 0 0 0 -24-24z" fill="#FB5968" data-original="#fb5968"></path> <circle
        cx="32" cy="24" fill="#D8304C" r="13" data-original="#d8304c"></circle></g><text x="50%" y="28"
                                                                                                      fill="white"
                                                                                                      font-weight="bold"
                                                                                                      dominant-baseline="middle"
                                                                                                      text-anchor="middle"
                                                                                                      font-size="1.4em"
                                                                                                      font-family="Roboto">${number}</text></g></svg>`
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  return (
      <>
      {/*<button style={{position:"absolute",top:"100px"} } >start</button>*/}
      <GoogleMap
          defaultZoom={10}
          defaultCenter={{lat: -33.865143, lng: 151.209900}}
          onClick={onMapClick}
          onLoad={onMapload}
          options={options}
      >
          {directions && <DirectionsRenderer directions={directions} options={
              {suppressMarkers: true}
          } />}
        {markers.map((marker,index)=>(
            <Marker
                key={marker.time.toISOString()}
                position={{lat:marker.lat,lng:marker.lng}}
                icon={{
                  url:svgFunction(index+1),
                  scaledSize: new window.google.maps.Size(30,30),
                    origin: new window.google.maps.Point(0,0),
                    anchor:new window.google.maps.Point(15,15),
                }}
                onClick={()=>{
                  setSelectedpark(marker);
                  fetchDirections({lat:marker.lat,lng:marker.lng}); // Still have problems
                }}
            />
        ))}
          {/*<Circle center={{lat: -33.865143, lng: 151.209900}} radius={15000}/>*/}
        {selectedpark ? (
            <InfoWindow
                position={{
                  lat:selectedpark.lat,
                  lng:selectedpark.lng
                }}
                onCloseClick={()=>{
                  setSelectedpark(null);
                }}
            >
                <div>
                <p>Created At {formatRelative(selectedpark.time, new Date())}</p>
                    <p>{selectedpark.lat}</p>
                </div>
            </InfoWindow>
        ):null}
      </GoogleMap>
      </>);
}

const Wrappedmap = withScriptjs(withGoogleMap(Map));

// const libraries=["places"];

export default function App() {
    // const {isLoaded, loadError} =useLoadScript({
    //     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    //     libraries,
    // });
    //
    // if(loadError) return "Error loading maps";
    // if(!isLoaded) return "Loading Maps";

  return (
      <div style={{width:"100vw", height:"100vh"}}>
        <Wrappedmap
            googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${
                process.env.REACT_APP_GOOGLE_MAPS_API_KEY
            }`}
            loadingElement={<div style={{height:"100%"}  }/>}
            containerElement={<div style={{height:"100%"}  }/>}
            mapElement={<div style={{height:"100%"}  }/>}
        />

      </div>
  )}
