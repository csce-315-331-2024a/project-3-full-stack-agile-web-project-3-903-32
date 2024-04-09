import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

const Cashier = () => {
    const [buttons, setButtons] = useState([]);
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
        if (!isNaN(price)) { // Check if the price is a valid number after parsing
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

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className='h-screen overflow-auto bg-customMaroon text-white'>
            <div>
                <h1>Menu</h1>
                {buttons.length > 0 ? (
                    buttons.map((button, index) => (
                        <div key={index}>
                            <button onClick={() => addToOrder(button)}>{button.itemName}</button>
                            <span className="ml-4">Price: ${button.price}</span>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <h2>Order List</h2>
                {order.length > 0 ? (
                    <ul>
                        {order.map((item, index) => (
                            <li key={item.id}>
                                {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                                <button onClick={() => removeFromOrder(index)}>
                                    <p className="ml-4">Remove</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No items in order.</p>
                )}
                <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
                <button onClick={handlePaymentClick}>Go to Payment</button>
            </div>
        </div>
    );
};

export default Cashier;