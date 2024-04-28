import React, { useEffect, useState } from "react";
import Navbar from "../components/NavbarCashier";
import ConfirmModal from "../components/ModalCookConfirm";

const CookScreen = () => {
    const [order, setOrder] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [orderIdToComplete, setOrderIdToComplete] = useState(null);

    // Function to fetch order data
    useEffect(() => {
      // Function to fetch order data
      const fetchOrders = async () => {
          try {
              const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/order_history?ascending=${encodeURIComponent(true)}&is_complete=${encodeURIComponent(false)}`);
              if (!response.ok) {
                  throw new Error('Failed to fetch orders');
              }
              const data = await response.json();
              const formattedData = data.map(order => ({
                  id: order.orderID,
                  name: order.customerName,
                  time: order.time,
                  items: order.items,
                  complete: order.isComplete
              }));
              setOrder(formattedData);
          } catch (error) {
              console.error('Error fetching orders:', error);
          }
      };

      // Initial fetch
      fetchOrders();

      // Polling interval
      const intervalId = setInterval(fetchOrders, 5000); // Fetch orders every 5 seconds

      // Cleanup
      return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once on mount



    function aggregateItems(itms) {
        const itemMap = new Map();

        itms.forEach((item) => {
            const existingItem = itemMap.get(item.itemName);
            if (existingItem) {
                existingItem.count += 1;
            } else {
                itemMap.set(item.itemName, { ...item, count: 1 });
            }
        });

        return Array.from(itemMap.values());
    }

    const handleConfirm = async () => {
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/order/${orderIdToComplete}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isComplete: true }),
                mode: 'cors',
            });

            if (response.ok) {
                // Remove the order from the state
                setOrder(order.filter(order => order.id !== orderIdToComplete));
                setModalMessage('');
                setModalOpen(false);
            } else {
                console.error('Failed to update order completion status:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error updating order completion status:', error);
        }
    };

    const handleCancel = () => {
        setModalMessage('');
        setModalOpen(false);
    };

    const toggleComplete = (orderId) => {
        setModalMessage("Are you sure you want to complete this order?");
        setOrderIdToComplete(orderId);
        setModalOpen(true);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />
            <div className='flex justify-center gap-20 py-10 w-screen h-screen overflow-x-hidden bg-customMaroon text-white'>
                <div className="flex-col">
                    <h1 className="text-6xl font-semibold mb-4">Orders Queue</h1>

                    <div className='w-[1200px] h-auto p-4 bg-white rounded-lg text-black'>
                        <div>
                            {order.length > 0 ? (
                                order.map((item, index) => (
                                    <div key={item.orderId} className="overflow-auto">
                                        <div className="flex justify-between mb-2">
                                            <div className="flex mr-2 text-xl">
                                                <div className="w-[200px]">
                                                    <p className="mr-2"><strong>Order ID:</strong> {item.id}</p>
                                                </div>
                                                <div className="w-[400px]">
                                                    <p className="mr-2"><strong>Customer:</strong> {item.name}</p>
                                                </div>

                                                <div className="w-[400px]">
                                                    <p><strong>Time:</strong> {item.time}</p>
                                                </div>
                                            </div>
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => toggleComplete(item.id)}>
                                                Complete Order
                                            </button>
                                        </div>
                                        <table className="ml-4 mb-4 px-4 py-2 text-lg" >
                                            <tr className="border-b-2 border-gray-500 ">
                                                <th className="text-start w-[600px]"> Menu Item</th>
                                                <th className="text-start w-[400px]"> Quantity</th>
                                            </tr>
                                            <tbody>
                                                {aggregateItems(item.items).map((item, itemIndex) => (
                                                    <tr key={itemIndex} className="bg-white ">
                                                        <td className="p-2 text-base text-gray-800">{item.itemName}</td>
                                                        <td className="p-2 text-base text-gray-800">x {item.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                    </div>
                                ))
                            ) : (
                                <p className='text-xl'>No Ordres in Queue</p>
                            )}
                        </div>
                    </div>

                </div>


            </div>
            <ConfirmModal isOpen={modalOpen} message={modalMessage} onConfirm={handleConfirm} onCancel={handleCancel} />
        </div>
    );
};

export default CookScreen;
