import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

const Cashier = () => {
    const [buttons, setButtons] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [itemIds, setItemIds] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

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

    const changeOrder = (index,newQuantity) => {
        const parseQuantity = parseInt(newQuantity)
        if(isNaN(parseQuantity) || parseQuantity <= 0)
        {
            const item = order[index];
            const price = parseFloat(item.price);
            setTotal((total) => round(total - price * item.quantity,2));
            setOrder((order) => order.filter((item,idx) => idx !== index));
            return;
        }

        const oldItem = order[index];
        const oldQuantity = oldItem.quantity;
        const price = parseFloat(oldItem.price);
        const diff = newQuantity - oldQuantity;
        const changeInTotal = price * diff;

        setTotal((total) => round(total + changeInTotal, 2));
        setOrder((order) =>
            order.map((item,idx) =>
                idx === index
                    ? { ...item, quantity: newQuantity}
                    : item
            )
        );
    };
    

    // Group buttons into arrays of 5 buttons each
    const buttonGroups = buttons.reduce((acc, button, index) => {
        const groupIndex = Math.floor(index / 4);
        if (!acc[groupIndex]) {
            acc[groupIndex] = [];
        }
        acc[groupIndex].push(button);
        return acc;
    }, []);

    const totalPages = Math.ceil(buttonGroups.length / 3);

    const nextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

    return (
        <div className='flex justify-center gap-20 py-10 w-screen h-screen overflow-x-hidden bg-customMaroon text-white'>
            <div className="flex-col w-1/2">
                <h1 className="text-6xl font-semibold mb-4">Menu</h1>
                <div>
                    <div className="p-4 bg-white rounded-lg overflow-auto text-black">
                        {loading ? ( // Render loading state
                            <p>Loading...</p>
                        ) : (
                            buttonGroups.slice(currentPage * 3, currentPage * 3 + 3).map((group, groupIndex) => (
                                <div key={groupIndex} className="w-full flex justify-start items-center text-center ">
                                    {group.map((button, index) => (
                                        <div key={index} className="w-1/4">
                                            <button onClick={() => addToOrder(button)} className="w-full">
                                                <div className="h-[130px] flex flex-col justify-center p-2 border border-gray-300 bg-gray-200 rounded m-2 font-semibold">
                                                    {button.itemName}
                                                    <span>${button.price}</span>
                                                </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                        {buttonGroups.length > 3 && (
                            <div className="mt-4 flex justify-center text-black font-semibold text-2xl">
                                <button onClick={prevPage} className="mx-2 px-16 py-4 bg-gray-200 rounded-lg">&#60;</button>
                                <p className="mx-2 px-8 py-4 bg-gray-200 rounded-lg ">{currentPage+1}</p>
                                <button onClick={nextPage} className="mx-2 px-16 py- bg-gray-200 rounded-lg">&#62;</button>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ flex: 1 }} className="ml-16 mt-12">
                    <div className="text-4xl font-semibold mt-4 mb-8">
                        <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
                        <button onClick={handlePaymentClick} className='w-full mt-4 mr-4 overflow-y-auto py-4 px-8 bg-gray-50 rounded-lg text-2xl text-black'>Go to Payment</button>
                    </div>
                    <h2 className="font-semibold text-4xl">Order List</h2>
                    <div style={{ width: 450 }} className="w-full p-4 bg-white text-black rounded-lg h-auto">
                        {order.length > 0 ? (
                            <ul>
                                {order.map((item, index) => (
                                    <li key={item.id} style={{height: 60}}className={`mt-2 mb-2 font-semibold text-lg ${index % 2 === 0 ? 'bg-white' : 'bg-gray-300'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="ml-2">
                                                {item.itemName} - ${item.price.toFixed(2)}
                                            </div>
                                            <div className="relative flex items-center px-6 mt-2">
                                                <button onClick={() => removeFromOrder(index)} style  = {{height: 45, width: 30}} className=" bg-red-500 hover:bg-red-700 rounded-l text-2xl ">-</button>
                                                <input
                                                    style = {{height: 45, outline: 'none'}}
                                                    className=" w-16 px-4 bg-customMaroon text-lg text-center text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => changeOrder(index, parseInt(e.target.value))}
                                                    
                                                />
                                                <button onClick={() => addToOrder(item, item.quantity + 1)} style  = {{height: 45, width: 30}} className=" bg-green-500 hover:bg-green-700 rounded-r text-2xl">+</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 font-semibold text-xl">No items in order.</p>
                        )}
                    </div>
                </div>
                <div className="text-4xl font-semibold mt-4">
                    <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
                    <button onClick={handlePaymentClick} className='w-full mt-2 overflow-y-auto py-4 px-8 bg-gray-50 rounded-lg text-2xl text-black'>Go to Payment</button>
                </div>
            {/* </div> */}
        </div>
    );
};

export default Cashier;
