<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CashierPayment = () => {
    const [itemIds, setItemIds] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);

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
            navigate('/cashier'); // Navigating back to the cashier page
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

    return (
        <div>
            <h1 className='text-lg'>Payment</h1>
            <div style={{ flex: 1 }}>
                <h2 className='mt-4'>Order List</h2>
                {order.length > 0 ? (
                    <ul>
                        {order.map((item) => (
                            <li key={item.id}>
                                {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No items in order.</p>
                )}
                <h3>Total: ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</h3>
            </div>
            <input 
                className="mt-4 bg-white border border-gray-300 rounded px-4 py-2 mb-2"
                type="text" 
                placeholder="Enter customer's name" 
                value={name}
                onChange={changeName}
            />
            <div className='mt-4'>
                {showEmptyMessage && <div>Order is empty</div>}
                <button onClick={toCashierSubmit} className='mr-4'>Submit Payment</button>
                <button onClick={toCashierBack} className='mr-4'>Back</button>
                <button onClick={toCashierCancel} className='mr-4'>Cancel</button>
            </div>
        </div>
=======
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';



const CashierPayment = () => {
    const [total, setTotal] = useState(0);
    const [id, setId] = useState([]);
    const [order,setOrder] = useState([]);


    const [name, setName] = useState('');
    const location = useLocation();

    async function toCashierSubmit() {
        await fetch("http://localhost:5000/api/order", {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "customer_name": name,
                "paid": total,
                "employee_id": 2, //We haven't impelemented this yet
                "menu_items": id,
            })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data['message']);
        }).catch((err) => {
            console.log(err);
        });

        window.location.href = `/cashier`

    }

    async function toCashierCancel() {
        window.location.href = `/cashier/`;
    }

    async function toCashierBack() {
        const encodedTotal = encodeURIComponent(JSON.stringify(total));
        const encodedOrder = encodeURIComponent(JSON.stringify(order));
        const encodedId = encodeURIComponent(JSON.stringify(id));
        window.location.href = `/cashier?total=${encodedTotal}&order=${encodedOrder}&id=${encodedId}`;
    }

    const changeName = (event) => {
        setName(event.target.value);
    }

    useEffect(() => {
        // Extract total from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const totalParam = searchParams.get('total');
        if (totalParam) {
            setTotal(parseFloat(totalParam));
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


    return (
        <div>
            <p>Total: ${total}</p>

            <button onClick={toCashierSubmit}>Submit payment</button>

            <button onClick={toCashierBack}>Back</button>

            <button onClick={toCashierCancel}> Cancel </button>

            <input 
          className="bg-white border border-gray-300 rounded px-4 py-2 mb-2" 
          type="text" 
          placeholder="Enter a Name" 
          onChange={changeName}
        />
        </div>

        
>>>>>>> implemented the features of payment
    );
};

export default CashierPayment;
