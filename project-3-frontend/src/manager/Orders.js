import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/NavbarManager';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    getOrders();
  }, [ascending]);

  async function getOrders() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/api/order_history?ascending=${ascending}`, {
        method: "GET",
        mode: 'cors'
      });
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
          <div className="mb-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setAscending(!ascending)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sort by ID {ascending ? 'Ascending' : 'Descending'}
            </button>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
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
                    <td className="p-4 text-base text-gray-700">{order.employeeID}</td>
                    <td className="p-4 text-base text-gray-700">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4 text-base text-gray-700">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => toggleItemsView(order.orderID)}
                      >
                        {expandedOrderId === order.orderID ? 'Hide Items' : 'View Items'}
                      </button>
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

export default Orders;