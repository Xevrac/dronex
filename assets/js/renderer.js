// Utility function to handle null on frontend pages not requesting information
function updateTextIfExists(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = text;
  } else {
    console.warn(`Element with id "${elementId}" not found on current page.`);
  }
}

// Utility function to safely add event listeners
const addEventListenerIfExists = (elementId, event, handler) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(event, handler);
  } else {
    console.warn(`Element with id "${elementId}" not found. Event listener not added.`);
  }
};

// Update version and environment information if the elements exist
updateTextIfExists(
  'about', 
  `Chrome v${versions.chrome()}, Node.js v${versions.node()}, and Electron v${versions.electron()}`
);

updateTextIfExists(
  'environment', 
  `Dronex v${versions.dronex()}_${versions.environment()}`
);

versions.getCurrentYear()
    .then(currentYear => {
      updateTextIfExists(
        'year', 
        `${currentYear}`
      );
    })
    .catch(error => {
      console.error('Error fetching current year:', error);
    });

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const username = await window.api.getUsername();
      updateTextIfExists('welcome-message', `Welcome ${username},`);
  } catch (error) {
      console.error('Error fetching username:', error);
  }
});

// Initialize the application and log response
const initializeApp = async () => {
  try {
    const response = await window.versions.init();
    console.log(response);
  } catch (error) {
    console.error('Initialization failed:', error);
  }
};
initializeApp();

// Update version information
const updateVersionInfo = async () => {
  try {
    const versionElement = document.getElementById('version');
    const ver = await versions.version();
    updateTextIfExists('version', `v${ver}`);
  } catch (err) {
    updateTextIfExists('version', `Error: ${err}`);
  }
};
updateVersionInfo();

// Add event listeners only if the elements exist
addEventListenerIfExists('toggle-dark-mode', 'click', async () => {
  try {
    const isDarkMode = await window.darkMode.toggle();
    updateTextIfExists('theme-source', isDarkMode ? 'Dark' : 'Light');
  } catch (error) {
    console.error('Failed to toggle dark mode:', error);
  }
});

addEventListenerIfExists('reset-to-system', 'click', async () => {
  try {
    await window.darkMode.system();
    updateTextIfExists('theme-source', 'System');
  } catch (error) {
    console.error('Failed to reset to system theme:', error);
  }
});

// Update online status
const updateOnlineStatus = async () => {
  try {
    const isOnline = await window.network.checkInternetConnection();
    updateTextIfExists('status', isOnline ? 'online' : 'offline');
  } catch (error) {
    console.error('Failed to check internet connection:', error);
    updateTextIfExists('status', 'Error checking status');
  }
};

// Listen for online and offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial online status update
updateOnlineStatus();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const sidebarHTML = await window.api.loadSidebar(); 
    const sidebarContainer = document.querySelector('.sidebar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebarHTML;
    } else {
      console.error('Sidebar container element not found');
    }
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
});

