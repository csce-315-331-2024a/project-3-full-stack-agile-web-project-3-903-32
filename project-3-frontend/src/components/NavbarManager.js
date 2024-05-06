import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
/**
 * Has links to every page of the frontend
 * @returns Navbar for Mangager
 */
const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogoutClick = () => {
    console.log("Logout");
    navigate('/');
  };

  const NavComponent = ({ to, text }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => 
          `mx-2 py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-300 rounded-lg transition-colors ${
            isActive ? 'bg-gray-200' : 'bg-gray-100'
          }`
        }
      >
        {text}
      </NavLink>
    );
  }

  return (
    <nav className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
      <h1><div className="text-xl font-semibold text-gray-700">REV'S American Grill</div></h1>
      <div className="flex items-center">
        <NavComponent to="/manager" text='Manager' />
        <NavComponent to="/cashier" text='Cashier' />
        <NavComponent to="/customer" text='Customer' />
        <NavComponent to="/customer/StaticMenu" text='Menu Board' />
        <NavComponent to="/customer/StaticMenu2" text='Menu Board 2' />
        <NavComponent to="/cook" text='Kitchen' />
      </div>
      <div className="flex items-center">
        <button
          onClick={handleLogoutClick}
          className="text-white bg-red-700 hover:bg-red-800 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;