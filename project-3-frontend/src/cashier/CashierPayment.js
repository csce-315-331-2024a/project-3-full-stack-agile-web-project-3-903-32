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

        
    );
};

export default CashierPayment;
