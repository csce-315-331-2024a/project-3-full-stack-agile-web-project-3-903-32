import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { StaticOrderingWords } from "../customer/CustomerConstants";

const Navbar = ({onSpeechAssistanceChange}) => {
  const [weather, setWeather] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
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

  useEffect(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Please press the ON, button to continue with speech assistance.";
      window.speechSynthesis.speak(msg);
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
      msg.text = "Speech assistance activated. Please enter your name in the text box in the center of the screen. In order from left to right, the buttons on the bottom are for submitting your payment, going back to the ordering screen, and clearing your order. If there are no items in your order, you will not be able to press the submit payment button.";
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

  const toggleInvert = () => {
    if (document.getElementById('root').style.filter === 'invert(1)') {
      document.getElementById('root').style.filter = 'invert(0)';
    } else {
      document.getElementById('root').style.filter = 'invert(1)';
    }
  }

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
        <button className="px-4 py-1 h-14 bg-gray-700 hover:bg-gray-900 text-white font-bold rounded" onClick={toggleInvert}>
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