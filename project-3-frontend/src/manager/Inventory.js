import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/NavbarManager';
import { useNavigate } from 'react-router-dom';


const isAuthenticatedManager = () => {
  const isManager = localStorage.getItem("isManagerLoggedIn");
  console.log(isManager);
  return isManager;
};

const withManagerAuthentication = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
      console.log("HERE");
      if (isAuthenticatedManager() === 'false') {
        navigate('/'); 
      }
    }, [navigate]);

    // Render the wrapped component if the user is authenticated as a manager
    return isAuthenticatedManager() ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};




const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const[shortageItems, setShortageItems] = useState([]);

  useEffect(() => {
    getInventory();
    getShortage();
  }, []);

  async function getInventory() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory", {
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
        const inventoryId = document.querySelector('select[name=restock_selector]').value;
        const addStock = document.querySelector('input[name=restock_input]').value;
        
        // console.log(document.querySelector('select[name=restock_selector]').value);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/inventory/${inventoryId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                add_stock: addStock
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Updates were successful, refresh inventory data
            getInventory();
            getShortage();
            alert('Stock updated successfully.');
        } else {
            // Handle errors, such as stock level out of bounds
            alert(data['error']); // Show an error message from the server
        }
    } catch {
        console.log("Error");
    }
  }

  function handleShortage(event) {
    document.querySelector('select[name=restock_selector]').value = event.target.innerText.split('(')[0].slice(0, -1);
    console.log(document.querySelector('input[name=restock_input]').value = event.target.innerText.split('(')[1].split(' ')[2].slice(0, -1));
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar /> 
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
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
                      Minimum
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Supplier
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 text-center text-gray-700">{item.name}</td>
                      <td className="p-3 text-center text-gray-700">{item.stock}</td>
                      <td className="p-3 text-center text-gray-700">{item.minimum}</td>
                      <td className="p-3 text-center text-gray-700">{item.capacity}</td>
                      <td className="p-3 text-center text-gray-700">{item.location}</td>
                      <td className="p-3 text-center text-gray-700">{item.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-white p-6 border-b border-gray-200"> {/* Restock form container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Restock Inventory</h2>
                <form onSubmit={restockInventory} className="space-y-4">
                  <label for="item"><select required name='restock_selector' className="w-full p-2 border border-gray-300 rounded">
                    {inventoryItems.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select></label>
                  <label for="amount"><input required type="number" placeholder='Amount' name='restock_input' className="w-full p-2 border border-gray-300 rounded" /></label>
                  <button type="submit" className="w-full p-2 bg-blue-700 text-white rounded hover:bg-blue-600">Restock</button>
                </form>
              </div>
              <div className="bg-white p-6 border-b border-gray-200"> {/* Shortage items container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Shortage Items</h2>
                <ul className="space-y-2">
                  {shortageItems.length > 0 ? (
                    shortageItems.map((item) => (
                      <li key={item.name} className="p-2 bg-red-100 border border-red-200 rounded">
                        <button className='w-full h-full text-left' onClick={handleShortage}>
                          {item.name} (Short by {item.minimum - item.stock})
                        </button>
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

export default withManagerAuthentication(Inventory);
