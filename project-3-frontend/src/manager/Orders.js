import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/order_history", {
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
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
                              {order.items.map((item, itemIndex) => (
                                <tr key={itemIndex} className="bg-white">
                                  <td className="p-2 text-base text-gray-700">{item.itemName}</td>
                                  <td className="p-2 text-base text-gray-700">${item.price.toFixed(2)}</td>
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