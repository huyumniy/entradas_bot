window.onload = () => {
  let db;
  let settings = {
    minPrice: null,
    maxPrice: null,
    amount: null,
    isMadridista: false,
    madridista: { login: '222222', password: '2222222' } && null,
    radio: null,
    selection: 1 // Default select value
  };

  // Open IndexedDB and load stored settings if available
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

    const settingsFormContainer = document.createElement('div');
    settingsFormContainer.id = 'settingsFormContainer';
    body.appendChild(settingsFormContainer);

    const form = document.createElement('form');
    form.id = 'settingsForm';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';

    const labels = ['minPrice', 'maxPrice', 'amount'];
    labels.forEach((label) => {
      const inputDiv = document.createElement('div');
      inputDiv.style.display = 'flex';
      inputDiv.style.alignItems = 'center';
      inputDiv.style.justifyContent = 'space-between';
      inputDiv.style.marginBottom = '10px';

      const labelElement = document.createElement('label');
      labelElement.for = label;
      labelElement.textContent = `${label}:`;
      labelElement.style.marginRight = '10px';

      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.id = label;
      inputElement.name = label;
      inputElement.value = settings[label] !== null ? settings[label] : '';

      inputDiv.appendChild(labelElement);
      inputDiv.appendChild(inputElement);
      form.appendChild(inputDiv);
    });

    // Radio buttons
    const radioOptions = [
      { label: 'F : FRONTAL', value: 'F' },
      { label: 'L : LATERAL', value: 'L' },
      { label: '0 : ALL', value: '0' }
    ];

    const radioGroupLabel = document.createElement('div');
    radioGroupLabel.textContent = 'Select View:';
    form.appendChild(radioGroupLabel);

    radioOptions.forEach(option => {
      const radioDiv = document.createElement('div');
      radioDiv.style.display = 'flex';
      radioDiv.style.alignItems = 'center';
      radioDiv.style.gap = '6px';

      const radioLabel = document.createElement('label');
      radioLabel.for = option.value;
      radioLabel.textContent = option.label;
      radioLabel.style.marginRight = '5px';

      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.id = option.value;
      radioInput.name = 'viewOption';
      radioInput.value = option.value;

      if (settings.radio === option.value) {
        radioInput.checked = true;
      }

      radioDiv.appendChild(radioInput);
      radioDiv.appendChild(radioLabel);
      form.appendChild(radioDiv);
    });

    // Madridista checkbox and login/password fields
    const madridistaDiv = document.createElement('div');
    madridistaDiv.style.display = 'flex';
    madridistaDiv.style.alignItems = 'center';
    madridistaDiv.style.marginBottom = '10px';

    const madridistaLabel = document.createElement('label');
    madridistaLabel.for = 'isMadridista';
    madridistaLabel.textContent = 'Madridista?';
    madridistaLabel.style.marginRight = '10px';

    const madridistaCheckbox = document.createElement('input');
    madridistaCheckbox.type = 'checkbox';
    madridistaCheckbox.id = 'isMadridista';
    madridistaCheckbox.checked = settings.isMadridista;

    madridistaDiv.appendChild(madridistaCheckbox);
    madridistaDiv.appendChild(madridistaLabel);
    form.appendChild(madridistaDiv);

    const madridistaInputsDiv = document.createElement('div');
    madridistaInputsDiv.style.display = madridistaCheckbox.checked ? 'flex' : 'none';
    madridistaInputsDiv.style.flexDirection = 'column';
    madridistaInputsDiv.style.marginBottom = '10px';

    ['login', 'password'].forEach((field) => {
      const inputDiv = document.createElement('div');
      inputDiv.style.display = 'flex';
      inputDiv.style.alignItems = 'center';
      inputDiv.style.justifyContent = 'space-between';
      inputDiv.style.marginBottom = '10px';

      const fieldLabel = document.createElement('label');
      fieldLabel.for = field;
      fieldLabel.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}:`;
      fieldLabel.style.marginRight = '10px';

      const inputField = document.createElement('input');
      inputField.type = field === 'password' ? 'password' : 'text';
      inputField.id = field;
      inputField.name = field;
      inputField.value = settings.madridista ? settings.madridista[field] : '';
      inputField.disabled = !madridistaCheckbox.checked;

      inputDiv.appendChild(fieldLabel);
      inputDiv.appendChild(inputField);
      madridistaInputsDiv.appendChild(inputDiv);
    });

    const selectDiv = document.createElement('div');
    selectDiv.style.display = 'flex';
    selectDiv.style.alignItems = 'center';
    selectDiv.style.marginBottom = '10px';

    const selectLabel = document.createElement('label');
    selectLabel.for = 'selection';
    selectLabel.textContent = 'Companions:';
    selectLabel.style.marginRight = '10px';

    const selectField = document.createElement('select');
    selectField.id = 'selection';
    selectField.name = 'selection';

    [0, 1, 2, 3, 4].forEach((optionValue) => {
      const option = document.createElement('option');
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

    madridistaCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      madridistaInputsDiv.style.display = isChecked ? 'flex' : 'none';
      document.getElementById('login').disabled = !isChecked;
      document.getElementById('password').disabled = !isChecked;

      if (!isChecked) {
        document.getElementById('login').value = '';
        document.getElementById('password').value = '';
        document.getElementById('selection').value = 1; // Reset select to default
        settings.madridista = null;
      } else {
        settings.madridista = { login: '', password: '' };
      }
      settings.isMadridista = isChecked;
    });

    const updateButton = document.createElement('button');
    updateButton.type = 'button';
    updateButton.textContent = 'Update Settings and Reload';
    updateButton.addEventListener('click', updateSettings);
    updateButton.style.width = '100%';
    form.appendChild(updateButton);

    settingsFormContainer.appendChild(form);
    settingsFormContainer.style.position = 'fixed';
    settingsFormContainer.style.bottom = '10px';
    settingsFormContainer.style.right = '10px';
    settingsFormContainer.style.padding = '10px';
    settingsFormContainer.style.backgroundColor = '#f0f0f0';
    settingsFormContainer.style.border = '1px solid #ccc';
  }

  function updateSettings() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    const amount = parseInt(document.getElementById('amount').value);

    settings.minPrice = minPrice !== '' ? minPrice : null;
    settings.maxPrice = maxPrice !== '' ? maxPrice : null;
    settings.amount = amount !== '' ? amount : null;

    if (settings.isMadridista) {
      settings.madridista = {
        login: document.getElementById('login').value,
        password: document.getElementById('password').value,
      };
    }
    
    const selectedRadio = document.querySelector('input[name="viewOption"]:checked');
    settings.radio = selectedRadio ? selectedRadio.value : null;

    settings.selection = parseInt(document.getElementById('selection').value);
    window.stopExecutionFlag = undefined;
    saveSettings(); // Save the updated settings to IndexedDB
  }

  function saveSettings() {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    window.stopExecutionFlag = undefined;
    store.put({ id: 1, settings: settings });

    transaction.oncomplete = function () {
      console.log("Settings updated in IndexedDB.");
      const backToMap = document.querySelector('a[id="backToMap1"]')
      if (backToMap) backToMap.click()
    };

    transaction.onerror = function () {
      console.error("Error updating settings in IndexedDB.");
    };
  }
};

async function receive_sheets_data(input) {
  let SHEET_ID = '1mV47WiX2F0hkzRr5m9MMVXFF3fg95AjCy-qa82Bl3T8';
  let SHEET_TITLE = 'main';
  let SHEET_RANGE = 'A2:O';

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
      alert('Не владося знайти введену пошту');
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
    console.error('Error fetching data:', error);
    return null;
  }
}


(function () {
  // Create autofill button
  const button = document.createElement('button');
  button.textContent = 'Fill Data';

  // Apply styles to the button
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '5px 10px';
  button.style.borderRadius = '5px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.transform = 'rotate(90deg)';
  button.style.position = 'absolute';
  button.style.top = '50%';
  button.style.left = '-25px';
  button.style.zIndex = '9999';
  button.style.transform = 'translateY(-50%) rotate(90deg)';

  // Apply positioning styles to the body
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
  document.body.style.position = 'relative';
  document.body.style.backgroundColor = '#f0f0f0';

  // Add click event listener
  button.addEventListener('click', function () {
    const alertData = prompt('Ввведіть необхідну пошту');
    fill_data(alertData);
  });

  // Append button to body
  document.body.appendChild(button);
})();

async function fill_data(alertData) {
  setTimeout(() => {
    const summary = document.querySelector('div[id="nominative-tickets-container"]');
    
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
              input.dispatchEvent(new Event('input', { bubbles: true }));
            });
          }
        }

        const continueButton = document.querySelector('a[id="boton-payment-data"]')
        continueButton.click()

        const firstNameInput = document.querySelector('input[id="firstname"]')
        const lastNameInput = document.querySelector('input[id="lastname"]')

        const emailInput = document.querySelector('input[id="email"]');
        const emailCheckInput = document.querySelector(
          'input[id="reemail"]'
        );
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
          input.dispatchEvent(new Event('input', { bubbles: true }));
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