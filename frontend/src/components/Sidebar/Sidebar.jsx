import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option">
            <img src={assets.home} alt="" />
            <p>Home</p>
        </NavLink>
        <NavLink to='/history' className="sidebar-option">
            <img src={assets.history} alt="" />
            <p>History</p>
        </NavLink>
        <NavLink to='/infomation' className="sidebar-option">
            <img src={assets.info} alt="" />
            <p>Infomation</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
