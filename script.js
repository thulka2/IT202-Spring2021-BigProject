let parkJSON;
let uniqueZips = [];
let map;

let drawerList;

let db = new Dexie("basic_database");

// chip name -> json entry name
const amenityMap = {
    'Basketball': 'basketball, basketba_1',
    'Baseball': 'baseball_j, baseball_s, baseball_b',
    'Beach': 'beach',
    'Boat Launch': 'boat_lau_1, boat_launc',
    'Football': 'football_s',
    'Gymnasium': 'gymnasium',
    'Handball': 'handball_i, handball_r',
    'Minigolf': 'minigolf',
    'Playground': 'playground, playgrou_1',
    'Pool (Indoor)': 'pool_indoo',
    'Pool (Outdoor)': 'pool_outdo',
    'Skate Park': 'skate_park',
    'Tennis': 'tennis_cou'

}

// zipcode => longitude and latitude 
let zipcodeMap = {

}

let slider;
function initMap() {
      map = new google.maps.Map(document.querySelector("#map-container"), {
          center: {lat: 41.869, lng: -87.649},
          zoom: 11,
      });

}


window.addEventListener('DOMContentLoaded', (event) => {

    document.querySelectorAll(".screen").forEach((screen) => {
        screen.style.display = "none"; // get of all screens at the start
    })

    // open the home page by default
    document.querySelector('#home').style.display = "block";
    

    

    // get advice for each page load
    let adviceNormal;
    fetch('https://api.adviceslip.com/advice').then( (response) => {
        return response.json()})
    .then ( (json) => {
        //console.log(json);
        adviceNormal = json.slip.advice;
        document.querySelector('#home .adviceCard p').innerHTML = adviceNormal;
    })


    

    // shell contents
    const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar'));
    const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    topAppBar.setScrollTarget(document.querySelector('#main-content'));

    let hamburgerButton = document.querySelector('.mdc-top-app-bar__navigation-icon');
    hamburgerButton.addEventListener( "click", () => {
        drawer.open = !drawer.open;
    });

    // filter
    slider = mdc.slider.MDCSlider.attachTo(document.querySelector('.mdc-slider'));

    let textFields = document.querySelectorAll('.mdc-text-field');
    textFields.forEach ((tf) => {
        mdc.textField.MDCTextField.attachTo(tf);
    })

    let buttons = document.querySelectorAll('.mdc-button');

    buttons.forEach( (bt)=> {
        mdc.ripple.MDCRipple.attachTo(bt);
    })

    document.querySelector('.mdc-slider').addEventListener("MDCSlider:change", () => {
        // console.log(slider.getValue());
        document.querySelector('#maxmiles p').innerHTML = `${slider.getValue()}  miles`;
    })

    drawerList = mdc.list.MDCList.attachTo(document.querySelector('.mdc-drawer__content .mdc-list'));
    
    const snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));

    // if(document.querySelector('.mdc-slider')) {

    // }

    // drawer settings
    document.querySelectorAll('.mdc-list a').forEach(element => {
        //console.log(element);
        element.addEventListener( "click", (event) => {

            document.querySelectorAll(".screen").forEach((screen) => {
                screen.style.display = "none"; // get rid of the open screens
            })

        
        
            let screen = event.target.getAttribute("data-screen");
            if (screen == "map") {
                updateMap();
            }

           
            let targetScreen = document.querySelector("#" + screen);
            targetScreen.style.display = "block"; // display only the selected screen
            if (screen == "filter") {
               
                slider.setValue(slider.getValue());
                slider.layout();
            }
            //console.log(element.getAttribute('data-screen'));

        })
    });

    
   
    

    // get park data
    //https://data.cityofchicago.org/resource/ejsh-fztr.json



    fetch(' https://data.cityofchicago.org/resource/ejsh-fztr.json').then( (response) => {
        return response.json()})
    .then ( (json) => {
        parkJSON = json;
        parkJSON = parkJSON.filter(park => park.location); // only keep parks with locations set
        //console.log(parkJSON);
        let zips = [];
        parkJSON.forEach( (park) => {
            let parsed = parseInt(park.zip);
            if (!isNaN(parsed)) {
                zips.push(parsed);
            }

            //const location = { lat: parseFloat(park.the_geom.coordinates[0][0][0][0]), lng: parseFloat(park.the_geom.coordinates[0][0][0][1])};
                    
            //console.log(location);


            // const contentString = 
            //    "hey"


            // const infowindow = new google.maps.InfoWindow({
            //      content: contentString,
            // });

            // const marker = new google.maps.Marker({
            //     position: location,
            //     map,
            //     title: "ID: "
            // });

            // marker.addListener("click", () => {
            //     infowindow.open(map, marker);
            // });
        })

        uniqueZips = [...new Set(zips)];
        uniqueZips.sort();
        //console.log(uniqueZips);
        document.querySelector("#numparksdisplayed").innerHTML = `Total parks displayed: ${parkJSON.length}`;

    })

    // get location data for each zipcode 
    fetch('https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=Chicago&rows=100&facet=state&facet=timezone&facet=dst').then( (response) => {
        return response.json()})
    .then ( (json) => {
        //console.log(json);
        json.records.forEach( (entry) => {
            
            if (uniqueZips.includes(parseInt(entry.fields.zip))) {
                // if zip is in city of chicago                
                zipcodeMap[String(entry.fields.zip)] = entry.fields.geopoint;
            }
        })
    })

    
    // add amenity chips
    const chipSetEl = document.querySelector('.mdc-chip-set');
    const chipSet = mdc.chips.MDCChipSet.attachTo(chipSetEl);

    const templateChip = document.querySelector('#templateChip');
    for (const [key, value] of Object.entries(amenityMap)) {
        let tmp = templateChip.cloneNode(true);
        tmp.querySelector('.mdc-chip__text').innerHTML = key;
        tmp.removeAttribute('id');
    
        chipSetEl.appendChild(tmp);
        chipSet.addChip(tmp)

    }

    document.querySelector('#templateChip').style.display = 'none';
    chipSetEl.removeChild(templateChip);

    
    let filterButton = document.querySelector('#applyFilter'); 
    filterButton.addEventListener('click', () =>  {
        let success = true;


        let errorMsg = document.querySelector('#errorZip');
        let enteredZip = document.querySelector('#zipcodeTF').value
        if (enteredZip == '') {
            document.querySelector('.mdc-snackbar__label').innerHTML = "Zip code is required."
            success = false;
           
        }

        else if (zipcodeMap[parseInt(enteredZip)] == null) {
            document.querySelector('.mdc-snackbar__label').innerHTML = "Provided zipcode is not in Chicago or currently available."
            success = false;
        }


        if (success) {
            errorMsg.style.display = 'none';
            let selectedChips = chipSet.selectedChipIds;
            let propertiesToCheck = [];
            selectedChips.forEach((chip) => {
          
                let pos = parseInt(chip.split('-')[2]);
                let key = chipSet.chips[pos].root.querySelector('.mdc-chip__text').innerHTML;
                let value = amenityMap[key];
                let properties = value.split(',');
                properties.forEach( (p) => {
                    propertiesToCheck.push(p.trim());
                });
            })

            //console.log(`all properties: ${propertiesToCheck}`);
            document.querySelectorAll(".screen").forEach((screen) => {
                screen.style.display = "none"; // get rid of the open screens
            })

            let filteredData = [];
            propertiesToCheck.forEach( (prop) => {
                let f = parkJSON.filter( p => parseInt(p[prop]) > 0);
                f.forEach ( (park) => {
                    filteredData.push(park);
                })
            })

            uniqueParks = [...new Set(filteredData)];
            if(uniqueParks.length == 0) {
                // empty set means no filters selected so use park json
                uniqueParks = parkJSON;
            }

            // now grab only parks within given radius 
            let miles = slider.getValue();
            let maxDistance = miles * 1.60934;

            uniqueParks = uniqueParks.filter ( p => getDistance(p, enteredZip) <= maxDistance);
        

            updateMap(uniqueParks, {lat: zipcodeMap[parseInt(enteredZip)][0], lng: zipcodeMap[parseInt(enteredZip)][1]});
            drawerList.selectedIndex = 2; // set selection to map
    
           
           
            let targetScreen = document.querySelector("#map");
            targetScreen.style.display = "block"; // display the map
        } else {
            errorMsg.style.display = 'block';
            snackbar.open();
        }

        success = false;
       

        
    });



   

    
});
 


let updateMap = (json = parkJSON, c = {lat: 41.869, lng: -87.649}) => {
    let tmp = json;
    map = new google.maps.Map(document.querySelector("#map-container"), {
        center: c,
        zoom: 11,
    });

    tmp.forEach( (park) => {
      
        let index = parseInt((park.the_geom.coordinates[0][0]).length / 4);
        
        const location = { lat: parseFloat(park.the_geom.coordinates[0][0][index][1]), lng: parseFloat(park.the_geom.coordinates[0][0][index][0])};
        
        const contentString = 
            `<h5>${park.park} ${park.park_class} </h5>
            <h6>${park.location}, Chicago, IL, ${park.zip} </h6>`;


        const infowindow = new google.maps.InfoWindow({
            content: contentString,
        });

           
        const marker = new google.maps.Marker({
            position: location,
            map,
            title: `${park.park} ${park.park_class}`
        });

        marker.addListener("click", () => {
            infowindow.open(map, marker);
        });

       
    })
    document.querySelector("#numparksdisplayed").innerHTML = `Total parks displayed: ${tmp.length}`;
}


// takes a park object and determines its lat, long and calls _getDistance
let getDistance = (park, enteredZip) => {
    let index = parseInt((park.the_geom.coordinates[0][0]).length / 4);
    let lat = parseFloat(park.the_geom.coordinates[0][0][index][1]);
    let long = parseFloat(park.the_geom.coordinates[0][0][index][0]);
    //console.log(_getDistance(zipcodeMap[parseInt(enteredZip)][0], zipcodeMap[parseInt(enteredZip)][1],  lat, long))
    return(_getDistance(zipcodeMap[parseInt(enteredZip)][0], zipcodeMap[parseInt(enteredZip)][1],  lat, long));
}

// gets distance between the origin (A zipcode geolocation) and a park 
let _getDistance = (originLat, originLong, parkLat, parkLong) => {
    let distance = 0;

    //console.log(`${originLat}, ${originLong}, ${parkLat}, ${parkLong}`);
    Math.radians = function(deg) {
        return deg * (Math.PI / 180);
    }

    let lat1 = Math.radians(originLat);
    let lng1 = Math.radians(originLong);
    let lat2 = Math.radians(parkLat);
    let lng2 = Math.radians(parkLong);

    distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) +
				Math.cos(lat1) * Math.cos(lat2) *
				Math.cos(lng1 - lng2)) * 6371.01; // 6371.01 is the approx radius of the earth in km

    return distance; 
}