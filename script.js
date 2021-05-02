let parkJSON;
let uniqueZips = [];
let map;

let drawerList;
let snackbar; 
let favList;
let db = new Dexie("my_database");

let video;

let currentStream;
let selectedCamera;

function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
        track.stop();
    });
}

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

    video = document.querySelector('#video');
    const cameraButtons = document.querySelector('#controls');
    const captureButton = document.getElementById('capture');
    let snapshot = document.getElementById( "captured" );
    let capture = document.getElementById( "capturec" );


    captureButton.addEventListener("click", () => {
        var ctx = capture.getContext( '2d' );
		var img = new Image();

		ctx.drawImage( document.querySelector('#video'), 0, 0, capture.width, capture.height );
        let data = capture.toDataURL( "image/png" );
		img.src		= data;
		img.width	= 240;

		snapshot.innerHTML = '';
        db.pics.add({object: data});
		snapshot.appendChild( img );
    })
    // db.open();
    db.version(1).stores({
        parks: 'name, address,images',
        pics: 'id++, object'
    });

    db.open();

    

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
    drawerList.listElements.forEach((listItemEl) =>{ mdc.ripple.MDCRipple.attachTo(listItemEl) });
    //favList = mdc.list.MDCList.attachTo(document.querySelector('#favorites .mdc-list'));
    
    snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));

    // if(document.querySelector('.mdc-slider')) {

    // }

    // drawer settings
    document.querySelectorAll('.mdc-drawer__content .mdc-list a').forEach(element => {
        //console.log(element);
        element.addEventListener( "click", (event) => {

            document.querySelectorAll(".screen").forEach((screen) => {
                screen.style.display = "none"; // get rid of the open screens
            })

        
        
            let screen = event.target.getAttribute("data-screen");
            if (screen == "map") {
                updateMap();
            }

            if (screen == "favorites") {
                updateMyParks();
                if (typeof currentStream !== 'undefined') {
                    stopMediaTracks(currentStream);
                }
                //console.log(selectedButton);
                const videoConstraints = {};
                if (selectedCamera === '') {
                    videoConstraints.facingMode = 'environment';
                } else {
                    videoConstraints.deviceId = { exact: selectedCamera };
                }
                const constraints = {
                    video: videoConstraints,
                    audio: false
                };
            
                navigator.mediaDevices
                .getUserMedia(constraints)
                .then(stream => {
                currentStream = stream;
                video.srcObject = stream;
                return navigator.mediaDevices.enumerateDevices();
                })
                .then(gotDevices)
                .catch(error => {
                console.error(error);
                });
            
                function gotDevices(mediaDevices) {
                    cameraButtons.innerHTML = '';
                    let count = 1;
                    mediaDevices.forEach(mediaDevice => {
                        if (mediaDevice.kind === 'videoinput') {
                        const btn = document.createElement('button');
                        btn.value = mediaDevice.deviceId;
                        const label = mediaDevice.label || `Camera ${count++}`;
                        const textNode = document.createTextNode(label);
                        btn.appendChild(textNode);
                        btn.addEventListener('click', event => {
                            selectedCamera = btn.value;
                            // if (typeof currentStream !== 'undefined') {
                            //     stopMediaTracks(currentStream);
                            // }
                            // const videoConstraints = {};
                            if (selectedCamera === '') {
                                videoConstraints.facingMode = 'environment';
                            } else {
                                videoConstraints.deviceId = { exact: selectedCamera };
                            }
                            // const constraints = {
                            //     video: videoConstraints,
                            //     audio: false
                            // };
                        
                            // navigator.mediaDevices
                            // .getUserMedia(constraints)
                            // .then(stream => {
                            // currentStream = stream;
                            // video.srcObject = stream;
                            // return navigator.mediaDevices.enumerateDevices();
                            // })
                            // .then(gotDevices)
                            // .catch(error => {
                            // console.error(error);
                            // });
                        })
                        cameraButtons.appendChild(btn);
                        }
                    });
                }
                
                
            
               
                navigator.mediaDevices.enumerateDevices().then(gotDevices);
            
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
        let parkName = `${park.park} ${park.park_class}`

        let infoDiv = document.createElement('div');
        //let buttonObj = document.createElement('<button class="mdc-icon-button material-icons small-icon notFaved">favorite</button> ');
        let buttonObj = document.createElement('button');
        buttonObj.setAttribute('class', 'mdc-icon-button material-icons small-icon notFaved');

        
        buttonObj.innerHTML = 'favorite';
        db.parks.where("name").equals(parkName).count().then( (resp) => {
            if (resp == 1) {
                //console.log("Exists");
                buttonObj.classList.remove('notFaved');
                buttonObj.classList.add('Faved');
            } else {
                //console.log("Does not exist");
            }
        });
       
        
        let h5 = document.createElement('h5');
        h5.innerHTML = parkName;
        h5.appendChild(buttonObj);

        let parkAddress = `${park.location}, Chicago, IL, ${park.zip}`;
        let h6 = document.createElement('h6');
        h6.innerHTML = parkAddress;

        infoDiv.appendChild(h5);
        infoDiv.appendChild(h6);
    

        
        const infowindow = new google.maps.InfoWindow({
            content: infoDiv,
        });

           
        const marker = new google.maps.Marker({
            position: location,
            map,
            title: `${park.park} ${park.park_class}`
        });

        marker.addListener("click", () => {
            infowindow.open(map, marker);
        });

        infowindow.content.querySelector('button').addEventListener("click", (e) => {
            if (e.target.classList.contains('notFaved')) {
                // add to the database
                e.target.classList.remove('notFaved');
                e.target.classList.add('Faved');
                db.parks.add({name: parkName, address: parkAddress, images: []});


            } else {
                // remove from database
                e.target.classList.remove('Faved');
                e.target.classList.add('notFaved');
                document.querySelector('.mdc-snackbar__label').innerHTML = `Removed ${parkName} from favorites.`;
                snackbar.open();

                db.parks.delete(parkName);
            }
        })


       
    })
    document.querySelector("#numparksdisplayed").innerHTML = `Total parks displayed: ${tmp.length}`;
}

let updateMyParks = () => {


    let favList = document.querySelector('#favorites .mdc-list');
    favList.innerHTML = '';

    db.pics.toArray().then( (resp) => {
        resp.forEach ( (pic) => {
            let t = new Image();
            t.src = pic.object;
            t.width = 100;
            document.getElementById( "captured" ).appendChild(t);
        })
    })

    db.parks.toArray().then( (resp) => {
        resp.forEach ( (fav) => {
       
            let tmp = document.createElement('li');
            tmp.setAttribute('class', 'mdc-list-item listPadding');

            let btn = document.createElement('button');
            btn.setAttribute('class', 'mdc-icon-button material-icons ourgreen');
            btn.innerHTML = 'delete_forever';

            let spn = document.createElement('span');
            spn.setAttribute('class', "mdc-list-item__text");

            let rp = document.createElement('span');
            rp.setAttribute('class', "mdc-list-item__ripple");

            //let linkToApp = document.createElement('a');
            let url = fav.name + ' ' + fav.address;
            url = url.replaceAll(' ', '+');
            //linkToApp.setAttribute('href', `http://maps.google.com/?&q=${url}`);



            let n = document.createElement('p');
            n.setAttribute('class', "mdc-list-item__primary-text lightgreen");
            n.innerHTML = fav.name;

            let a = document.createElement('p');
            a.setAttribute('class', 'mdc-list-item__secondary-text');
            a.innerHTML = fav.address;

            
            spn.appendChild(rp);
            spn.appendChild(n);
            spn.appendChild(a);
            

            tmp.appendChild(btn);
       
            tmp.appendChild(spn);

            tmp.querySelector('span').addEventListener("click", (e) => {
                window.open(`http://maps.google.com/?&q=${url}`);
            })

            tmp.querySelector('button').addEventListener("click", (e) => {
                document.querySelector('.mdc-snackbar__label').innerHTML = `Removed ${fav.name} from favorites.`;
                snackbar.open();
                db.parks.delete(fav.name);
                favList.removeChild(tmp);
            });

            favList.appendChild(tmp);
            
        })
    })
    
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