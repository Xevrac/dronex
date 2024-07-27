const information = document.getElementById('about')
information.innerText = `Dronex (v${versions.dronex()}), Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
    const response = await window.versions.init()
    console.log(response)
  }
  
func()