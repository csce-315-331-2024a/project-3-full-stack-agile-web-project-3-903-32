import React, { useEffect, useState } from 'react';

const Inventory = () => {
    const[inventory, setInventory] = useState([]);
    const[shortage, setShortage] = useState([]);

    async function getInventory() {
        await fetch("http://localhost:5000/api/inventory", {
            method: "GET",
            mode: 'cors',
        })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            setInventory(data);
        }).catch((err) => {
            console.log(err);
        });
    }

    async function getShortage() {
        await fetch("http://localhost:5000/api/inventory/shortage", {
            method: "GET",
            mode: 'cors',
        })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            setShortage(data);
        }).catch((err) => {
            console.log(err);
        });
    }

    async function restockInventory(event) {
        event.preventDefault();
        try {
            // console.log(document.querySelector('select[name=restock_selector]').value);
            await fetch("http://localhost:5000/api/inventory/" + document.querySelector('select[name=restock_selector]').value, {
                method: "PUT",
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "name": document.querySelector('select[name=restock_selector]').value,
                    "add_stock": document.querySelector('input[name=restock_input]').value,
                })
            })
            .then((res) => res.json())
            .then((data) => {
                getInventory();
                getShortage();
                console.log(data['message']);
            }).catch((err) => {
                console.log(err);
            });
        } catch {
            console.log("Error");
        }
    }

    useEffect(() => {
        getInventory();
        getShortage();
    }, []);
    
    return (
        <div>
            <h1>Inventory</h1>
            <ul>
            {inventory.length > 0 ? (
                inventory.map((item) => (
                    <li key={item.name}>{item.name} {item.stock}</li>
                ))
            ) : (
                <p>Loading...</p>
            )}
            </ul>
            <div>
                <button onClick={getInventory}>Refresh</button>
            </div>
            <form onSubmit={restockInventory}>
                <select required name='restock_selector'>
                    {
                        inventory.map((item) => (
                            <option key={item.name} value={item.name}>{item.name}</option>
                        ))
                    }
                </select>
                <input required type="number" placeholder='how much' name='restock_input'/>
                <button type="submit">Restock</button>
            </form>
            <ul>
                {
                    shortage.length > 0 ? (
                        shortage.map((item) => (
                            <li key={item.name}>{item.name} {item.stock}</li>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )
                }
            </ul>
        </div>
    );
}

export default Inventory;