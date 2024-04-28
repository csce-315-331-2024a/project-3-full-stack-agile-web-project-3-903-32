import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { TranslateText, LanguageContext } from "../components/Translate";
import Modal from "../components/ModalCustomer";
import { StaticOrderingWords } from "./CustomerConstants";
import { NavLink } from 'react-router-dom';

const Customer = () => {
    const [fullMenu, setFullMenu] = useState([]);
    const [itemIds, setItemIds] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [displayedMenu, setDisplayedMenu] = useState(fullMenu);
    const [staticTranslations, setStaticTranslations] = useState(StaticOrderingWords);

    const selectedLanguage = useContext(LanguageContext);
    const [invertButton, setInvertButton] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    const handlePaymentClick = () => {
        navigate('/customer/payment', { state: { order, total, itemIds } });
    };

    const handleViewIngredients = (event, item) => {
        event.stopPropagation();
        getMenuInventory(item.id);
        setSelectedItem(item);
    };

    const getStaticWord = (word) => {
        return (
        <span>
            {
                staticTranslations[StaticOrderingWords.indexOf(word)]
            }
        </span>);
    };

    useEffect(() => {
        postStaticTranslations();
        getMenu();

        if (location.state) {
            const { orderBack, totalBack, itemIdsBack } = location.state;
            setOrder(orderBack);
            setTotal(totalBack);
            setItemIds(itemIdsBack);
        }
    }, [location.state, selectedLanguage]);

    useEffect(() => {
        getCategory();
        setDisplayedMenu(fullMenu);
    }, [fullMenu]);

    useEffect(() => {
        setDisplayedMenu([]);
        if (selectedCategory === 'All') {
            console.log('All');
            setDisplayedMenu(fullMenu);
        } else {
            console.log('Category:', selectedCategory);
            setDisplayedMenu(fullMenu.filter(item => item.category === selectedCategory));
            // console.log(fullMenu.filter(item => item.category === selectedCategory));
        }
    }, [selectedCategory]);

    async function postStaticTranslations() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/translate", {
                method: "POST",
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "text": staticTranslations,
                    "target_language": selectedLanguage
                })
            });
            if (response.ok) {
                const data = await response.json();
                setStaticTranslations(data.translated_text);
            } else {
                console.error('Failed to fetch static translations:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching static translations:', error);
        }
    }

    async function getMenu() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/api/menu?translate=${selectedLanguage}`, {
                method: "GET",
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                setFullMenu(data);
            } else {
                console.error('Failed to fetch menu:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    }

    async function getCategory() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/menu/category', {
                method: "GET",
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                const data_all = ['All', ...data];
                setCategories(data_all);
            } else {
                console.error('Failed to fetch category:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    }

    const getMenuInventory = async (menuId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/mijunc/${menuId}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryData(data);
                setModalOpen(true);
            } else {
                console.error('Failed to fetch inventory:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

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

    const imageMapping = {
        'Burger': 'https://images.unsplash.com/photo-1565299636920-2b1b2b1cbf9f',
    }

    const invertColor = {
        filter : 'invert(1)'
    };

    const MenuSideBar = () => {
        const sidebarButton = (props) => {
            const sideBarImage = {
                backgroundImage: `url(${imageMapping[props.category]})`,
            }

            return (
                <button className="bg-placeholder h-[12.5%] w-full border-gray-500 border" key={props.category} style={sideBarImage} onClick={()=> {
                    setSelectedCategory(props.category)
                    } }>
                    <p>
                        {
                            getStaticWord(props.category)
                        }
                    </p>
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
    
    const handleRecommendedItemClick = (recommendedItem) => {
        addToOrder(recommendedItem);
      };
    
      return (
        <div className="flex w-screen h-screen" id="MenuContainer" >
            <MenuSideBar />
           
            <div className="w-full lg:w-[70%] bg-white shadow-md rounded p-6 grid grid-cols-4 gap-4 auto-cols-fr overflow-y-auto">
                {displayedMenu.length > 0 ? (
                    displayedMenu.map((button, index) => (
                        <button key={index} onClick={() => addToOrder(button)} className="relative bg-gray-200 p-4 rounded-lg flex flex-col text-left h-48 justify-end">
                            <img src="" alt="Image" className="h-30 w-30" />
                            <span className="text-xl font-bold">{button.itemName}</span>
                            <span className="text-lg font-bold text-center">${button.price}</span>
                            <button onClick={(event) => handleViewIngredients(event, button)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                                {
                                    getStaticWord("View Ingredients")
                                }
                            </button>
                        </button>
                    ))
                ) : (
                    <p className="text-center text-gray-500">
                        {
                            getStaticWord('Loading...')
                        }
                    </p>
                )}
            </div>
            <div className="w-full lg:w-1/4 bg-white shadow-md rounded p-6 mt-2 flex flex-col">
                <div className="flex flex-row gap-2 justify-start align-top">
                    <NavLink to="/" className="w-1/3 h-10 bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-2 rounded mb-2 text-center">
                        {
                            getStaticWord('Logout')
                        }
                    </NavLink>
                    <button className="w-1/4 h-10 bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mb-2" onClick={()=> {
                    document.getElementById('MenuContainer').style.filter = invertButton ? 'invert(0)' : 'invert(1)'
                    setInvertButton(!invertButton)}}>
                        {
                            getStaticWord('Invert')
                        }
                    </button>
                </div>
                
                <div className="w-full border my-2 border-black rounded"></div>
                <h2 className="text-2xl font-bold mb-4">
                    {
                        getStaticWord('Order List')
                    }
                </h2>
                <div className="divide-y divide-gray-200 flex-1">
                    {order.length > 0 ? (
                        order.map((item, index) => (
                            <div key={item.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-800">
                                        {
                                        item.itemName
                                        }
                                    </p>
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
                        ))) : (<p className="text-center text-gray-500">
                        {
                            getStaticWord('No items in order.')
                        }
                    </p>)}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">
                            {
                                getStaticWord('Total:')
                            }
                        </h3>
                        <p className="text-xl font-semibold">
                            ${typeof total === 'number' ? total.toFixed(2) : '0.00'}
                        </p>
                    </div>
                    <button
                        onClick={handlePaymentClick}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        {
                            getStaticWord('Go to Payment')
                        }
                    </button>
                    
                </div>
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                    <h2 className="text-lg font-bold mb-4 mr-4">Ingredients of {selectedItem?.itemName}</h2>
                    {inventoryData.length > 0 ? (
                        inventoryData.map(item => (
                            <p key={item.itemID} className="mb-2">{item.itemName}: {item.itemAmount}</p>
                        ))
                    ) : (
                        <p>
                           {
                            getStaticWord('Loading Inventory...')
                           } 
                        </p>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Customer;