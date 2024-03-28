
import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate, useLocation } from 'react-router-dom';
=======
import { useLocation } from "react-router";

// Exporting the total value without a constant object
export let total = 0;
>>>>>>> implemented the features of payment

const Cashier = () => {
    const [buttons, setButtons] = useState([]);
    const [itemIds, setItemIds] = useState([]);
    const [order, setOrder] = useState([]);
    const [id, setId] = useState([]);
    const location = useLocation();

    const navigate = useNavigate();
    const location = useLocation();

    const handlePaymentClick = () => {
        navigate('/cashier/payment', { state: { order, total, itemIds } });
    };

    useEffect(() => {
        getMenu();
<<<<<<< HEAD
        if (location.state) {
            const { orderBack, totalBack, itemIdsBack } = location.state;
            setOrder(orderBack);
            setTotal(totalBack);
            setItemIds(itemIdsBack);
        }
    }, [location.state]);
=======
        const searchParams = new URLSearchParams(location.search);
        const totalParam = searchParams.get('total');
        if (totalParam) {
            total = (parseFloat(totalParam));
        }
        const orderParam = searchParams.get(`order`);
        if (orderParam) {
            setOrder(JSON.parse(decodeURIComponent(orderParam)));
        }
        const idParam = searchParams.get(`id`);
        if (orderParam) {
            setId(JSON.parse(decodeURIComponent(idParam)));
        }
    }, [location.search]);
>>>>>>> implemented the features of payment

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
<<<<<<< HEAD
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
=======
            total = round(total + price, 2);
            setId((orderIds) => [...orderIds,item.id])
            setOrder((order) => {
                return [...order, { ...item, price }];
            });
            
>>>>>>> implemented the features of payment
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
<<<<<<< HEAD
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
=======
                    total = round(total - price, 2);
                    setOrder((order) => order.filter((_, i) => i !== index));
                    setId((orderIds) => order.filter((_,i) => i !== index));
>>>>>>> implemented the features of payment
                } else {
                    console.error('item.price is not a valid number', item);
                }
            } else {
                console.error('No item found at the given index', index);
            }
        } else {
            console.error('Invalid index', index);
        }
<<<<<<< HEAD
        return order;
=======

        
        
    };

    const toCashierPayment = () => {
        if(total > 0){
            const encodedTotal = encodeURIComponent(JSON.stringify(total));
            const encodedOrder = encodeURIComponent(JSON.stringify(order));
            const encodedId = encodeURIComponent(JSON.stringify(id));
            window.location.href = `/cashier/payment?total=${encodedTotal}&order=${encodedOrder}&id=${encodedId}`;
        } else {
            console.error('price cannot be less than or equal to zero');
        }
            
>>>>>>> implemented the features of payment
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            <div>
                <button onClick = {toCashierPayment}>Go to Another Page</button>
            </div>
        </div>

    );
};

export default Cashier;
