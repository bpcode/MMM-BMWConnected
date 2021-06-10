Module.register('MMM-BMWConnected', {

  defaults: {
    apiBase: "www.bmw-connecteddrive.co.uk",
    refresh: 15,
    vehicleAngle: 300,
    distance: "miles",
    debug: false
  },

  getStyles: function () {
    return ["MMM-BMWConnected.css"];
  },

  getScripts: function () {
    return ["moment.js"];
  },

  capFirst: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  start: function () {
    Log.info('Starting module: ' + this.name);
    this.sendSocketNotification('MMM-BMWCONNECTED-CONFIG', this.config);
    this.bmwInfo = {};
    this.getInfo();
    this.timer = null;
  },

  getInfo: function () {
    clearTimeout(this.timer);
    this.timer = null;
    this.sendSocketNotification("MMM-BMWCONNECTED-GET", {
      instanceId: this.identifier
    });

    var self = this;
    this.timer = setTimeout(function () {
      self.getInfo();
    }, this.config.refresh * 60 * 1000);
  },

  socketNotificationReceived: function (notification, payload) {

    if (notification == "MMM-BMWCONNECTED-RESPONSE" + this.identifier && Object.keys(payload).length > 0) {
      this.bmwInfo = payload;
      this.updateDom(1000);
    }
  },

  faIconFactory: function (icon) {
    var faIcon = document.createElement("i");
    faIcon.classList.add("fas");
    faIcon.classList.add(icon);
    return (faIcon);
  },

  getDom: function () {

    var distanceSuffix = "mi";
    if (this.config.distance === "km") {
      distanceSuffix = "km";
    }

    var wrapper = document.createElement("div");

    if (this.config.email === "" || this.config.password === "") {
      wrapper.innerHTML = "Missing configuration.";
      return wrapper;
    }

    if (Object.keys(this.bmwInfo).length == 0) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "light small";
      return wrapper;
    }

    var info = this.bmwInfo;

    var carContainer = document.createElement("div");

// Remaining Fuel and Remaining Range
    carContainer.classList.add("bmw-container");
    var fuelRange = document.createElement("span");
    fuelRange.classList.add("fuelRange");
    fuelRange.appendChild(this.faIconFactory("fa-gas-pump"));
    fuelRange.appendChild(document.createTextNode(info.remainingFuel + " L / " + info.fuelRange + " " + distanceSuffix));
    carContainer.appendChild(fuelRange);
    wrapper.appendChild(carContainer);

// Current Mileage

    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    var mileage = document.createElement("span");
    mileage.classList.add("mileage");
    mileage.appendChild(this.faIconFactory("fa-road"));
    mileage.appendChild(document.createTextNode(info.mileage + " " + distanceSuffix));
    carContainer.appendChild(mileage);
    wrapper.appendChild(carContainer);

// Car Secure
    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    var carSecure = document.createElement("span");
    carSecure.classList.add("carSecure");
    carSecure.appendChild(this.faIconFactory("fa-car"));
    carSecure.appendChild(document.createTextNode(info.doorSecure));
    carContainer.appendChild(carSecure);
    wrapper.appendChild(carContainer);

// Car Door
    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    var carDoor = document.createElement("span");
    carDoor.classList.add("carDoor");
    carDoor.appendChild(this.faIconFactory("fa-door-open"));
    if (info.carDoor_pf === "CLOSED" && info.carDoor_df === "CLOSED" && info.carDoor_ts === "CLOSED" && info.carDoor_hs === "CLOSED"){
      carDoor.appendChild(document.createTextNode("CLOSED"));
    } else {
      carDoor.appendChild(document.createTextNode("OPEN"));
    }
    carContainer.appendChild(carDoor);
    wrapper.appendChild(carContainer);

// Car Window
    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    var carWindow = document.createElement("span");
    carSecure.classList.add("carWindow");
    carWindow.appendChild(this.faIconFactory("fa-window-maximize"));
    if (info.carWindow_pf === "CLOSED" && info.carWindow_df === "CLOSED"){
      carWindow.appendChild(document.createTextNode("CLOSED"));
    } else {
      carWindow.appendChild(document.createTextNode("OPEN"));
    }
    carContainer.appendChild(carWindow);
    wrapper.appendChild(carContainer);

    // carContainer = document.createElement("div");
    // carContainer.classList.add("bmw-container");
    // var locked = document.createElement("span");
    // locked.classList.add("locked");
    // if (info.doorLock === "SECURED" || info.doorLock === "LOCKED") {
    //   locked.appendChild(this.faIconFactory("fa-lock"));
    // } else {
    //   locked.appendChild(this.faIconFactory("fa-lock-open"));
    // }
    // carContainer.appendChild(locked);
    // wrapper.appendChild(carContainer);


// Update Information

    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    carContainer.classList.add("updated");
    var updated = document.createElement("span");
    updated.classList.add("updated");
    updated.appendChild(this.faIconFactory("fa-info"));
    var lastUpdateText = "last updated " + moment(info.updateTime).fromNow();
    if (this.config.debug) {
      lastUpdateText += " [" + info.unitOfLength + "]";
    }
    updated.appendChild(document.createTextNode(lastUpdateText));
    carContainer.appendChild(updated);
    wrapper.appendChild(carContainer);

//Image

    carContainer = document.createElement("div");
    carContainer.classList.add("bmw-container");
    var imageContainer = document.createElement("span");
    var imageObject = document.createElement("img");
    imageObject.setAttribute('src', info.imageUrl);
    imageContainer.appendChild(imageObject);
    carContainer.appendChild(imageContainer);

    wrapper.appendChild(carContainer);

    return wrapper;
  }

});
