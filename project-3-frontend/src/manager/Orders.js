import React from 'react';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';

const Orders = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar /> 
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> 
      </div>
    </div>
  );
};

export default Orders;