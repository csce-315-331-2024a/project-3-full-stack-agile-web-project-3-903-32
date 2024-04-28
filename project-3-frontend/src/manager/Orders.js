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
      if (isAuthenticatedManager() == 'false') {
        navigate('/'); 
      }
    }, [navigate]);

    // Render the wrapped component if the user is authenticated as a manager
    return isAuthenticatedManager() ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [ascending, setAscending] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    //use when changing the ascending state
    getOrders();
  }, [ascending]);

  useEffect(() => {
    // Call getOrders function whenever startTime or endTime changes
    getOrders(startTime, endTime);
  }, [startTime, endTime]);

  async function getOrders() {
    try {
      let url = process.env.REACT_APP_BACKEND_URL + `/api/order_history?ascending=${ascending}`;
      if(startTime && endTime) {
        url += `&start_time=${startTime}&end_time=${endTime}`; 
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
        deleteOrder(orderId);
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
        // Update the orders state to reflect the change
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
  
    return Array.from(itemMap.values());
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
                    <td className="p-4 text-base text-gray-700">{order.customerName}</td>
                    <td classN-grame="p-4 text-base text-gray-700">{order.time}</td>
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
                      <td colSpan="5" className="p-4">
                        <div className="max-h-40 overflow-auto">
                          <table className="min-w-full">
                            <tbody>
                              {aggregateItems(order.items).map((item, itemIndex) => (
                                <tr key={itemIndex} className="bg-white">
                                  <td className="p-2 text-base text-gray-700">{item.itemName}</td>
                                  <td className="p-2 text-base text-gray-700">${item.price.toFixed(2)}</td>
                                  <td className="p-2 text-base text-gray-700">x {item.count}</td>
                                </tr>
                              ))}
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