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
      const response = await fetch("http://127.0.0.1:5000/api/inventory", {
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
    await fetch("http://localhost:5000/api/inventory/shortage", {
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
        await fetch("http://localhost:5000/api/inventory/" + document.querySelector('select[name=restock_selector]').value, {
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
          <form onSubmit={restockInventory}>
                <select required name='restock_selector'>
                    {
                        inventoryItems.map((item) => (
                            <option key={item.name} value={item.name}>{item.name}</option>
                        ))
                    }
                </select>
                <input required type="number" placeholder='how much' name='restock_input'/>
                <button type="submit">Restock</button>
            </form>
            <ul>
                {
                    shortageItems.length > 0 ? (
                        shortageItems.map((item) => (
                            <li key={item.name}>{item.name} {item.stock}</li>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )
                }
            </ul>
        </main>
      </div>
    </div>
  );
};

export default Inventory;