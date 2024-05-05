import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/NavbarManager';
import { useNavigate } from 'react-router-dom';

/**
 * This will return to a boolean on the position of the user, returns true if the user is a manager, false otherwise.
 * @returns a boolean, on whether the user is a manager or not.
 */
const isAuthenticatedManager = () => {
  const isManager = localStorage.getItem("isManagerLoggedIn");
  console.log(isManager);
  return isManager;
};

/**
 * This function will determind if a user is a manager. If the user is not a manager they will be sent back to the landing page.
 * @param {object} WrappedComponent 
 * @returns to the landing page if the user is not a manager
 */
const withManagerAuthentication = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
      if (isAuthenticatedManager() === 'false') {
        navigate('/'); 
      }
    }, [navigate]);

    // Render the wrapped component if the user is authenticated as a manager
    return isAuthenticatedManager() ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};
/**
 * 
 * @param {*} param0 - contains the new Name and the function to update
 * @returns the Order new name
 */
function EditableName({ name, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onUpdate(editedName);
      setEditMode(false);  
    }
  };

  const handleNameClick = () => {
    setEditMode(true);
  };

  const handleChange = (event) => {
    setEditedName(event.target.value);
  };

  return (
    <div>
      {editMode ? (
        <input
          type="text"
          value={editedName}
          onChange={handleChange}
          onKeyDown ={handleKeyPress}
          autoFocus
          onBlur={() => setEditMode(false)}  
          style={{ paddingLeft: '10px', width: '150px' }}
        />
      ) : (
        <span onClick={handleNameClick}>{name}</span>
      )}
    </div>
  );
}
/**
 * Returns the order page which cotains a customer name, total price, items, and completion. It also allows the user to edit some things
 * @returns The order page
 */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [ascending, setAscending] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    getOrders();
  }, [ascending, startTime, endTime]);

  useEffect(() => {
    getMenu();
  }, []);

  async function getOrders() {
    try {
      let url = process.env.REACT_APP_BACKEND_URL + `/api/order_history?ascending=${ascending}`;
      if(startTime && endTime) {
        if(startTime < endTime) {
          url += `&start_time=${startTime}&end_time=${endTime}`; 
        } else {
          alert("Start time cannot be set after the end time.")
        }
        
      }
      const option = {
        method: "GET",
        mode: 'cors'
      };

      const response = await fetch(url,option);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch order history:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/api/order/${orderId}`, {
        method: "DELETE",
        mode: 'cors'
      });
      if (response.ok) {
        getOrders();
      } else {
        console.error('Failed to delete order:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const toggleComplete = async (orderId, isComplete) => {
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/order/${orderId}`;
      const response = await fetch(url, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isComplete }),
        mode: 'cors',
      });
  
      if (response.ok) {
        setOrders(orders.map(order => {
          if (order.orderID === orderId) {
            return { ...order, isComplete };
          }
          return order;
        }));
        alert("Order " + orderId + " is updated successfully!");
      } else {
        console.error('Failed to update order completion status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating order completion status:', error);
    }
  };

  const updateCustomerName = async (orderId, customerName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/order/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Name updated successfully:', data);
        
        setOrders(orders.map(order => {
          if (order.orderID === orderId) {
            return { ...order, customerName };
          }
          return order;
        }));
        
        alert("Customer name of order " + orderId + " is updated successfully!");
        return data; 
      } else {
        console.error('Failed to update customer name:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      throw error; 
    }
  };

  const addNewItem = async (orderId, e, currentAmount) => {
    e.preventDefault();
    const newItemName = e.target.newItemName.value;
    let newItemAmount = Math.abs(parseInt(e.target.newItemAmount.value, 10)); // Ensure positive integer

    // Limit newItemAmount to 99
    newItemAmount = Math.min(newItemAmount, 99);

    const selectedItem = menuItems.find(item => item.itemName === newItemName);
    if (!selectedItem) {
      alert('Item not found');
      return;
    } 

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/order/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addItem: { menu_id: selectedItem.id, amount: newItemAmount }
        })
      });

      if (response.ok) {
        alert('Item added successfully!');
        getOrders(); // Refresh orders to show updated info
      } else {
        console.error('Failed to add item:', await response.json());
      }
    } catch (error) {
      console.error('Error updating name:', error);
      throw error; 
    }
};


  const deleteItem = async (orderId, itemName, itemCount) => {
    const selectedItem = menuItems.find(item => item.itemName === itemName);
    if (!selectedItem) {
      alert('Item not found');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/order/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteItem: { menu_id: selectedItem.id, amount: itemCount }
        })
      });
  
      if (response.ok) {
        alert('Item deleted successfully!');
        getOrders(); // Refresh orders to show updated info
      } else {
        console.error('Failed to delete item:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error; 
    }
  };

  const updateAmountItem = async (orderId, itemName, oldCount, e) => {
    e.preventDefault();
    const newCount = Math.abs(parseInt(e.target.newItemAmount.value, 10)); // Ensure positive integer

    newCount = Math.min(99,newCount);

    const selectedItem = menuItems.find(item => item.itemName === itemName);
    if (!selectedItem) {
      alert('Item not found');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/order/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateItem: { menu_id: selectedItem.id, old_amount: oldCount, new_amount: newCount }
        })
      });

      if (response.ok) {
        alert('Item updated successfully!');
        getOrders(); // Refresh orders to show updated info
      } else {
        console.error('Failed to update item:', await response.json());
      }
    } catch (error) {
      console.error('Error updating item:', error);
      throw error; 
    }
};

  async function getMenu() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  const toggleItemsView = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  function aggregateItems(items) {
    const itemMap = new Map();
  
    items.forEach((item) => {
      const existingItem = itemMap.get(item.itemName);
      if (existingItem) {
        existingItem.count += 1;
      } else {
        itemMap.set(item.itemName, { ...item, count: 1 });
      }
    });
  
    return Array.from(itemMap.values()).sort((a, b) => a.itemName.localeCompare(b.itemName));;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <div className="mb-4 flex justify-start items-center">
            <button
              type="button"
              onClick={() => setAscending(!ascending)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            >
              Sort by Time 
            </button>

            <label htmlFor ="start-time" className='ml-4'>
              <span className = 'mr-2'>Start Time:</span> 
              <input
                type = "datetime-local"
                id = "start-time"
                name = "start-time"
                value = {startTime}
                onChange = {(e) => setStartTime(e.target.value)}
                className = 'border-2 border-gray-300 p-2 rounded-lg'
              />
            </label>

            <label htmlFor ="end-time" className='ml-4'>
              <span className = 'mr-2'>End Time:</span> 
              <input
                type = "datetime-local"
                id = "end-time"
                name = "end-time"
                value = {endTime}
                onChange = {(e) => setEndTime(e.target.value)}
                className = 'border-2 border-gray-300 p-2 rounded-lg'
              />
            </label>
          </div>
          <table className="min-w-full bg-white text-center">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Complete
                </th>
                <th className="border-b-2 p-4 text-center text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <React.Fragment key={index}>
                  <tr className="bg-white border-b">
                    <td className="p-4 text-base text-gray-700">{order.orderID}</td>
                    <td className="p-4 text-base text-gray-700">
                      <EditableName
                        name={order.customerName}
                        onUpdate={(newName) => updateCustomerName(order.orderID, newName)}                    
                      />
                    </td>
                    <td className="p-4 text-base text-gray-700">{order.time}</td>
                    <td className="p-4 text-base text-gray-700">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4 text-base text-gray-700">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => toggleItemsView(order.orderID)}
                      >
                        {expandedOrderId === order.orderID ? 'Hide' : 'View'}
                      </button>
                    </td>
                    <td className="p-4 text-base text-gray-700">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={order.isComplete}
                          onChange={() => toggleComplete(order.orderID, !order.isComplete)}
                          className="form-checkbox text-blue-500 h-6 w-6 rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </label>
                    </td>
                    <td className="p-4 text-base text-gray-700">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteOrder(order.orderID)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.orderID && (
                    <tr className="bg-gray-100 border-b">
                      <td colSpan="7">
                        <div className="p-4">
                          <table className="min-w-full">
                            <tbody>
                              {aggregateItems(order.items).map((item, itemIndex) => (
                                <tr key={itemIndex} className="bg-white">
                                  <td className="p-2 text-base text-gray-700">{item.itemName}</td>
                                  <td className="p-2 text-base text-gray-700">${item.price.toFixed(2)}</td>
                                  <td className="p-2 text-base text-gray-700">
                                    <form onSubmit={(e) => updateAmountItem(order.orderID, item.itemName, item.count, e)}>
                                      <input
                                        type="number"
                                        name="newItemAmount"
                                        placeholder="Amount"
                                        defaultValue={item.count}
                                        required
                                        min="1"  // Ensure input is always a positive number
                                        className="w-1/4 mt-2 border-2 border-gray-300 p-1 rounded-lg"
                                      />
                                    </form>
                                  </td>
                                  <td className="p-2">
                                    <button
                                      type="button"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => deleteItem(order.orderID, item.itemName, item.count)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan="4">
                                  <form onSubmit={(e) => addNewItem(order.orderID, e)}>
                                    <select name="newItemName" required className="mt-2 mr-4 border-2 border-gray-300 p-1 rounded-lg">
                                      {menuItems.map(item => (
                                        <option key={item.id} value={item.itemName}>{item.itemName}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="number"
                                      name="newItemAmount"
                                      placeholder="Amount"
                                      required
                                      min="1"  // Ensure input is always a positive number
                                      className="mt-2 mr-4 border-2 border-gray-300 p-1 rounded-lg"
                                    />
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                                      Add Item
                                    </button>
                                  </form>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default withManagerAuthentication(Orders);