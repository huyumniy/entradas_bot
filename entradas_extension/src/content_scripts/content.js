window.onload = () => {
  let data_sitekey = null;
  let sessionId = document.querySelector("#sessionId").getAttribute("value");

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
    ticketsType: 0,
    categories: [],
    sectors: [],
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
        <input type="radio" name="view" value="0" id="0" checked><label for="view_0">0 : ALL</label>
        <input type="radio" name="view" value="F" id="F"><label for="view_F">F : FRONTAL</label>
        <input type="radio" name="view" value="L" id="L"><label for="view_L">L : LATERAL</label>
        <br>
      </form>

      <span class="tickets tickets_title">Кількість:</span>
      <div class="tickets_select" data-select="count">
        <div class="tickets tickets_selector" data-value="1">1</div>
        <div class="tickets tickets_selector" data-value="2">2</div>
        <div class="tickets tickets_selector" data-value="3">3</div>
        <div class="tickets tickets_selector" data-value="4">4</div>
        <div class="tickets tickets_selector" data-value="5">5</div>
        <div class="tickets tickets_selector tickets_selector_selected" data-value="6">6</div>
      </div>

      <br>
      <span class="tickets tickets_title">Категорії:</span>
      <div class="category_select" data-select="count">
        <div class="tickets category_selector" data-value="C3">Category 3</div>
        <div class="tickets category_selector" data-value="C2Behind">Category 2 Behind the Goal</div>
        <div class="tickets category_selector" data-value="C2Long">Category 2 Long Side</div>
        <div class="tickets category_selector" data-value="C1Upper">Category 1 Upper</div>
        <div class="tickets category_selector" data-value="C1">Category 1</div>
        <div class="tickets category_selector" data-value="C1Premium">Category 1 Premium</div>
      </div>

      <br>

      <form class="tickets tickets-type_selector">
        <span class="tickets tickets_title">Типи квитків:</span>
        <input type="radio" name="view" value="0" id="DT" checked><label for="DT">Звичайні</label>
        <input type="radio" name="view" value="1" id="PT"><label for="PT">Преміум</label>
      </form>
      
      
      <br>

      <span class="tickets tickets_title">Додаткові сектори:</span>
      <div class="tickets tickets_data">
      </div>
      <button class="tickets tickets_button add_sector">+</button>

      <hr class="tickets tickets_hr">

      <h2 class="tickets tickets_h2">Інтервал оновлення</h2>
      <input type="number" name="interval" placeholder="Секунды" class="tickets_input" value="15">
      <span class="tickets_notice">Оптимальний час: 15 сек</span>

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
    
      // Get elements
      const madridistaFields = container.querySelector('.madridista-fields');
      const madridistaCheckbox = container.querySelector('#isMadridista');
      const loginInput = container.querySelector('#login');
      const passwordInput = container.querySelector('#password');
      const selectionInput = container.querySelector('#selection');
    
      // Initialize form values
      let viewSelectoRadios = document.querySelectorAll('.view_selector > input[type="radio"]')
      for (var radio of viewSelectoRadios) {
        if (settings.radio === radio.value) {
          radio.checked = true;
        }
      }

      let ticketsTypeRadios = document.querySelectorAll('.tickets-type_selector > input[type="radio"]')
      for (var radio of ticketsTypeRadios) {
        if (settings.ticketsType === radio.value) {
          radio.checked = true;
        }
      }
      
      document.querySelector('input[name="minimum_price"]').value = settings.minPrice || '';
      document.querySelector('input[name="maximum_price"]').value = settings.maxPrice || '';
      document.querySelector('input[name="interval"]').value = settings.secondsToRestartIfNoTicketsFound || 15;
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

      if (settings.categories) {
        let categories = document.querySelectorAll('.category_selector');

        for (let category of categories) {
          if (settings.categories.includes(category.getAttribute('data-value'))) {
            category.classList.add('category_selector_selected');
          }
        }
      }

      let tickets_data =  document.getElementsByClassName( 'tickets_data' )[0];
      let add_sector = document.getElementsByClassName( 'add_sector' )[0];

      for (let sector of settings.sectors) {
        const newBlockInput = UI.addTicket('number', 'block', 'Сектор', 16, sector)

        tickets_data.appendChild(newBlockInput)
      }
      
      madridistaCheckbox.checked = settings.isMadridista;
      selectionInput.value = settings.selection || '1';
      
      if (settings.isMadridista) {
        madridistaFields.style.display = 'flex';
        loginInput.value = settings.madridista?.login || '';
        passwordInput.value = settings.madridista?.password || '';
      }
    
      // Event listeners
      madridistaCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        madridistaFields.style.display = isChecked ? 'flex' : 'none';
        loginInput.disabled = !isChecked;
        passwordInput.disabled = !isChecked;
        
        if (!isChecked) {
          loginInput.value = '';
          passwordInput.value = '';
          selectionInput.value = '1';
        }
      });


      let cancel_button = document.getElementById( 'tickets_cancel' );
      cancel_button.onclick = UI.closePopup;

      let start_button = document.getElementById( 'tickets_start' );
      start_button.onclick = updateSettings;

      let add_account = document.querySelector('.add_account')
      add_account.onclick = function ( event ) {
        if ( event.target.classList.contains( 'add_account' ) ) {

          const newAccount = UI.addAccount();

          tickets_data.appendChild(newAccount)
        }
      }

      var selectors = document.getElementsByClassName( 'tickets_selector' );

      for ( var i = 0; i < selectors.length; i++ ) {
          selectors[i].onclick = function() {
              UI.select( this );
          }
      }
      
      var categories = document.getElementsByClassName( 'category_selector' );

      for ( var i = 0; i < categories.length; i++ ) {
          categories[i].onclick = function() {
              UI.categorySelect( this );
          }
      }

      add_sector.onclick = function ( event ) {
        if ( event.target.classList.contains( 'add_sector' ) ) {

          const newBlockInput = UI.addTicket('number', 'block', 'Сектор', 16);

          tickets_data.appendChild(newBlockInput)
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
      let madridistaField = document.querySelector('.madridista-field');
      // login
      let login = document.createElement('input');
      let loginLabel = document.createElement('label');
      login.type = 'text';
      login.name = 'login';
      login.classList.add = "tickets_input";

      loginLabel.setAttribute("for", "login");
      loginLabel.textContent = "Login: ";

      madridistaField.appendChild(loginLabel);
      madridistaField.appendChild(login);
      
      // password 
      let password = document.createElement('input');
      let passwordLabel = document.createElement('label');
      password.type = 'text';
      password.name = 'password';
      password.classList.add = "tickets_input";

      passwordLabel.setAttribute("for", "password");
      passwordLabel.textContent = "Password: ";

      madridistaField.appendChild(passwordLabel);
      madridistaField.appendChild(password);

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
    };

    getRequest.onerror = function () {
      console.error("Error loading settings from IndexedDB.");
      UI.init();
      UI.createButton( 'Налаштування', UI.openPopup );
    };
  }
  
 /* Database logic */
  function updateSettings() {
    const minPrice = document.querySelector('input[name="minimum_price"]').value
    const maxPrice = document.querySelector('input[name="maximum_price"]').value
    const amount = parseInt(document.querySelector(".tickets_selector_selected").getAttribute('data-value'));
    const interval = document.querySelector('input[name="interval"]').value
    const categories = Array.from(document.querySelectorAll('body > div[class="tickets tickets_popup_wrapper"] > div[class="tickets tickets_popup"] .category_selector_selected'))
    .map(category => category.getAttribute('data-value'))
    const sectors = Array.from(document.querySelectorAll('div[class="tickets tickets_data"] > input'))
    .map(sector => sector.value)
    settings.minPrice = minPrice !== "" ? parseInt(minPrice) : null;
    settings.maxPrice = maxPrice !== "" ? parseInt(maxPrice) : null;
    settings.amount = amount !== "" ? amount : null;
    settings.secondsToRestartIfNoTicketsFound = parseInt(interval);
    settings.categories = categories;
    settings.sectors = sectors;
    
    
    if (settings.isMadridista) {
      settings.madridista = {
        login: document.getElementById("login").value,
        password: document.getElementById("password").value,
      };
    }

    const selectedViewRadio = document.querySelector(
      '.view_selector > input[type="radio"]:checked'
    );
    settings.radio = selectedViewRadio ? selectedViewRadio.value : null;
    
    const selectedTypeRadio = document.querySelector(
      '.tickets-type_selector > input[type="radio"]:checked'
    );
    settings.ticketsType = selectedTypeRadio ? selectedTypeRadio.value : null;

    // settings.selection = parseInt(document.getElementById("selection").value);
    window.stopExecutionFlag = undefined;
    settings.finished = false;
    settings.banned = false;
    saveSettings(); // Save the updated settings to IndexedDB
    window.location.reload()
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

  function init() {
    
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
	}


  async function main() {
    console.log("Starting main()");
  
    // Exit early if reservations are already finished.
    if (settings.finished) {
      alert("Seats already reserved! Please delete them to start new search!");
      return;
    }

    if (settings.banned) {
      alert("Ваший IP забанений, оновіть налаштування щоб знову увімкнути бота.");
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
    
    let desiredSectors = settings.sectors.filter((e) => {return e;});
    
    const desiredSectorOnCategories = settings.categories.flatMap(category => categoryMappings[category] || []);
    const tempSectorSet = new Set([ ...desiredSectorOnCategories, ...desiredSectors])

    const finalDesiredSectors = [...tempSectorSet]


    try {
      const mapUrl = `https://deportes.entradas.com/sports-web/map/svg/rma/${sessionId}/${settings.ticketsType}?`;
      const mapResponse = await fetch(mapUrl);
      if (mapResponse.status === 403) {
        console.log('Error 403')
        location.reload();
      }
      const mapText = await mapResponse.text();
  
      await handleCaptchaIfNeeded();
  
      // Process the XML response to determine suitable zones.
      const suitableZones = processResponse(mapText, sectors, ent, minprc, maxprc, subsecciones, finalDesiredSectors);
      if (!suitableZones.length) {
        console.log("No suitable zones found.");
        _countAndRun();
        return;
      }
      
      // Choose one random zone from the suitable zones.
      const randomZone = suitableZones[Math.floor(Math.random() * suitableZones.length)];
      console.log("Selected random zone for prebooking:", randomZone);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send the prebook request for the selected random zone.
      const prebookResult = await prebookZone(randomZone, ent, settings.madridista);
      if (!prebookResult) {
        console.log("Prebook request failed for zone:", randomZone);
        _countAndRun();
        return;
      }
      console.log("Prebook success for zone:", randomZone, prebookResult);
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
      const [prebookResponse, zoneId] = prebookResult;
  
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
      submitCustomForm("#confirmForm", params);
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
      // setInterval(updateCaptchaStatus, 100000);
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
        settings.captcha_token = null;
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
  function processResponse(xmlText, sectors, ent, minprc, maxprc, subsecciones, desiredSectors=[]) {
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
    let customSelector = '';

    if (desiredSectors.length === 0) {
      customSelector = 'path[data-available-seats]'
    } else {
      customSelector = desiredSectors
      .map(sector => `path[data-available-seats][data-zone-sector='${sector}']`)
      .join(', ');
    }
    const zones = xmlDoc.querySelectorAll(customSelector);
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
  async function prebookZone(zoneId, ent, madridista) {
    try {
      let prebookResponse = null;
      if (madridista) {
        prebookResponse = await sendFormDataRequest({
          url: "https://deportes.entradas.com/sports-web/prebook",
          payload: {
            seats: ent,
            sessionId: Number(sessionId),
            teamUcc: "RMA",
            zoneId: zoneId,
            "socios[0].method": document.querySelectorAll('#form-prebook > div > input[name="socios[0].method"]')[0].value,
            "socios[0].numSocio": settings.madridista.login,
            "socios[0].pinSocio": settings.madridista.password,
            "socios[0].method": document.querySelectorAll('#form-prebook > div > input[name="socios[0].method"]')[1].value,
            "socios[0].numFriends": settings.madridista.selection,
            "socios[0].seasonTicket": document.querySelector('#form-prebook > div >  input[name="socios[0].seasonTicket"]').value
          },
        });
      }
      else {
        prebookResponse = await sendFormDataRequest({
          url: "https://deportes.entradas.com/sports-web/prebook",
          payload: {
            seats: ent,
            sessionId: Number(sessionId),
            teamUcc: "RMA",
            zoneId: zoneId,
          },
        });
      }
      
      console.log("Prebook success for zone", zoneId, prebookResponse);
      if (
        prebookResponse.message.includes("Lo sentimos ,  el captcha no se ha validado") ||
        prebookResponse.message.includes("Sorry,captcha not validated")
      ) {
        settings.captcha_required = true;
        saveSettings();
        return null;
      }
      if (prebookResponse.message.includes("Se ha deshabilitado temporalmente el acceso desde esta IP") ||
          prebookResponse.message.includes("Access from this IP has been temporarily disabled")) {
        settings.banned = true;
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
  function submitCustomForm(selector, params) {
    const form = document.querySelector(selector);
    if (!form) {
      console.error(`Form with id '${selector}' not found.`);
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
  init()
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
