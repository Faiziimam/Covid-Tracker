import React,{useEffect, useState} from "react";
import './App.css';
import {Card, CardContent, FormControl,MenuItem,Select} from "@material-ui/core";
import InfoBox from "./Infobox";
import Map from "./Map"
import Table from "./Table"
import { sortData } from "./util"
import LineGraph from "./LineGraph"
import "leaflet/dist/leaflet.css";
import numeral from "numeral";
import {  prettyPrintStat } from "./util";
function App() {
  
 const [countries,setCountries]=useState([]);
 const [country,setCountry]=useState("worldwide");
 const [countryInfo,setCountryInfo]=useState({});
 const [tableData,setTableData]=useState([]);
 const [mapCenter,setMapCenter]=useState({lat: 34.80746, lng: -40.4796})
 const [mapZoom, setZoom]=useState(3);
 const [mapCountries,setMapCountries]=useState([]);
 const [casesType,setCasesType]=useState("cases");
 //useEffect is a piece of code it works on the basis of given condition.
 useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=>response.json())
    .then((data)=>{
      setCountryInfo(data);
    });
 },[]);


 useEffect(()=>{

  const getCountriesData=async()=>{
     await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>response.json())
    .then((data)=>{
       const countries= data.map((country)=>({
           name:country.country,
           value:country.countryInfo.iso2 //iso=> return shortForm of countries i.e United State of America=usa
         }));
         const sortedData=sortData(data);
         setCountries(countries);
         setMapCountries(data);
         setTableData(sortedData);
    })
  };
  getCountriesData();
 },[]);
//  
   const onCountryChange=(event)=>{
        const countryCode=event.target.value;
        setCountry(countryCode);

    const url=
      countryCode==="worldwide"
      ?"https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`
  
       fetch(url)
      .then((response)=>response.json())
      .then((data)=>{
          setCountry(countryCode);

            //All of the data from the JSON
          setCountryInfo(data);
          setMapCenter([data.countryInfo.lat,data.countryInfo.long])
          setZoom(4)

      });

   };
    console.log("Hellow",countryInfo);

  return (
    <div className="app">

    <div className="app_left">
    <div className="app_header">
       <h1>COVID-19 TRACKER</h1>
       <FormControl className="app_dropdown">
       <Select 
        onChange={onCountryChange}
        variant="outlined"
        value={country}
       >
        <MenuItem value="worldwide">WorldWide</MenuItem>
       {countries.map(country=>(
        <MenuItem value={country.value}>{country.name}</MenuItem>
       ))}
      
      </Select>
      </FormControl>
       </div>

   <div className="app_stats">
   <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
   
   </div>
    <Map
    countries={mapCountries}
    casesType={casesType}
    center={mapCenter}
    zoom={mapZoom}
      />
    </div>
    <Card className="app_right">
    <h3>Live Cases By Country</h3>
    <Table countries={tableData}/>
    <h3>WorldWide New {casesType}</h3>
    <LineGraph className="app_graph" casesType={casesType} />

     <CardContent>
     </CardContent>
    </Card>
    </div>
  );
}

export default App;
