import React, { useEffect, useState } from "react";

const Cashier = (props) => {
    const [buttons, setButtons] = useState([]);

    useEffect(() => {
        getMenu();
    }, []);

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

    return (
        <div>
            <h1>Menu</h1>
            {buttons.length > 0 ? (
                buttons.map((button) => (
                    <div>
                        <button>{button.itemName}</button>
                        <span>Price: ${button.price}</span>
                    </div>
                ))
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default Cashier;
