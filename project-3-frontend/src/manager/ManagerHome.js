import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar'; 

const ManagerHome = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar /> 
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          {/* Main content goes here */}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome, Manager!</h2>
            <p className="text-gray-700">
              This is your dashboard where you can find an overview of your managerial tasks and updates.
            </p>
            {/* Other content */}
          </div>
        </main>
      </div>
    </div>
  );
};


export default ManagerHome;