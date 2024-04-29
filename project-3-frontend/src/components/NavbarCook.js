import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    console.log("Logout");
    navigate('/');
  };


  return (
    <nav className="flex h-[100px] justify-between items-center p-5 bg-white border-b border-gray-200">
      <div className="text-xl font-semibold text-gray-700">REV'S American Grill</div>
      <div className="flex items-center">
        <button
          onClick={handleLogoutClick}
          className="text-white bg-red-500 hover:bg-red-700 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;