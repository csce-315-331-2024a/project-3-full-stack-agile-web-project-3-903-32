import React, { useEffect, useState } from "react";

const Cashier = (props) => {
    const [buttons, setButtons] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        getMenu();
    }, []);

    async function getMenu() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/menu", {
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
                    setTotal((total) => round(total - price, 2));
                    setOrder((order) => order.filter((_, i) => i !== index));
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
        </div>
    );
};

export default Cashier;