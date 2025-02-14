window.onload = () => {
  let db;
  let settings = {
    minPrice: null,
    maxPrice: null,
    amount: null,
    isMadridista: false,
    madridista: { login: "222222", password: "2222222" } && null,
    radio: null,
    selection: 1,
    captcha_token: null,
    captcha_required: false,
    finished: false,
    timesToBrowserTabReload: 200,
    secondsToRestartIfNoTicketsFound: 10
  };

  let data_sitekey = null;
  handleCaptchaReceive(function (doc) {
    if (doc.querySelector("#recaptcha-token")?.value) {
      data_sitekey = document
        .querySelector("div[data-sitekey]")
        .getAttribute("data-sitekey");
      console.log(data_sitekey);
      main();
    }
  });

  // Open IndexedDB and load stored settings if available
  const sessionId = document.querySelector("#sessionId").getAttribute("value");
  const request = indexedDB.open("TicketBotDB", 1);

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("settings")) {
      db.createObjectStore("settings", { keyPath: "id" });
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    loadSettings(); // Load settings from IndexedDB on success
  };

  request.onerror = function () {
    console.error("Error opening IndexedDB.");
  };

  function loadSettings() {
    const transaction = db.transaction("settings", "readonly");
    const store = transaction.objectStore("settings");
    const getRequest = store.get(1);

    getRequest.onsuccess = function (event) {
      const storedSettings = event.target.result;
      if (storedSettings) {
        settings = storedSettings.settings;
        console.log("Loaded settings from IndexedDB:", settings);
      }
      createForm(); // Create the form after settings are loaded
    };

    getRequest.onerror = function () {
      console.error("Error loading settings from IndexedDB.");
      createForm(); // Create the form even if there's an error
    };
  }

  function createForm() {
    const body = document.body;

    const settingsFormContainer = document.createElement("div");
    settingsFormContainer.id = "settingsFormContainer";
    body.appendChild(settingsFormContainer);

    const form = document.createElement("form");
    form.id = "settingsForm";
    form.style.display = "flex";
    form.style.flexDirection = "column";

    const labels = ["minPrice", "maxPrice", "amount"];
    labels.forEach((label) => {
      const inputDiv = document.createElement("div");
      inputDiv.style.display = "flex";
      inputDiv.style.alignItems = "center";
      inputDiv.style.justifyContent = "space-between";
      inputDiv.style.marginBottom = "10px";

      const labelElement = document.createElement("label");
      labelElement.for = label;
      labelElement.textContent = `${label}:`;
      labelElement.style.marginRight = "10px";

      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.id = label;
      inputElement.name = label;
      inputElement.value = settings[label] !== null ? settings[label] : "";

      inputDiv.appendChild(labelElement);
      inputDiv.appendChild(inputElement);
      form.appendChild(inputDiv);
    });

    // Radio buttons
    const radioOptions = [
      { label: "F : FRONTAL", value: "F" },
      { label: "L : LATERAL", value: "L" },
      { label: "0 : ALL", value: "0" },
    ];

    const radioGroupLabel = document.createElement("div");
    radioGroupLabel.textContent = "Select View:";
    form.appendChild(radioGroupLabel);

    radioOptions.forEach((option) => {
      const radioDiv = document.createElement("div");
      radioDiv.style.display = "flex";
      radioDiv.style.alignItems = "center";
      radioDiv.style.gap = "6px";

      const radioLabel = document.createElement("label");
      radioLabel.for = option.value;
      radioLabel.textContent = option.label;
      radioLabel.style.marginRight = "5px";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = option.value;
      radioInput.name = "viewOption";
      radioInput.value = option.value;

      if (settings.radio === option.value) {
        radioInput.checked = true;
      }

      radioDiv.appendChild(radioInput);
      radioDiv.appendChild(radioLabel);
      form.appendChild(radioDiv);
    });

    // Madridista checkbox and login/password fields
    const madridistaDiv = document.createElement("div");
    madridistaDiv.style.display = "flex";
    madridistaDiv.style.alignItems = "center";
    madridistaDiv.style.marginBottom = "10px";

    const madridistaLabel = document.createElement("label");
    madridistaLabel.for = "isMadridista";
    madridistaLabel.textContent = "Madridista?";
    madridistaLabel.style.marginRight = "10px";

    const madridistaCheckbox = document.createElement("input");
    madridistaCheckbox.type = "checkbox";
    madridistaCheckbox.id = "isMadridista";
    madridistaCheckbox.checked = settings.isMadridista;

    madridistaDiv.appendChild(madridistaCheckbox);
    madridistaDiv.appendChild(madridistaLabel);
    form.appendChild(madridistaDiv);

    const madridistaInputsDiv = document.createElement("div");
    madridistaInputsDiv.style.display = madridistaCheckbox.checked
      ? "flex"
      : "none";
    madridistaInputsDiv.style.flexDirection = "column";
    madridistaInputsDiv.style.marginBottom = "10px";

    ["login", "password"].forEach((field) => {
      const inputDiv = document.createElement("div");
      inputDiv.style.display = "flex";
      inputDiv.style.alignItems = "center";
      inputDiv.style.justifyContent = "space-between";
      inputDiv.style.marginBottom = "10px";

      const fieldLabel = document.createElement("label");
      fieldLabel.for = field;
      fieldLabel.textContent = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      }:`;
      fieldLabel.style.marginRight = "10px";

      const inputField = document.createElement("input");
      inputField.type = field === "password" ? "password" : "text";
      inputField.id = field;
      inputField.name = field;
      inputField.value = settings.madridista ? settings.madridista[field] : "";
      inputField.disabled = !madridistaCheckbox.checked;

      inputDiv.appendChild(fieldLabel);
      inputDiv.appendChild(inputField);
      madridistaInputsDiv.appendChild(inputDiv);
    });

    const selectDiv = document.createElement("div");
    selectDiv.style.display = "flex";
    selectDiv.style.alignItems = "center";
    selectDiv.style.marginBottom = "10px";

    const selectLabel = document.createElement("label");
    selectLabel.for = "selection";
    selectLabel.textContent = "Companions:";
    selectLabel.style.marginRight = "10px";

    const selectField = document.createElement("select");
    selectField.id = "selection";
    selectField.name = "selection";

    [0, 1, 2, 3, 4].forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      if (settings.selection === optionValue) {
        option.selected = true;
      }
      selectField.appendChild(option);
    });

    selectDiv.appendChild(selectLabel);
    selectDiv.appendChild(selectField);
    madridistaInputsDiv.appendChild(selectDiv);

    form.appendChild(madridistaInputsDiv);

    madridistaCheckbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      madridistaInputsDiv.style.display = isChecked ? "flex" : "none";
      document.getElementById("login").disabled = !isChecked;
      document.getElementById("password").disabled = !isChecked;

      if (!isChecked) {
        document.getElementById("login").value = "";
        document.getElementById("password").value = "";
        document.getElementById("selection").value = 1; // Reset select to default
        settings.madridista = null;
      } else {
        settings.madridista = { login: "", password: "" };
      }
      settings.isMadridista = isChecked;
    });

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.textContent = "Update Settings and Reload";
    updateButton.addEventListener("click", updateSettings);
    updateButton.style.width = "100%";
    form.appendChild(updateButton);

    settingsFormContainer.appendChild(form);
    settingsFormContainer.style.position = "fixed";
    settingsFormContainer.style.bottom = "10px";
    settingsFormContainer.style.right = "10px";
    settingsFormContainer.style.padding = "10px";
    settingsFormContainer.style.backgroundColor = "#f0f0f0";
    settingsFormContainer.style.border = "1px solid #ccc";
  }



 /* Database logic */
  function updateSettings() {
    const minPrice = document.getElementById("minPrice").value;
    const maxPrice = document.getElementById("maxPrice").value;
    const amount = parseInt(document.getElementById("amount").value);

    settings.minPrice = minPrice !== "" ? minPrice : null;
    settings.maxPrice = maxPrice !== "" ? maxPrice : null;
    settings.amount = amount !== "" ? amount : null;

    if (settings.isMadridista) {
      settings.madridista = {
        login: document.getElementById("login").value,
        password: document.getElementById("password").value,
      };
    }

    const selectedRadio = document.querySelector(
      'input[name="viewOption"]:checked'
    );
    settings.radio = selectedRadio ? selectedRadio.value : null;

    settings.selection = parseInt(document.getElementById("selection").value);
    window.stopExecutionFlag = undefined;
    settings.finished = false;
    saveSettings(); // Save the updated settings to IndexedDB
  }

  function saveSettings() {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    window.stopExecutionFlag = undefined;
    store.put({ id: 1, settings: settings });

    transaction.oncomplete = function () {
      console.log("Settings updated in IndexedDB.");
      const backToMap = document.querySelector('a[id="backToMap1"]');
      if (backToMap) backToMap.click();
    };

    transaction.onerror = function () {
      console.error("Error updating settings in IndexedDB.");
    };
  }


  async function main() {
    console.log("Starting main()");
  
    // Exit early if reservations are already finished.
    if (settings.finished) {
      alert("Seats already reserved! Please delete them to start new search!");
      return;
    }
  
    // Open IndexedDB and check if settings exist.
    try {
      const db = await openDatabase("TicketBotDB", 1);
      if (!db.objectStoreNames.contains("settings")) {
        console.log("Object store 'settings' does not exist – fresh database");
        return;
      }
      const settingsCount = await countObjectStore(db, "settings");
      if (settingsCount === 0) {
        console.log("No settings in database.");
        return;
      }
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      _countAndRun();
      return;
    }
  
    // Extract configuration values from settings.
    const { radio: ar, amount: ent, maxPrice: maxprc, minPrice: minprc } = settings;
    const subsecciones = {
      "Lateral Este": "sub-padredamian",
      "Fondo Norte": "sub-rafaelsalgado",
      "Lateral Oeste": "sub-castellana",
      "Fondo Sur": "sub-conchaespina",
    };
  
    // Determine the CSS selector for sectors.
    let sectors;
    switch (ar.toLowerCase()) {
      case "l":
        sectors = "g[data-name^='Lateral'][class='sector']";
        break;
      case "f":
        sectors = "g[data-name^='Fondo'][class='sector']";
        break;
      default:
        sectors = "g[data-name][class='sector']";
    }
  
    try {
      const mapUrl = `https://deportes.entradas.com/sports-web/map/svg/rma/${sessionId}/1?`;
      const mapResponse = await fetch(mapUrl);
      const mapText = await mapResponse.text();
  
      await handleCaptchaIfNeeded();
  
      // Process the XML response to determine suitable zones.
      const suitableZones = processResponse(mapText, sectors, ent, minprc, maxprc, subsecciones);
      if (!suitableZones.length) {
        console.log("No suitable zones found.");
        _countAndRun();
        return;
      }
  
      // Prebook each suitable zone concurrently.
      const successfulZones = await Promise.all(
        suitableZones.map(zoneId => prebookZone(zoneId, ent))
      );
      // Filter out unsuccessful prebook responses.
      const validZones = successfulZones.filter(item => item !== null);
      if (!validZones.length) {
        console.log("No zones were successfully prebooked.");
        _countAndRun();
        return;
      }
  
      // Prepare cart POST data.
      const cart_post = {
        numTickets: ent,
        sectorData: {
          sectorName: "",
          availableSeats: "",
          availableVipSeats: "",
          minPrice: "1500"
        },
        vipZone: true,
        zoneData: {
          zoneId: "",
          zoneName: "",
          sector: "",
          defaultPrice: "",
          abbreviatedZoneCode: ""
        }
      };
  
      // Use the first valid zone for cart submission.
      const [prebookResponse, zoneId] = validZones[0];
  
      // Build URLSearchParams payload.
      const params = new URLSearchParams();
      params.append("bookingLocator", "");
      params.append("sessionId", Number(sessionId));
      params.append("teamUcc", "RMA");
      params.append("zoneId", zoneId);
      params.append("trackerBooking", JSON.stringify(cart_post));
  
      // Append each seatId from the prebook response.
      prebookResponse.content.passSeats.forEach(passSeat => {
        params.append("seatId", `${passSeat.id}:${sessionId}`);
      });
      console.log("FINAL PAYLOAD:", params.toString());
  
      // Populate the hidden inputs on the form and submit it.
      // submitCartForm(params);
      settings.finished = true;
      saveSettings();
  
    } catch (error) {
      console.error("Error in processing flow:", error);
      // _countAndRun();
    }
  }

  function _countAndRun() {
    displayTextInBottomLeftCorner('No tickets found!');
    console.log('No tickets found!');
    setTimeout(() => {
      //window.location.href = $settings.url;
      _countScriptRunning();
      main();
      console.log('calling main function')
    }, settings.secondsToRestartIfNoTicketsFound ? settings.secondsToRestartIfNoTicketsFound * 1000 : 5 * 1000);
  }

  function _countScriptRunning() {
    let ticketCatcherCounter = sessionStorage.getItem('RealTicketCatcherCounter');
    if (ticketCatcherCounter === null) ticketCatcherCounter = 1
    console.log(
      'Script "' +
        '" has been run ' +
        ticketCatcherCounter +
        ' times from ' +
        settings.timesToBrowserTabReload +
        '.'
    );
    if (ticketCatcherCounter >= settings.timesToBrowserTabReload) {
      sessionStorage.setItem('RealTicketCatcherCounter', 0);
      console.log('reloading page...')
      window.location.reload()
    } else {
      sessionStorage.setItem('RealTicketCatcherCounter', ++ticketCatcherCounter);
    }
  }
  
  /**
   * Opens an IndexedDB database and returns a Promise for the DB instance.
   */
  function openDatabase(name, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }
  
  /**
   * Counts records in an object store.
   */
  function countObjectStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);
      const countRequest = objectStore.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
  }
  
  /**
   * Handles captcha resolution and validation if required.
   */
  async function handleCaptchaIfNeeded() {
    console.log("in handleCaptchaIfNeeded", settings)
  
    // Request captcha token if not available.
    if (!settings.captcha_token) {
      chrome.runtime.sendMessage(
        { action: "resolve-captcha", content: data_sitekey },
        response => {
          if (response?.transcription) {
            console.log("Captcha solved:", response.transcription);
            settings.captcha_token = response.transcription;
            saveSettings();
          } else if (response?.error) {
            console.error("Captcha error:", response.error);
          } else {
            console.error("No response from captcha resolver.");
          }
        }
      );
      setInterval(updateCaptchaStatus, 100000);
      console.log('CAPTCHA STATUS UPDATE', settings.captcha_token)
      // location.reload();
    }
  
    if (settings.captcha_token && settings.captcha_required) {
      console.log("Validating captcha...");
      const validationResponse = await sendFormDataRequest({
        url: `https://deportes.entradas.com/sports-web/validateCapcha`,
        payload: { captcha: settings.captcha_token, action: "prebook" },
      });
      console.log("Captcha validation:", validationResponse.response);
      if (validationResponse.response === false) {
        settings.captcha_required = true;
        saveSettings();
      } else {
        settings.captcha_required = false;
        saveSettings();
      }
    }
  }


  function displayTextInBottomLeftCorner(text) {
    const existingTextElement = document.getElementById('bottomLeftText');

    // Функція для форматування чисел менше 10 з додаванням "0" спереду
    function formatNumber(num) {
      return num < 10 ? `0${num}` : num;
    }

    // Функція для отримання поточного часу у форматі "ГГ:ХХ:СС"
    function getCurrentTime() {
      const now = new Date();
      const hours = formatNumber(now.getHours());
      const minutes = formatNumber(now.getMinutes());
      const seconds = formatNumber(now.getSeconds());
      return `${hours}:${minutes}:${seconds}`;
    }

    if (!existingTextElement) {
      // Створюємо елемент, якщо він ще не існує
      const newTextElement = document.createElement('div');
      newTextElement.id = 'bottomLeftText';

      // Стилі для новоствореного елементу
      newTextElement.style.position = 'absolute';
      newTextElement.style.bottom = '0';
      newTextElement.style.left = '0';
      newTextElement.style.padding = '10px';
      newTextElement.style.backgroundColor = '#000';
      newTextElement.style.color = '#fff';
      newTextElement.style.fontFamily = 'Arial, sans-serif';

      // Додаємо новостворений елемент до body
      document.body.appendChild(newTextElement);

      // Виводимо текст та час
      newTextElement.textContent = `${text} - ${getCurrentTime()}`;
    } else {
      // Оновлюємо текст та час у вже існуючому елементі
      existingTextElement.textContent = `${text} - ${getCurrentTime()}`;
    }
  }
  
  /**
   * Processes the XML response from the map request to extract suitable zones.
   */
  function processResponse(xmlText, sectors, ent, minprc, maxprc, subsecciones) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  
    // Optionally check a random area (for logging or captcha purposes).
    const availableAreas = xmlDoc.querySelectorAll(sectors);
    if (availableAreas.length) {
      const randomArea = availableAreas[Math.floor(Math.random() * availableAreas.length)]
        .getAttribute("data-name");
      if (randomArea && subsecciones[randomArea]) {
        const subseccion = xmlDoc.getElementById(subsecciones[randomArea]);
        console.log("Subsection status:", subseccion && subseccion.children.length > 0 ? "Has seats" : "No seats");
      }
    }
  
    // Extract zones that meet the criteria.
    const suitableZones = [];
    const zones = xmlDoc.querySelectorAll("path[data-available-seats]");
    zones.forEach(zone => {
      const seats = parseInt(zone.getAttribute("data-available-seats"), 10);
      const minPrice = parseInt(zone.getAttribute("data-min-price"), 10);
      if (seats >= ent && minPrice >= minprc && minPrice <= maxprc) {
        suitableZones.push(zone.getAttribute("data-internal-id"));
      }
    });
    console.log("Suitable zones:", suitableZones);
    return suitableZones;
  }
  
  /**
   * Sends a prebook request for a given zone.
   * Returns an array [prebookResponse, zoneId] if successful, or null if not.
   */
  async function prebookZone(zoneId, ent) {
    try {
      const prebookResponse = await sendFormDataRequest({
        url: "https://deportes.entradas.com/sports-web/prebook",
        payload: {
          seats: ent,
          sessionId: Number(sessionId),
          teamUcc: "RMA",
          zoneId: zoneId,
        },
      });
      console.log("Prebook success for zone", zoneId, prebookResponse);
      if (
        prebookResponse.message === "Lo sentimos ,  el captcha no se ha validado" ||
        prebookResponse.message === "Sorry,captcha not validated"
      ) {
        settings.captcha_required = true;
        saveSettings();
        return null;
      }
      if (prebookResponse.resultType === "OK") {
        settings.captcha_required = false;
        saveSettings();
        return [prebookResponse, zoneId];
      }
    } catch (error) {
      console.error("Prebook failed for zone", zoneId, error);
    }
    return null;
  }
  
  /**
   * Populates the form with hidden inputs using URLSearchParams and submits it.
   */
  function submitCartForm(params) {
    const form = document.querySelector("#confirmForm");
    if (!form) {
      console.error("Form with id 'confirmForm' not found.");
      return;
    }
    form.innerHTML = "";

    params.forEach((value, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    form.submit();
  }

  async function updateCaptchaStatus() {
    console.log("updateCaptchaStatus call!")
    try {
      settings.captcha_token = false;
      settings.captcha_required = true;
      saveSettings();
      console.log("Updated captcha_token at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error updating captcha status:", error);
    }
  }
  
}

function sendFormDataRequest(options) {
  // Default options with proper headers (including Priority)
  const defaults = {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Priority: "u=0, i",
    },
    credentials: "same-origin",
  };

  // Merge defaults with options – ensuring headers are merged deeply.
  const config = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...(options.headers || {}),
    },
  };

  // Create URL-encoded string from payload data.
  const params = new URLSearchParams();
  if (config.payload) {
    Object.entries(config.payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(`${key}[]`, item));
      } else {
        params.append(key, value);
      }
    });
  }

  return fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: params.toString(),
    credentials: config.credentials,
  })
    .then(async (response) => {
      // Retrieve the text and try to parse as JSON.
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = text;
      }

      // If the parsed data isn’t an object, wrap it in one.
      if (typeof data !== "object" || data === null) {
        data = { response: data };
      }

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.response = data;
        throw error;
      }

      return data;
    })
    .catch((error) => {
      console.error("Request failed:", error);
      throw error;
    });
}

async function receive_sheets_data(input) {
  let SHEET_ID = "1mV47WiX2F0hkzRr5m9MMVXFF3fg95AjCy-qa82Bl3T8";
  let SHEET_TITLE = "main";
  let SHEET_RANGE = "A2:O";

  let FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

  let sheets_name,
    sheets_surname,
    sheets_email,
    sheets_phone,
    sheets_postal,
    sheets_id,
    attendants;

  try {
    let res = await fetch(FULL_URL);
    let rep = await res.text();
    let data = JSON.parse(rep.substr(47).slice(0, -2));

    let data_rows = data.table.rows;

    let filtered_data = data_rows.filter((item) => {
      if (item.c[2].v === input) return item.c;
    });
    console.log(filtered_data);
    if (filtered_data.length === 0) {
      alert("Не владося знайти введену пошту");
      return null;
    }
    let random_row = filtered_data[0].c;

    sheets_name = random_row[0].v;
    sheets_surname = random_row[1].v;
    sheets_email = random_row[2].v;
    sheets_phone = random_row[3].v;
    sheets_postal = random_row[4].v;
    sheets_id = random_row[5].v;
    attendants = [
      {
        name: sheets_name,
        surname: sheets_surname,
        id: sheets_id,
      },
      {
        name: random_row[6]?.v || null,
        surname: random_row[7]?.v || null,
        id: random_row[8]?.v || null,
      },
      {
        name: random_row[9]?.v || null,
        surname: random_row[10]?.v || null,
        id: random_row[11]?.v || null,
      },
      {
        name: random_row[12]?.v || null,
        surname: random_row[13]?.v || null,
        id: random_row[14]?.v || null,
      },
    ];

    return {
      sheets_name: sheets_name,
      sheets_surname: sheets_surname,
      sheets_email: sheets_email,
      sheets_phone: sheets_phone,
      sheets_postal: sheets_postal,
      sheets_id: sheets_id,
      attendants: attendants,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

(function () {
  // Create autofill button
  const button = document.createElement("button");
  button.textContent = "Fill Data";

  // Apply styles to the button
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "5px 10px";
  button.style.borderRadius = "5px";
  button.style.fontSize = "16px";
  button.style.cursor = "pointer";
  button.style.transform = "rotate(90deg)";
  button.style.position = "absolute";
  button.style.top = "50%";
  button.style.left = "-25px";
  button.style.zIndex = "9999";
  button.style.transform = "translateY(-50%) rotate(90deg)";

  // Apply positioning styles to the body
  document.body.style.margin = "0";
  document.body.style.height = "100vh";
  document.body.style.position = "relative";
  document.body.style.backgroundColor = "#f0f0f0";

  // Add click event listener
  button.addEventListener("click", function () {
    const alertData = prompt("Ввведіть необхідну пошту");
    fill_data(alertData);
  });

  // Append button to body
  document.body.appendChild(button);
})();

async function fill_data(alertData) {
  setTimeout(() => {
    const summary = document.querySelector(
      'div[id="nominative-tickets-container"]'
    );

    if (summary) {
      receive_sheets_data(alertData).then((data) => {
        if (!data) {
          return;
        }

        // Handle up to 4 attendants
        const attendantNameInputs = document.querySelectorAll(
          'input[data-msg_error="nominativeNameError"]'
        );
        const attendantSurnameInputs = document.querySelectorAll(
          'input[data-msg_error="nominativeLastNameError"]'
        );
        const attendantIdInputs = document.querySelectorAll(
          'input[data-msg_error="nominativeIdCardError"]'
        );

        for (let i = 0; i < Math.min(attendantNameInputs.length, 4); i++) {
          if (data.attendants && data.attendants[i]) {
            attendantNameInputs[i].value = data.attendants[i].name;
            attendantSurnameInputs[i].value = data.attendants[i].surname;
            attendantIdInputs[i].value = data.attendants[i].id;

            // Trigger change events for attendant fields
            [
              attendantNameInputs[i],
              attendantSurnameInputs[i],
              attendantIdInputs[i],
            ].forEach((input) => {
              input.dispatchEvent(new Event("input", { bubbles: true }));
            });
          }
        }

        const continueButton = document.querySelector(
          'a[id="boton-payment-data"]'
        );
        continueButton.click();

        const firstNameInput = document.querySelector('input[id="firstname"]');
        const lastNameInput = document.querySelector('input[id="lastname"]');

        const emailInput = document.querySelector('input[id="email"]');
        const emailCheckInput = document.querySelector('input[id="reemail"]');
        const telephoneInput = document.querySelector(
          'input[id="phonenumber"]'
        );
        const postalCodeInput = document.querySelector(
          'input[id="postalcode"]'
        );

        // Fill in the main fields
        firstNameInput.value = data.sheets_name;
        lastNameInput.value = data.sheets_surname;
        emailInput.value = data.sheets_email;
        emailCheckInput.value = data.sheets_email;
        telephoneInput.value = data.sheets_phone;
        postalCodeInput.value = data.sheets_postal;

        // Trigger change events for the main fields
        [
          firstNameInput,
          lastNameInput,
          emailInput,
          emailCheckInput,
          telephoneInput,
          postalCodeInput,
        ].forEach((input) => {
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        // const selectCountryCode = document.querySelector('select[name="countryCode"]')

        // selectCountryCode.options[1].selected = true

        // const changeEvent = new Event('change', { bubbles: true });
        // selectCountryCode.dispatchEvent(changeEvent)

        // Check the required checkboxes
        const acceptTermsCheckbox = document.querySelector(
          'input[id="agreeterms"]'
        );
        const channelAgreementCheckbox = document.querySelector(
          'input[id="receiveInfo"]'
        );

        if (!acceptTermsCheckbox.checked) {
          acceptTermsCheckbox.click();
        }

        if (!channelAgreementCheckbox.checked) {
          channelAgreementCheckbox.click();
        }
      });
    }
  }, 2000);
}

function handleCaptchaReceive(callback) {
  const selector = "#recaptcha-prebook > div > div.grecaptcha-logo > iframe";
  let iframe = document.querySelector(selector);

  if (iframe) {
    // Iframe already exists, check if loaded
    if (
      iframe.contentDocument &&
      iframe.contentDocument.readyState === "complete"
    ) {
      callback(iframe.contentDocument);
    } else {
      iframe.addEventListener("load", () => callback(iframe.contentDocument), {
        once: true,
      });
    }
  } else {
    // Observe DOM for iframe addition
    const observer = new MutationObserver((_, obs) => {
      iframe = document.querySelector(selector);
      if (iframe) {
        obs.disconnect();
        iframe.addEventListener(
          "load",
          () => callback(iframe.contentDocument),
          { once: true }
        );
        // Check if already loaded when found
        if (
          iframe.contentDocument &&
          iframe.contentDocument.readyState === "complete"
        ) {
          callback(iframe.contentDocument);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}
