let parkJSON;
let uniqueZips;
let map;
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



    const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar'));
    const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    topAppBar.setScrollTarget(document.querySelector('#main-content'));

    let hamburgerButton = document.querySelector('.mdc-top-app-bar__navigation-icon');
    hamburgerButton.addEventListener( "click", () => {
        drawer.open = !drawer.open;
    });

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
            console.log(element.getAttribute('data-screen'));

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

   

    
});
    // topAppBar.listen('MDCTopAppBar:nav', () => {
    //   drawer.open = !drawer.open;
    // });


let updateMap = () => {
    let tmp = parkJSON;
    map = new google.maps.Map(document.querySelector("#map-container"), {
        center: {lat: 41.869, lng: -87.649},
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