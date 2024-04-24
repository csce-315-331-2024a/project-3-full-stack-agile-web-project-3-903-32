import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({handleRecommendedItemClick}) => {
  const [weather, setWeather] = useState('');
  const [showRecommendedItemModal, setShowRecommendedItemModal] = useState(false);
  const [recommendedItem, setRecommendedItem] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
      <button onClick={handleCloseAndOrderModal} className="mt-4 my-4 px-4 py-8 bg-gray-200 text-black rounded hover:bg-gray-300 transition duration-300 ease-in-out font-bold text-lg"> {recommendedItem.itemName} </button>
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

  return (
    <nav className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
      <div className="text-xl font-semibold text-gray-700">REV'S American Grill</div>
      <div className="flex items-center">
        <span className='mx-4'>{weather}</span>
        <button onClick={handleOpenRecommendedItemModal} className="mx-4 py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-300 rounded-lg transition-colors bg-gray-100" disabled={isButtonDisabled}>
          Recommended Item
        </button>
      </div>
      {showRecommendedItemModal && <RecommendedItemModal />}
    </nav>
  );
};

export default Navbar;