import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { TranslateText, LanguageContext } from "../components/Translate";
import Navbar from "../components/NavbarCustomer";

const Customer = () => {
    const Category = {
        "null": null,
        "ValueMeals": ["Black Bean Burger", "Bacon Cheeseburger", "Gig Em Patty Melt", "Cheeseburger", "Classic Hamburger"],
        "LimitedTimeOffers": "Limited Time Offers",
        "Burgers": "Burgers",
        "Sandwiches": ["Aggie Chicken Club", "Spicy Chicken Sandwich", "Revs Grilled Chicken Sandwich", "Chicken Sandwich"],
        "Salads": "Salads",
        "ShakesAndMore": "Shakes&More",
        "Appetizers": "Appetizers",
        "Beverages": "Beverages",
    };

    const [buttons, setButtons] = useState([]);
    const [itemIds, setItemIds] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const selectedLanguage = useContext(LanguageContext);
    const [selectedCategory, setSelectedCategory] = useState(Category.null);
    const [invertButton, setInvertButton] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handlePaymentClick = () => {
        navigate('/customer/payment', { state: { order, total, itemIds } });
    };

    useEffect(() => {
        getMenu();

        if (location.state) {
            const { orderBack, totalBack, itemIdsBack } = location.state;
            setOrder(orderBack);
            setTotal(totalBack);
            setItemIds(itemIdsBack);
        }
    }, [location.state, selectedLanguage]);

    async function getMenu() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/api/menu?translate=${selectedLanguage}`, {
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

    const menuRowStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        gap: '10px',
    };

    const menuItemStyle = {
        flexGrow: 1,
        flexBasis: 'calc(33.3333% - 10px)',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
    };

    const itemNameStyle = {
        wordWrap: 'break-word',
        maxWidth: '70%',
        marginRight: 'auto',
    };

    const itemPriceStyle = {
        marginLeft: '10px',
    };

    const invertColor = {
        filter : 'invert(1)'
    };

    const MenuSideBar = () => {
        const categories = Object.keys(Category);
        const sidebarButton = (props) => {
            return (
                <button className="bg-placeholder h-[12.5%] w-full " onClick={()=> setSelectedCategory(props.Category) }>
                    <p>{props.category}</p>
                </button>
            )
        }
        return (
            <div className="w-1/6 flex flex-col h-full">
                {categories.map((category) => {
                    return sidebarButton({ category: category });
                })
                }
            </div>
        );
    }

    return (
        <div className="flex w-screen h-screen" id="MenuContainer" >
            <MenuSideBar />
            {/* <button onClick={()=> {
                document.getElementById('MenuContainer').style.filter = invertButton ? 'invert(0)' : 'invert(1)'
                setInvertButton(!invertButton)
            }}>INVERT</button> */}
            <div className="w-full lg:w-3/4 bg-white shadow-md rounded p-6">
                </div>
                {/* <div style={menuRowStyle}>
                    {buttons.length > 0 ? (
                        buttons.map((button, index) => (
                            <div key={index} style={menuItemStyle} onClick={() => addToOrder(button)}>
                                <span style={itemNameStyle}>
                                    {button.itemName}
                                </span>
                                <span style={itemPriceStyle}>
                                    ${button.price}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p> <TranslateText text='Loading...' /></p>
                    )}
                </div> */}
            <div className="w-full lg:w-1/4 bg-white shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-4"><TranslateText text='Order List' /></h2>
                <div className="divide-y divide-gray-200">
                    {order.length > 0 ? (
                        order.map((item, index) => (
                            <div key={item.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-800"><TranslateText text={item.itemName} /></p>
                                    <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => addToOrder(item)}
                                        className="text-sm bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-l"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeFromOrder(index)}
                                        className="text-sm bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-r"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        ))) : (<p className="text-center text-gray-500"><TranslateText text='No items in order.' /></p>)}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold"><TranslateText text='Total:' /></h3>
                        <p className="text-xl font-semibold">
                            ${typeof total === 'number' ? total.toFixed(2) : '0.00'}
                        </p>
                    </div>
                    <button
                        onClick={handlePaymentClick}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        <TranslateText text='Go to Payment' />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Customer;