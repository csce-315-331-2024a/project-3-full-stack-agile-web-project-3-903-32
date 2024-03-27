import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    getInventory();
  }, []);

  async function getInventory() {
    try {
      const response = await fetch("http://localhost:5000/api/inventory", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar /> 
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-700">Inventory</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="w-1/6 border-b-2 p-4 text-center align-middle text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Minimum
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.name}</td>
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.stock}</td>
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.location}</td>
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.capacity}</td>
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.supplier}</td>
                  <td className="p-3 text-base text-center align-middle text-gray-700">{item.minimum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Inventory;