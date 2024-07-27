const information = document.getElementById('about')
information.innerText = `Chrome v${versions.chrome()}, Node.js v${versions.node()}, and Electron v${versions.electron()}`

const env = document.getElementById('environment')
env.innerText = `Dronex v${versions.dronex()}_${versions.environment()}`

const func = async () => {
    const response = await window.versions.init()
    console.log(response)
  }
func()