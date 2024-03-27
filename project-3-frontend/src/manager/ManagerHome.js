import React from 'react';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const ManagerHome = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar /> 
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-700">Manager Dashboard</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          {/* Main content goes here */}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome, Manager!</h2>
            <p className="text-gray-700">
              This is your dashboard where you can find an overview of your managerial tasks and updates.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerHome;