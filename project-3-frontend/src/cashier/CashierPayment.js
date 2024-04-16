import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {ThreeDots} from 'react-loader-spinner'; // Import the loader spinner

const CashierPayment = () => {
    const [itemIds, setItemIds] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage loading spinner

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state) {
            const { order, total, itemIds } = location.state;
            setTotal(total);
            setOrder(order);
            setItemIds(itemIds);
        }
    }, [location.state]);

    const toCashierSubmit = async () => {
        try {
            if (total <= 0.0) {
                console.log("Empty order");
                setShowEmptyMessage(true);
                setTimeout(() => setShowEmptyMessage(false), 3000);
                return;
            }
            if (!paymentSubmitted) {
                setLoading(true); // Show loading spinner when payment submission starts
                if (total > 0.0) {
                    setPaymentSubmitted(true);
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
                        "employee_id": 2,
                        "menu_items": itemIds,
                    })
                });

                const data = await response.json();
                console.log(data['message']);
                navigate('/cashier/confirm');
            } else {
                console.log("Payment already submitted")
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false); // Hide loading spinner when payment submission is completed
        }
    };

    const toCashierCancel = () => {
        navigate('/cashier');
    };

    const toCashierBack = () => {
        navigate('/cashier', {
            state: { orderBack: order, totalBack: total, itemIdsBack: itemIds }
        });
    };

    const changeName = (event) => {
        setName(event.target.value);
    };

    return (
        <div className='h-screen overflow-hidden bg-customMaroon'>
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                <div className='w-full ml-64'>
                    <div className=' p-4 text-white text-6xl font-bold'>
                        <h1>Payment</h1>
                    </div>
                    <div className="w-1/2 p-4 bg-white rounded-lg shadow-md h-96 overflow-auto mr-80">
                        <div className="flex flex-col items-right font-semibold">
                            <h2 className='mt-1 mb-2  text-4xl'>Order List</h2>
                            <div className='border-b border-black border-2 mb-2'></div>

                            <div className="overflow-auto">
                                {order.length > 0 ? (
                                    <ul>
                                        {order.map((item, index) => (
                                            <li key={item.id} className={`text-xl font-semibold mt-2 mb-2' ${index % 2 === 0 ? 'bg-white' : 'bg-gray-300'}`}>
                                                {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='text-xl'>No items in order.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='absolute overflow-hidden bottom-22 right-10 mb-4 mr-8 font-semibold'>
                    <div className='flex flex-col items-center w-full'>
                        <div className='p-4 text-white text-3xl'>
                            <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
                        </div>
                        <div>
                            <input
                                className="w-full mr-4 mb-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded text-2xl"
                                type="text"
                                placeholder="Enter customer's name"
                                value={name}
                                onChange={changeName}
                            />
                        </div>
                    </div>
                    {showEmptyMessage ? (
                        <div className='text-white text-2xl'>Empty Order</div>
                    ) : (
                        <button onClick={toCashierSubmit} disabled={order.length === 0 || paymentSubmitted || loading} className={`w-full mr-4 overflow-y-auto py-2 rounded text-2xl ${order.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-50'}`}>
                            {loading ? ( // Show loading spinner when loading is true
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <ThreeDots type="ThreeDots" color="#000000" height={30} width={30} />
                                </div>
                            ) : (
                                order.length === 0 ? 'No Items in Order' : 'Submit Payment'
                            )}
                        </button>
                    )}
                    <button onClick={toCashierBack} className='w-full mt-4 mr-4 overflow-y-auto py-2 bg-gray-50 rounded text-2xl'>Back</button>
                    <button onClick={toCashierCancel} className='w-full mt-4 mr-4 overflow-y-auto py-2 bg-gray-50 rounded text-2xl'>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CashierPayment;
