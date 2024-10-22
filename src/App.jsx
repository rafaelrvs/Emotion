import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePergunta } from './Page/perguntaaoUsuario/HomePergunta'
import { Dashboard } from './Page/Apresentacao/dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='appMain'>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePergunta/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
    
    </div>
  )
}

export default App
