import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TranslateText } from '../components/Translate';
import { StaticPaymentWords } from './CustomerConstants';
import { LanguageContext } from '../components/Translate';
import Navbar from "../components/NavbarCustomerPayment";

/**
 * Returns the Customper payment page which cotains an input for name, cancel order, go back on in order and submit payment.
 * @returns the CustomerPayment page
 */
const CustomerPayment = () => {
    const [itemIds, setItemIds] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [staticTranslations, setStaticTranslations] = useState(StaticPaymentWords);
    const [hasSpoken, setHasSpoken] = useState(true);
    const selectedLanguage = useContext(LanguageContext);


    const location = useLocation();
    const navigate = useNavigate();

    // Extracts query parameters and sets state
    useEffect(() => {
        postStaticTranslations();

        if (location.state) {
            const { order, total, itemIds } = location.state;
            setTotal(total);
            setOrder(order);
            setItemIds(itemIds); // Assuming 'order' is an array of items with 'id' properties
        }
    }, [location.state]);

    const getStaticWord = (word) => {
        return (
        <span>
            {
                staticTranslations[StaticPaymentWords.indexOf(word)]
            }
        </span>);
    };
    /**
     * This takes the text and target_language and sends it over to the translation api.
     */
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

    /**
     * Function to handle form submission
     */
    const toCustomerSubmit = async () => {
        try {
            if (total <= 0.0) {
                console.log("Empty order");
                setShowEmptyMessage(true); // Show the empty order message
                setTimeout(() => setShowEmptyMessage(false), 3000); // Hide the message after 3 seconds
                return;
            }

            if(name) {
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
            }
            else
            {
                const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/order", {
                    method: "POST",
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "customer_name": 'N/A',
                        "paid": total,
                        "employee_id": 2, // This should be updated to the actual employee_id once implemented
                        "menu_items": itemIds,
                    })
                });

                const data = await response.json();
                console.log(data['message']);
            }
            
            navigate('/customer/confirm'); // Navigating to customer confirm
        } catch (err) {
            console.error(err);
        }
    };

    // Function to handle cancellation
    const toCustomerCancel = () => {
        navigate('/customer');
    };

    // Function to handle the back action
    const toCustomerBack = () => {
        navigate('/customer', {
            state: { orderBack: order, totalBack: total, itemIdsBack: itemIds }
        });
    };

    // Function to handle name change
    const changeName = (event) => {
        setName(event.target.value);
    };

    const showConfirmationModal = () => {
        if (!hasSpoken) {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const msg = new SpeechSynthesisUtterance();
            msg.text = "Are you sure you want to submit the payment? Press the left button to confirm and the right button to go back.";
            window.speechSynthesis.speak(msg);
        }
        setShowConfirmation(true);
    };

    const closeConfirmationModal = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setShowConfirmation(false);
    };

    const confirmSubmit = async () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        await toCustomerSubmit();
        closeConfirmationModal(); 
    };

    const handleSpeechAssistanceChange = (newHasSpoken) => {
        setHasSpoken(newHasSpoken);
    };

    return (
        <div> 
            <Navbar onSpeechAssistanceChange={handleSpeechAssistanceChange}/>
        
            <div className="mt-5 max-w-2xl mx-auto p-5 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                {
                    getStaticWord('Payment')
                }
                </h1>
                <div>
                    <h2 className="text-xl font-semibold mt-4 mb-4 text-gray-700">
                        {
                            getStaticWord('Order List')
                        }
                    </h2>
                    {order.length > 0 ? (
                    <ul className="list-none">
                        {order.map((item) => (
                        <li key={item.id} className="py-2 border-b border-gray-200">
                            {item.itemName} - ${item.price.toFixed(2)} x {item.quantity}
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-gray-500">
                        {
                            getStaticWord('No items in order.')
                        }
                    </p>
                    )}
                    <h3 className="text-lg font-semibold text-right mt-4">
                        {
                            getStaticWord('Total: ')
                        }
                        ${typeof total === 'number' ? total.toFixed(2) : '0.00'}
                    </h3>
                </div>
                <label htmlFor="customer_name" className='text-black font-semibold text-2xl'>
                    {
                        getStaticWord('Customer\'s Name')
                    }
                </label>
                <input 
                    className="w-full mr-4 mb-4 overflow-y-auto py-2 px-8 bg-gray-50 rounded text-2xl"
                    type="text"
                    id="customer_name"
                    placeholder='Enter your name here...'
                    aria-labelledby='customer_name'
                    value={name}
                    onChange={changeName}
                />
                <div className="flex justify-center mt-6 space-x-4">
                    {
                        order.length > 0 ? (
                            <button onClick={showConfirmationModal} className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                {getStaticWord('Submit Payment')}
                            </button>
                        ) : (
                            <div className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed">
                                {getStaticWord('No items in order')}
                            </div>
                        )
                    }
                    <button onClick={toCustomerBack} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                    {
                        getStaticWord('Back')
                    }
                    </button>
                    <button onClick={toCustomerCancel} className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                    {
                        getStaticWord('Clear Order')
                    }
                    </button>
                </div>
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow-lg text-center">
                            <h3 className="mb-4 text-lg font-bold">
                                {
                                    getStaticWord('Confirm Payment')
                                }
                            </h3>
                                <p>
                                {
                                    getStaticWord('Are you sure you want to submit the payment?')
                                }
                            </p>
                                <div className="flex justify-around mt-6">
                                    <button onClick={confirmSubmit} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 focus:outline-none">
                                        {
                                        getStaticWord('Confirm')
                                    }
                                    </button>
                                    <button onClick={closeConfirmationModal} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-900 focus:outline-none">
                                        {
                                        getStaticWord('Go Back')
                                    }
                                    </button>
                                </div>
                        </div>
                        </div>
                    )}
            </div>
                </div>
    );    
};

export default CustomerPayment;