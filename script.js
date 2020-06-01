let savedLocations = []
let currentLocation

function initialize() {
    savedLocations = JSON.parse(localStorage.getItem("weathercities"))
    if (savedLocations) {
        currentLocation = savedLocations[savedLocations.length - 1]
        showPrevious()
        getCurrent(currentLocation)
    }
    else {
        if (!navigator.geolocation) {
            getCurrent("Irvine")
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error)
        }
    }

}

function success(position) {
    let latitude = position.coords.latitude
    let longitude = position.coords.longitude
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&APPID=2457501a5cc91a21855f76272de1599a"
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLocation = response.name
        saveLoc(response.name)
        getCurrent(currentLocation)
    })

}

function error(){
    currentLocation = "Irvine"
    getCurrent(currentLocation)
}

function showPrevious() {
    if (savedLocations) {
        $("#prevSearches").empty()
        let btns = $("<div>").attr("class", "list-group")
        for (let i = 0; i < savedLocations.length; i++) {
            let locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i])
            if (savedLocations[i] == currentLocation){
                locBtn.attr("class", "list-group-item list-group-item-action active")
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action")
            }
            btns.prepend(locBtn)
        }
        $("#prevSearches").append(btns)
    }
}

function getCurrent(city) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=2457501a5cc91a21855f76272de1599a&units=imperial"
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1)
            localStorage.setItem("weathercities", JSON.stringify(savedLocations))
            initialize()
        }
    }).then(function (response) {
        let currCard = $("<div>").attr("class", "card bg-light")
        $("#earthforecast").append(currCard)

        let currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name)
        currCard.append(currCardHead)

        let cardRow = $("<div>").attr("class", "row no-gutters")
        currCard.append(cardRow)

        let iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"

        let imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"))
        cardRow.append(imgDiv)

        let textDiv = $("<div>").attr("class", "col-md-8")
        let cardBody = $("<div>").attr("class", "card-body")
        textDiv.append(cardBody)
       
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name))
        
        let currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a")
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)))
        
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"))
        
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"))

        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"))


        let uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=2457501a5cc91a21855f76272de1599a&lat=" + response.coord.lat + "&lon=" + response.coord.lat
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            let uvindex = uvresponse.value
            let bgcolor
            if (uvindex <= 3) {
                bgcolor = "green"
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow"
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange"
            }
            else {
                bgcolor = "red"
            }
            let uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ")
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex))
            cardBody.append(uvdisp)

        })

        cardRow.append(textDiv)
        getForecast(response.id)
    })
}

function getForecast(city) {
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=2457501a5cc91a21855f76272de1599a&units=imperial"
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        let newrow = $("<div>").attr("class", "forecast")
        $("#earthforecast").append(newrow)

        for (let i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                let newCol = $("<div>").attr("class", "one-fifth")
                newrow.append(newCol)

                let newCard = $("<div>").attr("class", "card text-white bg-primary")
                newCol.append(newCard)

                let cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"))
                newCard.append(cardHead)

                let cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png")
                newCard.append(cardImg)

                let bodyDiv = $("<div>").attr("class", "card-body")
                newCard.append(bodyDiv)

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"))
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"))
            }
        }
    })
}

function clear() {
    $("#earthforecast").empty()
}

function saveLoc(loc){
   
    if (savedLocations === null) {
        savedLocations = [loc]
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc)
    }
  
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    event.preventDefault()
    let loc = $("#searchinput").val().trim()
    if (loc !== "") {
        clear()
        currentLocation = loc
        saveLoc(loc)
        $("#searchinput").val("")
        getCurrent(loc)
    }
})

$(document).on("click", "#loc-btn", function () {
    clear()
    currentLocation = $(this).text()
    showPrevious()
    getCurrent(currentLocation)
})

initialize();