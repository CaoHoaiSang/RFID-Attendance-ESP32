import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import History from './pages/History/History'
import Infomation from './pages/Infomation/Infomation'
import Home from './pages/Home/Home'

const App = () => {
  return (
    <div>
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/history' element={<History />} />
          <Route path='/infomation' element={<Infomation />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
