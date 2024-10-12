const storedSettings = JSON.parse(localStorage.getItem('ticketBotSettings'));

let settings = storedSettings || {
  minPrice: null,
  maxPrice: null,
  amount: null,
  isMadridista: false,
  madridista: { login: '222222', password: '2222222' } && null,
  radio: null,
  selection: 1 // Default select value
};

console.log(settings);

function createForm() {
  const body = document.body;

  const settingsFormContainer = document.createElement('div');
  settingsFormContainer.id = 'settingsFormContainer';
  body.appendChild(settingsFormContainer);

  const form = document.createElement('form');
  form.id = 'settingsForm';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';

  // Create divs for labels and inputs to keep them in a row
  const labels = ['minPrice', 'maxPrice', 'amount'];
  labels.forEach((label) => {
    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.alignItems = 'center';
    inputDiv.style.justifyContent = 'space-between'
    inputDiv.style.marginBottom = '10px';

    const labelElement = document.createElement('label');
    labelElement.for = label;
    labelElement.textContent = `${label}:`;
    labelElement.style.marginRight = '10px';

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = label;
    inputElement.name = label;
    const storedValue = localStorage.getItem(label);
    inputElement.value = storedValue !== null ? storedValue : settings[label];

    inputDiv.appendChild(labelElement);
    inputDiv.appendChild(inputElement);
    form.appendChild(inputDiv);
  });

  // Create radio buttons
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
    radioDiv.style.gap = '6px'

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

  // Create Madridista checkbox and login/password fields
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

  // Create login and password inputs (initially hidden and disabled)
  const madridistaInputsDiv = document.createElement('div');
  madridistaInputsDiv.style.display = madridistaCheckbox.checked ? 'flex' : 'none';
  madridistaInputsDiv.style.flexDirection = 'column';
  madridistaInputsDiv.style.marginBottom = '10px';

  ['login', 'password'].forEach((field) => {
    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.alignItems = 'center';
    inputDiv.style.justifyContent = 'space-between'
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

  // Add the select field inside the madridistaInputsDiv
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

  [1, 2, 3, 4].forEach((optionValue) => {
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

  // Toggle login and password fields (and select) on checkbox change
  madridistaCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    madridistaInputsDiv.style.display = isChecked ? 'flex' : 'none';
    document.getElementById('login').disabled = !isChecked;
    document.getElementById('password').disabled = !isChecked;
    
    if (!isChecked) {
      // Clear login, password, and select fields when checkbox is unchecked
      document.getElementById('login').value = '';
      document.getElementById('password').value = '';
      document.getElementById('selection').value = 1; // Reset select to default
      settings.madridista = null;  // Clear madridista data in settings
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

  // Get login and password if Madridista is enabled
  if (settings.isMadridista) {
    settings.madridista = {
      login: document.getElementById('login').value,
      password: document.getElementById('password').value,
    };
  }

  // Get selected radio button
  const selectedRadio = document.querySelector('input[name="viewOption"]:checked');
  if (selectedRadio) {
    settings.radio = selectedRadio.value;
  }

  // Get selected value from select field
  const selectionValue = document.getElementById('selection').value;
  settings.selection = parseInt(selectionValue);

  console.log('Updated settings:', settings);
  localStorage.setItem('ticketBotSettings', JSON.stringify(settings));
  localStorage.removeItem('stopExecution')
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

window.onload = () => {
  createForm();
  // Set form field values based on stored settings
  const fields = ['minPrice', 'maxPrice', 'amount', 'login', 'password'];
  fields.forEach(field => {
    const inputElement = document.getElementById(field);
    if (inputElement && settings[field]) {
      inputElement.value = settings[field];
    }
  });
};
