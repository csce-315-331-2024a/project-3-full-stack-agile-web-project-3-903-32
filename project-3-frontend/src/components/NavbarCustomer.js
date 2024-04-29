import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
      msg.text = "Speech Assistance Activated. Our menu item categories are listed on the left hand side of the screen. In order from top to bottom are: all items, appetizers, beverages, burgers, desserts, limited time offers, salids, sandwiches, value meals, and a recommended item based on the weather. Please click a category to hear menu items and prices. ";
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
    <nav className="flex justify-between items-center p-1 bg-white border-b border-gray-200 h-[125px]">
      <div className="text-xl font-semibold text-gray-700 ml-4">REV'S American Grill</div>
      <div className="flex items-center">
      <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', display: 'inline-block', margin: '20px', width: '275px' }}>
        <strong>Weather:</strong>
        <span className='mx-4'>{weather}</span>
      </div>
        <button className="w-1/6 h-14 bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-2 rounded mb-2" style={{margin: '20px'}} onClick={()=> {
          document.getElementById('MenuContainer').style.filter = invertButton ? 'invert(0)' : 'invert(1)'
          setInvertButton(!invertButton)}}>
              {
                  getStaticWord('Invert')
              }
        </button>
        <div className="border border-black p-4 rounded inline-block mx-4 my-4" style={{ width: '500px' }}>
          <strong className="mr-4">Speech Assistance:</strong>
          <button onClick={stopSpeechAssistance} className="mr-4 py-3 px-4 text-lg font-medium text-white hover:bg-red-600 rounded-lg transition-colors bg-red-500" disabled={isButtonDisabled}>
            STOP
          </button>
          <button onClick={handleSpeechAssistance} className="py-3 px-6 text-lg font-medium text-gray-900 hover:bg-green-500 rounded-lg transition-colors bg-green-400" disabled={isButtonDisabled}>
            ON / OFF
          </button>
        </div>

        <button className="bg-white hover:bg-white text-white border-white w-200px">
          akdjfslkjfkldsjflkdsjfkl
        </button>
      </div>
    </nav>
  );
};

export default Navbar;