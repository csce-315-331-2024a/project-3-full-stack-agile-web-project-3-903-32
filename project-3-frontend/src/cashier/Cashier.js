import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import TranslateInput, { TranslateText } from "../components/Translate";

const Cashier = () => {
    const [buttons, setButtons] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [itemIds, setItemIds] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const handlePaymentClick = () => {
        navigate('/cashier/payment', { state: { order, total, itemIds } });
    };

    useEffect(() => {
        getMenu();
        if (location.state) {
            const { orderBack, totalBack, itemIdsBack } = location.state;
            setOrder(orderBack);
            setTotal(totalBack);
            setItemIds(itemIdsBack);
        }
    }, [location.state]);

    async function getMenu() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu", {
                method: "GET",
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                setButtons(data);
                setLoading(false); // Set loading to false when data is fetched successfully
            } else {
                console.error('Failed to fetch menu:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    }

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
      }

    const addToOrder = (item) => {
        const price = parseFloat(item.price);
        if (!isNaN(price)) { 
            setTotal((total) => round(total + price, 2));
            setItemIds((itemIds) => [...itemIds, item.id]); 
            setOrder((order) => {
                const existIndex = order.findIndex((orderItem) => orderItem.id === item.id);
                if (existIndex > -1) {
                    return order.map((orderItem, idx) =>
                        idx === existIndex
                            ? { ...orderItem, quantity: orderItem.quantity + 1 }
                            : orderItem
                    );
                } else {
                    return [...order, { ...item, price, quantity: 1 }];
                }
            });  
        } else {
            console.error('item.price is not a valid number', item);
        }
    };

    const removeFromOrder = (index) => {
        if (index >= 0 && index < order.length) {
            const item = order[index];
            if (item) {
                const price = parseFloat(item.price);
                if (!isNaN(price)) { 
                    setTotal((total) => round(total - price, 2));
                    
                    setOrder((order) => {
                        if (item.quantity > 1) {
                            return order.map((orderItem, idx) =>
                                idx === index
                                    ? { ...orderItem, quantity: orderItem.quantity - 1 }
                                    : orderItem
                            );
                        } else {
                            return order.filter((_, idx) => idx !== index);
                        }
                    });

                    setItemIds((itemIds) => {
                        const item = order[index];
                        if (item) {
                            const lastIndex = itemIds.lastIndexOf(item.id);
                            if (lastIndex > -1) {
                                const newItemIds = [...itemIds];
                                newItemIds.splice(lastIndex, 1);
                                return newItemIds;
                            }
                        }
                        return itemIds;
                    });            
                } else {
                    console.error('item.price is not a valid number', item);
                }
            } else {
                console.error('No item found at the given index', index);
            }
        } else {
            console.error('Invalid index', index);
        }
        return order;
    };

    // Group buttons into arrays of 5 buttons each
    const buttonGroups = buttons.reduce((acc, button, index) => {
        const groupIndex = Math.floor(index / 5);
        if (!acc[groupIndex]) {
            acc[groupIndex] = [];
        }
        acc[groupIndex].push(button);
        return acc;
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className='h-screen overflow-auto bg-customMaroon text-white'>
            <div className="flex">
                <TranslateInput />
                <div className="flex-col ml-16 mt-12">
                    <h1 className="text-6xl font-semibold">Menu</h1>
                    <div>
                        <div className="w-full p-4 bg-white rounded-lg h-128 overflow-auto text-black">
                            {loading ? ( // Render loading state
                                <p>Loading...</p>
                            ) : (
                                buttonGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="flex justify-between items-center text-center ">
                                        {group.map((button, index) => (
                                            <div key={index}>
                                                <button onClick={() => addToOrder(button)}>
                                                <div style={{ width: "150px" , height: "150px"}} className="flex flex-col justify-center p-2 border border-gray-300 bg-gray-200 rounded m-2 font-semibold">
                                                    <TranslateText text={button.itemName}/>
                                                    <span className="ml-4">Price: ${button.price}</span>
                                                </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1 }} className="ml-16 mt-12">
                    <div className="text-4xl font-semibold mt-4 mb-8">
                        <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
                        <button onClick={handlePaymentClick} className='w-full mt-4 mr-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded-lg text-2xl text-black'>Go to Payment</button>
                    </div>
                    <h2 className="font-semibold text-4xl">Order List</h2>
                    <div style = {{width: 450}} className="w-full p-4 bg-white text-black rounded-lg h-auto">
                    {order.length > 0 ? (
                        <ul>
                            {order.map((item, index) => (
                                <li key={item.id} style={{ width: '100%', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className={`mt-2 mb-2 font-semibold text-lg h-16 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-300'}`}>
                                    <div>
                                    {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                                    </div>
                                    <button onClick={() => removeFromOrder(index)}>
                                        <p className="ml-4  border-b border-black">Remove</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 font-semibold text-xl"><TranslateText text="No items in order." /></p>
                    )}
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Cashier;
