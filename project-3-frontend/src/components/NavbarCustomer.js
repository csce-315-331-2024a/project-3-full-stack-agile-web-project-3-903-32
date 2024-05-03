import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { StaticOrderingWords } from "../customer/CustomerConstants";

const Navbar = ({ onSpeechAssistanceChange }) => {
  const [weather, setWeather] = useState('');
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
const navigate = useNavigate();

  const handleLogoutClick = () => {
    console.log("Logout");
    navigate('/');
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

  const handleSpeechAssistance = () => {
    if (!hasSpoken) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Speech Assistance Activated. Our menu item categories are listed on the left hand side of the screen. In order from top to bottom are: all items, appetizers, beverages, burgers, desserts, limited time offers, salids, sandwiches, value meals, and a recommended item based on the weather. Please click a category to hear menu items and prices. Once you have finished ordering, please click the go to payment button on the bottom right corner of the screen. ";
      window.speechSynthesis.speak(msg);
      setHasSpoken(true);
      onSpeechAssistanceChange(false);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Speech assistance off.";
      window.speechSynthesis.speak(msg);
      setHasSpoken(false);
      onSpeechAssistanceChange(true);
    }
  };

  const stopSpeechAssistance = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <nav className="flex gap-10 items-center px-5 bg-white border-b border-gray-200 h-[80px]">
      <div className="flex-1 text-xl font-semibold text-gray-700 ml-4">REV'S American Grill</div>
      <div className='border-2 border-black rounded inline-block p-4'>
        <strong>Weather:</strong>
        <span className='mx-4'>{weather}</span>
      </div>
        
        <div className="border-2 border-black p-2 rounded flex flex-row gap-4 justify-center mr-[310px]">
          <span className="text-center py-2 align-middle font-bold">Speech Assistance:</span>
          <button onClick={stopSpeechAssistance} className="p-2 text-medium font-medium text-white hover:bg-red-900 rounded-lg transition-colors bg-red-700" disabled={isButtonDisabled}>
            STOP
          </button>
          <button onClick={handleSpeechAssistance} className="p-2 text-medium font-medium text-gray-900 hover:bg-green-500 rounded-lg transition-colors bg-green-400" disabled={isButtonDisabled}>
            ON / OFF
          </button>
        </div>
        <button className="px-4 py-1 h-14 bg-gray-700 hover:bg-gray-900 text-white font-bold rounded" onClick={()=> {
          document.getElementById('root').style.filter = invertButton ? 'invert(0)' : 'invert(1)'
          setInvertButton(!invertButton)}}>
              {
                  getStaticWord('Invert')
              }
        </button>
        <button
          onClick={handleLogoutClick}
          className="text-white font-bold bg-red-700 hover:bg-red-800 px-4 py-1 h-14 rounded"
        >
          Logout
        </button>
    </nav>
  );
};

export default Navbar;