import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CashierPayment = () => {
    const [itemIds, setItemIds] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [paymentSumbitted, setSubmitted] = useState(false);

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
    const toCashierSubmit = async () => {
        try {
            if (total <= 0.0) {
                console.log("Empty order");
                setShowEmptyMessage(true); // Show the empty order message
                setTimeout(() => setShowEmptyMessage(false), 3000); // Hide the message after 3 seconds
                return;
            }
            if(!paymentSumbitted){
                if(total > 0.0){
                    setSubmitted(true);
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
                navigate('/cashier/confirm'); // Navigating back to the payment confirmation then back to cashier page
            } else {
                console.log("Payment already submitted")
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Function to handle cancellation
    const toCashierCancel = () => {
        navigate('/cashier');
    };

    // Function to handle the back action
    const toCashierBack = () => {
        navigate('/cashier', {
            state: { orderBack: order, totalBack: total, itemIdsBack: itemIds }
        });
    };

    // Function to handle name change
    const changeName = (event) => {
        setName(event.target.value);
    };

    // background
    return (
        <div className='h-screen overflow-hidden bg-customMaroon'> {/* This set Background Color */}
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                <div className='w-full ml-64'>
                    <div className=' p-4 text-white text-6xl font-bold'> {/*This determinds the location of Payment text*/}
                        <h1>Payment</h1>
                    </div>
                    <div className="w-1/2 p-4 bg-white rounded-lg shadow-md h-96 overflow-auto mr-80"> {/*This determinds the location */}
                        <div className="flex flex-col items-right">
                            <h2 className='mt-1 mb-2 font-semibold text-4xl'>Order List</h2>
                            <div className='border-b border-black border-2 mb-2'></div>
                
                            <div className="overflow-auto">
                                {order.length > 0 ? (
                                    <ul>
                                        {order.map((item,index) => (
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

            <div className='absolute overflow-hidden bottom-22 right-10 mb-4 mr-8'>
                <div className='flex flex-col items-center w-full'>
                    <div className='p-4 text-white text-3xl font-semibold'>
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
                {showEmptyMessage && <div>Order is empty</div>}
            <div className='flex flex-col'>
                    <button onClick={toCashierSubmit} disabled={paymentSumbitted}className='w-full mr-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded text-2xl'>Submit Payment</button>
                    <button onClick={toCashierBack} className='w-full mt-4 mr-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded text-2xl'>Back</button>
                    <button onClick={toCashierCancel} className='w-full mt-4 mr-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded text-2xl'>Cancel</button>                
            </div>
            </div>
            </div>
    </div>
    );
};

export default CashierPayment;
