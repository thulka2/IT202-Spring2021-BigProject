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
        console.log(json);
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
        console.log(element);
        element.addEventListener( "click", (event) => {

            document.querySelectorAll(".screen").forEach((screen) => {
                screen.style.display = "none"; // get rid of the open screens
            })

            let screen = event.target.getAttribute("data-screen");

            let targetScreen = document.querySelector("#" + screen);
            targetScreen.style.display = "block"; // display only the selected screen
            console.log(element.getAttribute('data-screen'));

        })
    });

    
});
    // topAppBar.listen('MDCTopAppBar:nav', () => {
    //   drawer.open = !drawer.open;
    // });