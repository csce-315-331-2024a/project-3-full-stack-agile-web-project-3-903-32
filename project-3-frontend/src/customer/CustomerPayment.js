import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerPayment = () => {
    const [itemIds, setItemIds] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Extracts query parameters and sets state
    useEffect(() => {
        if (location.state) {
            const { order, total, itemIds } = location.state;
            setTotal(total);
            setOrder(order);
            setItemIds(itemIds); // Assuming 'order' is an array of items with 'id' properties
        }
    }, [location.state]);

    // Function to handle form submission
    const toCustomerSubmit = async () => {
        try {
            if (total <= 0.0) {
                console.log("Empty order");
                setShowEmptyMessage(true); // Show the empty order message
                setTimeout(() => setShowEmptyMessage(false), 3000); // Hide the message after 3 seconds
                return;
            }

            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/order", {
                method: "POST",
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "customer_name": name,
                    "paid": total,
                    "employee_id": 2, // This should be updated to the actual employee_id once implemented
                    "menu_items": itemIds,
                })
            });

            const data = await response.json();
            console.log(data['message']);
            navigate('/customer'); // Navigating back to the Customer page
        } catch (err) {
            console.error(err);
        }
    };

    // Function to handle cancellation
    const toCustomerCancel = () => {
        navigate('/customer');
    };

    // Function to handle the back action
    const toCustomerBack = () => {
        navigate('/customer', {
            state: { orderBack: order, totalBack: total, itemIdsBack: itemIds }
        });
    };

    // Function to handle name change
    const changeName = (event) => {
        setName(event.target.value);
    };

    const showConfirmationModal = () => {
        setShowConfirmation(true);
    };

    const closeConfirmationModal = () => {
        setShowConfirmation(false);
    };

    const confirmSubmit = async () => {
        await toCustomerSubmit();
        closeConfirmationModal(); 
    };

    return (
        <div className="mt-5 max-w-2xl mx-auto p-5 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Payment</h1>
            <div>
                <h2 className="text-xl font-semibold mt-4 mb-4 text-gray-700">Order List</h2>
                {order.length > 0 ? (
                <ul className="list-none">
                    {order.map((item) => (
                    <li key={item.id} className="py-2 border-b border-gray-200">
                        {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-gray-500">No items in order.</p>
                )}
                <h3 className="text-lg font-semibold text-right mt-4">Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
            </div>
            <input 
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text" 
                placeholder="Enter customer's name" 
                value={name}
                onChange={changeName}
            />
            <div className="flex justify-center mt-6 space-x-4">
                {showEmptyMessage && <div className="text-red-500">Order is empty</div>}
                <button onClick={showConfirmationModal} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Submit Payment
                </button>
                <button onClick={toCustomerBack} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                Back
                </button>
                <button onClick={toCustomerCancel} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                Cancel
                </button>
            </div>
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <h3 className="mb-4 text-lg font-bold">Confirm Payment</h3>
                        <p>Are you sure you want to submit the payment?</p>
                        <div className="flex justify-around mt-6">
                            <button onClick={confirmSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none">
                                Confirm
                            </button>
                            <button onClick={closeConfirmationModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );    
};

export default CustomerPayment;