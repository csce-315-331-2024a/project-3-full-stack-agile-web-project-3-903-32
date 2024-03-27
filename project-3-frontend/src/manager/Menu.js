import React from 'react';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const Menu = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar /> 
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-700">Menu</h1>
        </header>
        
      </div>
    </div>
  );
};

export default Menu;