import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePergunta } from './Page/perguntaaoUsuario/HomePergunta'
import { Dashboard } from './Page/DashBoard/Dashboard'


function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePergunta/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
