import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { StaticOrderingWords } from "../customer/CustomerConstants";

const Navbar = ({handleRecommendedItemClick}) => {
  const [weather, setWeather] = useState('');
  const [showRecommendedItemModal, setShowRecommendedItemModal] = useState(false);
  const [recommendedItem, setRecommendedItem] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [invertButton, setInvertButton] = useState(false);
  const [staticTranslations, setStaticTranslations] = useState(StaticOrderingWords);

  const getStaticWord = (word) => {
    return (
    <span>
        {
            staticTranslations[StaticOrderingWords.indexOf(word)]
        }
    </span>);
};

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/weather', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }

      const weatherInfo = await response.json();

      if (weatherInfo.temperature_fahrenheit) {
        setWeather(`${weatherInfo.temperature_fahrenheit}°F - ${weatherInfo.description}`);
      } else {
        setWeather('Weather not available');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeather('Error fetching weather');
    }
  };

  async function getRecommendedItem() {
    setIsButtonDisabled(true);
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/recommended", {
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendedItem(data.item);
      } else {
        console.error('Failed to fetch recommended items:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching recommended items:', error);
    }
  }

  const NavComponent = ({ to, text }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => 
          `mx-2 py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-300 rounded-lg transition-colors ${
            isActive ? 'bg-gray-200' : 'bg-gray-100'
          }`
        }
      >
        {text}
      </NavLink>
    );
  }

  const handleOpenRecommendedItemModal = async () => {
    await getRecommendedItem();
    setShowRecommendedItemModal(true);
  };

  const RecommendedItemModal = (props) => (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded'>
      <button onClick={handleCloseAndOrderModal} className="mt-4 my-4 px-4 py-8 bg-gray-200 text-black rounded hover:bg-gray-300 transition duration-300 ease-in-out font-bold text-lg" > {recommendedItem.itemName} </button>
      <p>Click to add this delicious item to your order!</p>
      <button onClick={handleCloseModal}><img src={`${process.env.PUBLIC_URL}/x-solid.svg`} alt="Close" className='h-[20px] my-4'/></button>
    </div>
  )

  const handleCloseModal = (event) => {
    setIsButtonDisabled(false);
    setShowRecommendedItemModal(false);
  }

  const handleCloseAndOrderModal = (event) => {
    setIsButtonDisabled(false);
    setShowRecommendedItemModal(false);
    handleRecommendedItemClick(recommendedItem);
  }

  const handleSpeechAssistance = () => {
    if (!hasSpoken) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Speech assistance activated. Our menu item categories are listed on the left hand side of the screen. In order from top to bottom are: all items, appetizers, beverages, burgers, desserts, limited time offers, salids, sandwiches, and value meals. Please click a category to hear menu items and prices. ";
      window.speechSynthesis.speak(msg);
      setHasSpoken(true);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Speech assistance off.";
      window.speechSynthesis.speak(msg);
      setHasSpoken(false);
    }
  };

  return (
    <nav className="flex justify-between items-center p-1 bg-white border-b border-gray-200">
      <div className="text-xl font-semibold text-gray-700">REV'S American Grill</div>
      <div className="flex items-center">
        <span className='mx-4'>{weather}</span>
        <button className="w-1/4 h-10 bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mb-2" onClick={()=> {
                document.getElementById('MenuContainer').style.filter = invertButton ? 'invert(0)' : 'invert(1)'
                setInvertButton(!invertButton)}}>
                    {
                        getStaticWord('Invert')
                    }
                </button>
        <button onClick={handleOpenRecommendedItemModal} className="mx-4 py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-300 rounded-lg transition-colors bg-gray-100" disabled={isButtonDisabled}>
          Recommended Item
        </button>
        <button onClick={handleSpeechAssistance} className="mx-4 py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-300 rounded-lg transition-colors bg-gray-100" disabled={isButtonDisabled}>
          Speech Assistance
        </button>
      </div>
      {showRecommendedItemModal && <RecommendedItemModal />}
    </nav>
  );
};

export default Navbar;