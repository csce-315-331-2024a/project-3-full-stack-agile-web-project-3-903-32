import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const[shortageItems, setShortageItems] = useState([]);

  useEffect(() => {
    getInventory();
    getShortage();
  }, []);

  async function getInventory() {
    try {
<<<<<<< HEAD
      const response = await fetch("http://127.0.0.1:5000/api/inventory", {
=======
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory", {
>>>>>>> origin
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

  async function getShortage() {
    await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/shortage", {
        method: "GET",
        mode: 'cors',
    })
    .then((res) => res.json())
    .then((data) => {
        // console.log(data);
        setShortageItems(data);
    }).catch((err) => {
        console.log(err);
    });
  }

  async function restockInventory(event) {
    event.preventDefault();
    try {
        // console.log(document.querySelector('select[name=restock_selector]').value);
        await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/" + document.querySelector('select[name=restock_selector]').value, {
            method: "PUT",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": document.querySelector('select[name=restock_selector]').value,
                "add_stock": document.querySelector('input[name=restock_input]').value,
            })
        })
        .then((res) => res.json())
        .then((data) => {
            getInventory();
            getShortage();
            console.log(data['message']);
        }).catch((err) => {
            console.log(err);
        });
    } catch {
        console.log("Error");
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
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-6">
            <div className="flex-1 bg-white p-6 border-b border-gray-200 mb-6"> {/* Inventory table container */}
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Minimum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 text-center text-gray-700">{item.name}</td>
                      <td className="p-3 text-center text-gray-700">{item.stock}</td>
                      <td className="p-3 text-center text-gray-700">{item.location}</td>
                      <td className="p-3 text-center text-gray-700">{item.capacity}</td>
                      <td className="p-3 text-center text-gray-700">{item.supplier}</td>
                      <td className="p-3 text-center text-gray-700">{item.minimum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-white p-6 border-b border-gray-200"> {/* Restock form container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Restock Inventory</h2>
                <form onSubmit={restockInventory} className="space-y-4">
                  <select required name='restock_selector' className="w-full p-2 border border-gray-300 rounded">
                    {inventoryItems.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <input required type="number" placeholder='Amount' name='restock_input' className="w-full p-2 border border-gray-300 rounded" />
                  <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Restock</button>
                </form>
              </div>
              <div className="bg-white p-6 border-b border-gray-200"> {/* Shortage items container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Shortage Items</h2>
                <ul className="space-y-2">
                  {shortageItems.length > 0 ? (
                    shortageItems.map((item) => (
                      <li key={item.name} className="p-2 bg-red-100 border border-red-200 rounded">
                        {item.name} (Short by {item.stock})
                      </li>
                    ))
                  ) : (
                    <li className="p-2">No shortage items</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;