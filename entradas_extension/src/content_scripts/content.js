window.onload = () => {
  
  const categoryMappings = {
    C3: ['611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '630', '631', '632', '633', '634'],
    C2Behind: ['513', '514', '515', '516', '517', '518', '519', '520', '521', '522', '523', '524', '525', '526', '527', '528', '529', '530', '531', '532', '533', '534', '410', '411', '412', '413', '414', '415', '416', '417', '418', '419', '420', '421', '422', '423', '424', '425', '426', '427', '428', '429', '430', '431', '432', '433', '320', '321', '322', '323', '324', '325', '326', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128'],
    C2Long: ['701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '601', '602', '603', '604', '605', '606', '607', '608', '609', '610'],
    C1Upper: ['535', '536', '537', '538', '539', '540', '541', '542', '543', '544', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512'],
    C1: ['433', '434', '435', '436', '437', '438', '405', '406', '407', '408', '409', '410', '325', '326', '307', '308', '309', '310', '229', '230', '205', '206', '227', '228'],
    C1Premium: ['439', '440', '441', '442', '443', '444', '333', '334', '335', '336', '401', '402', '403', '404', '301', '302', '303', '304', '305', '306', '231', '232', '233', '234', '201', '202', '203', '204', '130', '131', '132', '133', '134', '101', '102', '103', '104', '105', '106']
  };

  let db;
  let settings = {
    minPrice: null,
    maxPrice: null,
    amount: null,
    isMadridista: false,
    madridista: { login: "222222", password: "2222222" } && null,
    radio: [],
    stopExecutionFlag: true
  };

  let UI = {
    __settingsHTML: `<div class="tickets tickets_popup_wrapper">
        <div class="tickets tickets_popup">
          <h1 class="tickets tickets_h1">Налаштування</h1>
    
          <h2 class="tickets tickets_h2">Квитки</h2>
    
          <span class="tickets tickets_title">Ціна:</span>
    
          <input type="number" name="minimum_price" placeholder="Мінамальна" class="tickets tickets_input">
          —
          <input type="number" name="maximum_price" placeholder="Максимальна" class="tickets tickets_input">
          
          <form class="tickets view_selector">
              <span class="tickets tickets_title">Select View:</span>
              <input type="checkbox" name="view" value="U" id="U"><label for="view_up">Up</label>
              <input type="checkbox" name="view" value="D" id="D"><label for="view_down">Down</label>
              <input type="checkbox" name="view" value="L" id="L"><label for="view_left">Left</label>
              <input type="checkbox" name="view" value="R" id="R"><label for="view_right">Right</label>
              <br>
          </form>
          <br>

          <form class="tickets authorization">
            <span class="tickets tickets_title">Авторизація: </span>
            <input type="radio" name="auth" value="0" id="noAuth" checked><label for="noAuth">Ні</label>
            <input type="radio" name="auth" value="1" id="auth"><label for="auth">Так</label>
          </form>

          <div class="ticket_amount-container">
            <span class="tickets tickets_title">Кількість:</span>
              <div class="tickets_select" data-select="count">
                <div class="tickets tickets_selector" data-value="1">1</div>
                <div class="tickets tickets_selector" data-value="2">2</div>
                <div class="tickets tickets_selector" data-value="3">3</div>
                <div class="tickets tickets_selector" data-value="4">4</div>
                <div class="tickets tickets_selector" data-value="5">5</div>
                <div class="tickets tickets_selector tickets_selector_selected" data-value="6">6</div>
              </div>
          </div>
    
          <br>

          <div class="tickets madridista-container">

            <hr class="tickets tickets_hr">
          
            <h2 class="tickets tickets_h2">Авторизація</h2>
          
            <div class="tickets madridista-fields">
              <span class="tickets tickets_title">Main member</span>
              <div class="tickets madridista-field">
                  <label for="login">Login: </label><input class="tickets_input" name="login" type="text" id="login">
              </div>
              <div class="tickets madridista-field">
                  <label for="password">Password: </label><input class="tickets_input" name="password" type="text" id="password">
              </div>
              <br/>
            </div>
          </div>

          <br>

          <button class="tickets tickets_button add_account">+</button>


          <br><br>
    
          <button class="tickets tickets_button" id="tickets_cancel">Назад</button>
          <button class="tickets tickets_button tickets_button_colored" id="tickets_start">Оновити налаштування</button>
        </div>
      </div>`,
    __settingsCSS: `.tickets {
    font-family: 'Calibri';
    }

    .tickets_popup_wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba( 0, 0, 0, .5 );
    overflow: auto;
    z-index: 1000;
    display: none;
    }
    
    .tickets_data {
    display:block;
    }
    
    .tickets_data input {
    margin-right: 5px;
    }

    .tickets_popup {
    width: 500px;
    padding: 15px;
    box-sizing: border-box;
    margin: 50px auto;
    background: #fff;
    border-radius: 4px;
    position: relative;
    }

    .tickets_h1, .tickets_h2 {
    margin: 5px 0;
    font-weight: bold;
    }

    .tickets_h1 {
    font-size: 30px;
    }

    .tickets_h2 {
    font-size: 24px;
    }

    .tickets_select {
        display: inline-block;
    }

    .tickets_selector {
    margin: 3px 0;
    padding: 5px 15px;
    border: 1px solid #999;
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    }

    .tickets_selector:hover {
    background: rgba( 0, 0, 0, 0.05 );
    }

    .tickets_selector_selected {
    color: #000;
    font-weight: bold;
    border: 1px solid #2482f1;
    }

    .category_selector {
    margin: 3px 0;
    padding: 5px 15px;
    border: 1px solid #999;
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    }

    .category_selector:hover {
    background: rgba( 0, 0, 0, 0.05 );
    }

    .category_selector_selected {
    color: #000;
    font-weight: bold;
    border: 1px solid #2482f1;
    }

    .tickets_hr {
    width: 50%;
    border: 0;
    height: 1px;
    background: #aaa;
    margin: 10px auto;
    }

    .tickets_input {
    margin: 3px 0;
    padding: 5px 15px;
    border-radius: 4px;
    border: 1px solid #999;
    font-size: 16px;
    font-family: 'Calibri';
    outline: none;
    }

    .tickets_input:focus {
        border: 1px solid #2482f1;
    }

    .tickets_title {
    margin-right: 10px;
    }

    .tickets_button {
    padding: 5px 15px;
    border: 1px solid #aaa;
    border-radius: 4px;
    font-family: 'Calibri';
    font-size: 16px;
    cursor: pointer;
    }

    .tickets_button_colored {
    font-weight: bold;
    background: #2482f1;
    border: 1px solid #2482f1;
    color: #fff;
    }

    .tickets_notice {
        color: #555;
    }

    .settings-info{
      position: fixed;
      bottom: 15px;
      right: 15px;
      padding: 15px;
      background: #2482f1;
      color: #fff;
      width: 200px;
    }

    .madridista-container {
        display: none;
    }

    .madridista-field {
        display: flex;
        width: 275px;
        justify-content: space-between;
        margin-bottom: 10px;
        align-items: center;
    }

    .add_account {
      display: none;
    }

    .checkbox_field {
        display: flex;
        width: 150px;
        justify-content: space-between;
    }`,
    __settingsInfoCSS: `.settings-info{
      position: fixed;
      bottom: 15px;
      left: 15px;
      padding: 15px;
      background: #139df4;
      color: #fff;
      width: 300px;
      border-radius: 5px;
    }
    .settings-info p{
      font-family: 'Calibri';
      margin-bottom: 0;
    }`,
    __infoHTML: `<div class="settings-info" id="settings-info"></div>`,
    init: function () {
      console.log('in init')
      
      document.body.innerHTML += UI.__settingsHTML

      let style = document.createElement( 'style' );
      style.innerText = UI.__settingsCSS;

      document.head.appendChild( style );
    
      // inject HTML
      const container = document.createElement('div');
      container.id = 'settingsFormContainer';
      
      container.innerHTML = UI.__settingsHTML
      
      
      document.body.appendChild(container);
    
      // Initialize form values
      
      let viewSelectoRadios = document.querySelectorAll('.view_selector > input[type="checkbox"]')
      for (let i=0;i<viewSelectoRadios.length;i++) {
        if (settings.radio.includes(viewSelectoRadios[i].value)) {
          viewSelectoRadios[i].checked = true;
        }
      }

      document.querySelector('body > .tickets_popup_wrapper input[name="minimum_price"]').value = settings.minPrice ?? '';
      document.querySelector('body > .tickets_popup_wrapper input[name="maximum_price"]').value = settings.maxPrice ?? '';
      if (settings.amount) {
        let tickets = document.querySelectorAll('.tickets_selector');
        
        // Remove the selected class from all tickets first
        tickets.forEach((tempTicket) => tempTicket.classList.remove('tickets_selector_selected'));
    
        // Loop through tickets and add the class if it matches the amount
        for (let ticket of tickets) {
            if (ticket.getAttribute('data-value') == settings.amount) {
                ticket.classList.add('tickets_selector_selected');
                break;  // Exit the loop once we find and modify the correct ticket
            }
        }
      }

      let madridista_data = document.getElementsByClassName( 'madridista-container')[0];
      
      if (settings.isMadridista) {

        document.querySelector('.authorization > input[type="radio"][value="1"]').checked = true
        document.querySelector('.add_account').style.display = 'block';
        document.querySelector('.madridista-container').style.display = 'block';
        document.querySelector('.ticket_amount-container').style.display = 'none';
        // create madridista fields based on the madridista array length

        for (var i = 0; i < settings.madridista.length -1; i++) {
          const newAccount = UI.addAccount();
          madridista_data.appendChild(newAccount);
        }

        let madridista_fields = document.querySelectorAll('body > div.tickets.tickets_popup_wrapper div.madridista-fields');
        for (var i = 0; i < madridista_fields.length; i++) {
          const account = settings.madridista[i];
          madridista_fields[i].querySelector('input[name="login"]').value = account.login
          madridista_fields[i].querySelector('input[name="password"]').value = account.password
        }
      }

      let auth_radios = document.querySelectorAll('.authorization > input[type="radio"]');
      auth_radios.forEach(radio => {
        radio.onclick = function() {
          if (this.value === "1") {
            document.querySelector('.add_account').style.display = 'block';
            document.querySelector('.madridista-container').style.display = 'block';
            document.querySelector('.ticket_amount-container').style.display = 'none';
          } else {
            document.querySelector('.add_account').style.display = 'none';
            document.querySelector('.madridista-container').style.display = 'none';
            document.querySelector('.ticket_amount-container').style.display = 'block';
          }
        };
      });

      let cancel_button = document.getElementById( 'tickets_cancel' );
      cancel_button.onclick = UI.closePopup;

      let start_button = document.getElementById( 'tickets_start' );
      start_button.onclick = updateSettings;

      let add_account = document.querySelector('.add_account')
      add_account.onclick = function ( event ) {
        if ( event.target.classList.contains( 'add_account' ) ) {

          const newAccount = UI.addAccount();

          madridista_data.appendChild(newAccount)
        }
      }

      var selectors = document.getElementsByClassName( 'tickets_selector' );

      for ( var i = 0; i < selectors.length; i++ ) {
          selectors[i].onclick = function() {
              UI.select( this );
          }
      }
      

      let wrapper = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
      
      wrapper.onclick = function ( event ) {
          if ( event.target.classList.contains( 'tickets_popup_wrapper' ) ) UI.closePopup();
      }
    },
    
    openPopup: function () {
      let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
        el.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    closePopup: function () {
      let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
        el.style.display = 'none';
        document.body.style.overflow = 'auto';
    },
    
    changeStopButtonStatus: function () {
      let stopButton = document.getElementById("stopButton");
      if (stopButton.innerHTML === "Stop") {
        stopButton.innerHTML = "Resume";
        stopButton.style.backgroundColor = "#FFD32C";
        settings.stopExecutionFlag = true;
      } else if (stopButton.innerHTML === "Resume") {
        stopButton.innerHTML = "Stop";
        stopButton.style.backgroundColor = "#139df4";
        settings.stopExecutionFlag = false;
      }
      saveSettings();
    },

    addTicket: function (type, name, placeholder, width, value=null) {
      let input = document.createElement('input');
      input.type = type;
      input.name = name;
      input.placeholder = placeholder;
      input.className = 'tickets tickets_input';
      input.style.width = `${width}%`;
      input.value = value;
      
      return input;
    },

    addAccount: function () {
      // Initialize and increment the attendant counter
      this.attendantCounter = (this.attendantCounter || 0) + 1;
      const attendantNumber = this.attendantCounter;
    
      const createInputField = (name, labelText) => {
        const field = document.createElement('div');
        field.classList.add('madridista-field');
        
        const label = document.createElement('label');
        label.htmlFor = name;
        label.textContent = `${labelText}: `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.name = name;
        input.classList.add('tickets_input');
        
        field.append(label, input);
        return field;
      };
    
      const container = document.createElement('div');
      container.classList.add('madridista-fields');
    
      // Add attendant label
      const attendantSpan = document.createElement('span');
      attendantSpan.classList.add('tickets');
      attendantSpan.classList.add('tickets_title');
      attendantSpan.textContent = `Attendant ${attendantNumber}`;
      container.appendChild(attendantSpan);
    
      container.appendChild(createInputField('login', 'Login'));
      container.appendChild(createInputField('password', 'Password'));
      container.appendChild(document.createElement('br'))
      return container;
    },

    select: function ( el ) {
        let parent = el.parentNode;
        let els = parent.getElementsByClassName( 'tickets_selector' );

        for ( let i = 0; i < els.length; i++ ) {
            els[i].classList.remove( 'tickets_selector_selected' );
        }

        el.classList.add( 'tickets_selector_selected' );
    },

    categorySelect: function ( el ) {
        if (el.classList.contains( 'category_selector_selected' ) ) {
          el.classList.remove( 'category_selector_selected' );
        } else {
          el.classList.add( 'category_selector_selected' );
        }
    },

    createButton: function ( text, func ) {
        var btn = document.createElement( 'a' );
        btn.className = 'right button button-small button-blue';
        btn.innerHTML = text;
        btn.style.position = 'fixed';
        btn.style.right = '15px';
        btn.style.bottom = '15px';
        btn.style.cursor = 'pointer';
        btn.style.letterSpacing = '1.2px';
        btn.style.fontWeight = '600';

        btn.onclick = function ( e ) {
            e.preventDefault();
            func();
        };

        document.body.appendChild( btn );
    },

    createStopButton: function () {
        var btn = document.createElement( 'a' );
        btn.className = 'left button button-small button-blue';
        btn.id = "stopButton";
        if (settings.stopExecutionFlag) {
          btn.innerHTML = "Resume";
          btn.style.backgroundColor = "#FFD32C";
        } else if (!settings.stopExecutionFlag) {
          btn.innerHTML = "Stop";
          btn.style.backgroundColor = "#139df4";
        }
        btn.style.position = 'fixed';
        btn.style.left = '15px';
        btn.style.bottom = '15px';
        btn.style.cursor = 'pointer';
        btn.style.letterSpacing = '1.2px';
        btn.style.fontWeight = '600';

        btn.onclick = function ( e ) {
            e.preventDefault();
            UI.changeStopButtonStatus();
        };

        document.body.appendChild( btn );
    },
  }

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
      UI.init();
      UI.createButton( 'Налаштування', UI.openPopup );
      UI.createStopButton();
    };

    getRequest.onerror = function () {
      console.error("Error loading settings from IndexedDB.");
      UI.init();
      UI.createButton( 'Налаштування', UI.openPopup );
      UI.createStopButton();
    };
  }
  
 /* Database logic */
  function updateSettings() {
    const minPrice = document.querySelector('input[name="minimum_price"]').value
    const maxPrice = document.querySelector('input[name="maximum_price"]').value
    const amount = parseInt(document.querySelector(".tickets_selector_selected").getAttribute('data-value'));
    const isMadridista = document.querySelector('.authorization > input[type="radio"]:checked').value === "1";

    // Validation checks

    if (minPrice < 0 || maxPrice < 0) {
      alert("Ціна не може бути від'ємною.");
      return;
    }

    if (parseInt(minPrice) > parseInt(maxPrice)) {
      alert("Мінімальна ціна не може бути більшою за максимальну.");
      return;
    }

    if (parseInt(minPrice) === 0 && parseInt(maxPrice) === 0) {
      alert("Ціна не може бути 0.");
      return;
    }

  if (isMadridista) {
    let madridista_fields = document.querySelectorAll('body > div.tickets.tickets_popup_wrapper div.madridista-fields');
    let mainAccountExists = false;

    const field_login = madridista_fields[0].querySelector('input[name="login"]').value;
    const field_password = madridista_fields[0].querySelector('input[name="password"]').value;
    if (field_login !== "" && field_password !== "") {
      mainAccountExists = true;
    }

    if (!mainAccountExists) {
      alert("Має бути принаймні один основний обліковий запис, якщо авторизація увімкнена.");
      return;
    }
  }

    settings.minPrice = minPrice !== "" ? parseInt(minPrice) : null;
    settings.maxPrice = maxPrice !== "" ? parseInt(maxPrice) : null;
    settings.isMadridista = isMadridista;

    let tempMadridista = []


    if (isMadridista) {
      
      const madridista_fields = document.querySelectorAll('body > div.tickets.tickets_popup_wrapper div.madridista-fields');
      for (let i = 0; i < madridista_fields.length; i++) {
        field_login = madridista_fields[i].querySelector('input[name="login"]').value ? madridista_fields[i].querySelector('input[name="login"]').value : null;
        field_password = madridista_fields[i].querySelector('input[name="password"]').value ? madridista_fields[i].querySelector('input[name="password"]').value : null;
        if (field_login && field_password) {
          tempMadridista.push({
            login: field_login,
            password: field_password
          })
        }
      }
      settings.madridista = tempMadridista;
    }

    console.log(tempMadridista.length, amount, "AMOUNT")

    settings.amount = isMadridista ? tempMadridista.length : amount;

    settings.radio = []
    const selectedViewRadio = document.querySelectorAll(
      'div[style="display: block;"] .view_selector > input[type="checkbox"]:checked'
    );
    for (let i = 0; i<selectedViewRadio.length;i++) {
      settings.radio.push(selectedViewRadio[i].value)
    }
      
    

    // settings.selection = parseInt(document.getElementById("selection").value);
    settings.stopExecutionFlag = false;
    saveSettings(); // Save the updated settings to IndexedDB
    UI.closePopup()
  }

  function saveSettings() {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
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


  function init() {
  
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

    main()
	}


  async function main() {
    console.log("Starting main()");
  
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
      return;
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
  

  init()
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
