import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const [weather, setWeather] = useState('');
  const [showWeather, setShowWeather] = useState(false); 
  
  const handleWeatherClick = async () => {
    if (!showWeather) {
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
    } 
    else {
      setWeather(''); 
    }
    setShowWeather(!showWeather); 
  };

  const handleLogoutClick = async () => {
    // logout logic here
    console.log("Logout");
    navigate('/');

  };

  return (
    <nav className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
      <div className="text-xl font-semibold text-gray-700">REV'S American Grill</div>
      <div>
        <button
          onClick={handleWeatherClick}
          className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded mr-4"
        >
          {showWeather ? 'Hide Weather' : 'Weather'}
        </button>
        {showWeather && <span className='mr-4'>{weather}</span>} 
        <button
          onClick={handleLogoutClick}
          className="text-white bg-red-500 hover:bg-red-700 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;