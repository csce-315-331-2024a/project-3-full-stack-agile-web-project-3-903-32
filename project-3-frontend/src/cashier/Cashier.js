import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

// Exporting the total value without a constant object
export let total = 0;

const Cashier = (props) => {
    const [buttons, setButtons] = useState([]);
    const [order, setOrder] = useState([]);
    const [id, setId] = useState([]);
    const location = useLocation();

    useEffect(() => {
        getMenu();
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

    async function getMenu() {
        try {
            const response = await fetch("http://localhost:5000/api/menu", {
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
            total = round(total + price, 2);
            setId((orderIds) => [...orderIds,item.id])
            setOrder((order) => {
                return [...order, { ...item, price }];
            });
            
        } else {
            console.error('item.price is not a valid number', item);
        }
    };

    const removeFromOrder = (index, order) => {
        if (index >= 0 && index < order.length) {
            const item = order[index];
            if (item) {
                const price = parseFloat(item.price);
                if (!isNaN(price)) { 
                    total = round(total - price, 2);
                    setOrder((order) => order.filter((_, i) => i !== index));
                    setId((orderIds) => order.filter((_,i) => i !== index));
                } else {
                    console.error('item.price is not a valid number', item);
                }
            } else {
                console.error('No item found at the given index', index);
            }
        } else {
            console.error('Invalid index', index);
        }

        
        
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
                            <li key={index}>
                                {item.itemName} - ${item.price.toFixed(2)}
                                <button onClick={() => removeFromOrder(index, order)}>
                                    <p className="ml-4">Remove</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No items in order.</p>
                )}
                <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
            </div>
            <div>
                <button onClick = {toCashierPayment}>Go to Another Page</button>
            </div>
        </div>

    );
};

export default Cashier;
