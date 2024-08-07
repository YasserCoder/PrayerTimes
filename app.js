let countrylist = document.querySelector("#country-select");
let citylist = document.querySelector("#city-select");
let btn = document.querySelector(".btn");
let datepicker = document.querySelector("#datePicker");
const loader = document.querySelector(".loader");
const content = document.querySelector(".config");

const showLoader = () => {
    loader.style.display = "block";
    content.style.display = "none";
};

const hideLoader = () => {
    loader.style.display = "none";
    content.style.display = "flex";
};

async function getcountry() {
    const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/iso"
    );

    if (!res.ok) {
        throw new Error("Cannot connect to countries API");
    }
    const countries = await res.json();

    for (let country of countries.data) {
        let option = document.createElement("option");
        option.value = country.name;
        option.textContent = country.name;
        countrylist.appendChild(option);
    }
    let countrysl;
    if (localStorage.length !== 0) {
        countrysl = localStorage.getItem("country");
    } else {
        countrysl = "Algeria";
    }
    document
        .querySelector("#country-select option[value='" + countrysl + "']")
        .setAttribute("selected", "");

    return countrysl;
}

async function getcities(countrysl) {
    const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
            method: "POST",
            body: JSON.stringify({ country: countrysl }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    if (!res.ok) {
        throw new Error("Cannot connect to states API");
    }
    const states = await res.json();
    citylist.innerHTML = "";
    for (let state of states.data.states) {
        let option = document.createElement("option");
        option.value = state.name;
        option.textContent = state.name;
        citylist.appendChild(option);
    }
    let selectedIndex = citylist.selectedIndex;

    let citysl = citylist.options[selectedIndex].value;

    btn.removeAttribute("disabled");
    return citysl;
}

async function getprayers(country, city, date) {
    let link = "";
    if (date === "") {
        link =
            "https://api.aladhan.com/v1/timingsByCity?city=" +
            city +
            "&country=" +
            country;
    } else {
        link =
            "https://api.aladhan.com/v1/timingsByCity/" +
            date +
            "?city=" +
            city +
            "&country=" +
            country;
    }

    const res = await fetch(link);
    if (!res.ok) {
        throw new Error("Cannot connect to prayers API");
    }
    const prayers = await res.json();
    let obj = prayers.data.timings;
    let cells = document.querySelectorAll(".cell .prayer");

    for (let i = 0; i < cells.length; i++) {
        let prayername = cells[i].getAttribute("id");
        cells[i].nextElementSibling.textContent = obj[prayername];
    }
    btn.setAttribute("disabled", "");
}

async function runrequests() {
    showLoader();
    try {
        const countrysl = await getcountry();
        const ctysl = await getcities(countrysl);
        let state;
        if (localStorage.length !== 0) {
            state = localStorage.getItem("state");
            document
                .querySelector("#city-select option[value='" + state + "']")
                .setAttribute("selected", "");
        } else {
            state = ctysl;
        }
        getprayers(countrysl, state, "");
    } catch (err) {
        console.log(err);
    } finally {
        hideLoader();
    }
}

countrylist.addEventListener("change", (e) => {
    btn.setAttribute("disabled", "");
    getcities(e.target.value);
});

datepicker.addEventListener("change", (e) => {
    setTimeout(() => {
        btn.removeAttribute("disabled");
    }, 3000);
});
citylist.addEventListener("change", (e) => {
    btn.removeAttribute("disabled");
});

btn.addEventListener("click", (e) => {
    let selectedIndex = countrylist.selectedIndex;

    let country = countrylist.options[selectedIndex].value;

    selectedIndex = citylist.selectedIndex;
    let city = citylist.options[selectedIndex].value;

    let chosendate = document.querySelector("#datePicker").value;

    localStorage.setItem("country", country);
    localStorage.setItem("state", city);

    getprayers(country, city, chosendate);
});

let today = new Date();
datepicker.value =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    today.getDate().toString().padStart(2, "0");

runrequests();
