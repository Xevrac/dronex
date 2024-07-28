const information = document.getElementById('about')
information.innerText = `Chrome v${versions.chrome()}, Node.js v${versions.node()}, and Electron v${versions.electron()}`

const env = document.getElementById('environment')
env.innerText = `Dronex v${versions.dronex()}_${versions.environment()}`

const func = async () => {
    const response = await window.versions.init()
    console.log(response)
  }
func()

const version = document.getElementById('version');
versions.version().then((ver) => {
  version.innerText = `v` + ver;
}).catch((err) => {
  version.innerText = `Error: ${err}`;
});

document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

const updateOnlineStatus = async () => {
  const isOnline = await window.network.checkInternetConnection();
  document.getElementById('status').innerHTML = isOnline ? 'online' : 'offline';
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

updateOnlineStatus();