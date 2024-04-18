import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google"
import { gapi } from 'gapi-script';
import { jwtDecode } from "jwt-decode";

import videoBG from "./imgs/Background.mp4";
import cheeseburgerImg from "./imgs/cheeseburger.png";

const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    function start(){
      gapi.client.init({
        clientId: clientId,
        scope: ""
      }).then(() => {
        console.log("Google API initialized successfully");
      }).catch((error) => {
        console.error("Error initializing Google API:", error);
      });
    };
  
    gapi.load('client:auth2', start);
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const passwords = [
    "ozpass",
    "nolanpass",
    "jimothypass",
    "rebeccapass",
    "georgepass",
    "kyliepass"
  ];

  const handleLogin = () => {
    const passwordInt = parseInt(password);
    if (passwords[passwordInt] === username){
      console.log("Successful Login");
      if(passwordInt === 0 || passwordInt === 2){
        navigate('/manager');
      } else {
        navigate('/cashier')
      }
    } else {
      console.log("Login Failed!");
    }
  };

  const loginManager = () => {
    navigate('/manager');
  }

  const loginCashier = () => {
    navigate('/cashier');
  }

  const loginMenu = () => {
    navigate('/customer/StaticMenu');
  }

  const loginCustomer = () => {
    navigate('/customer');
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-60" src={videoBG}></video>
      <div className="flex flex-col items-center justify-center z-10">
        <h1 className="text-white p-10 text-center text-9xl mb-8" style={{ backgroundColor: 'rgba(139, 0, 0, .8)', width: '100%', marginBottom: 0 }}>Rev's American Grill</h1>
        <div className="flex items-center justify-center flex-col"> {/* Modified this line */}
          <div className="flex items-center mb-4"> {/* Added a div to contain the cheeseburger image and button */}
            <img src={cheeseburgerImg} alt="Cheeseburger" className="w-40 h-auto mr-4" /> {/* Modified this line */}
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={loginCustomer} style={{ fontSize: '2rem' }}>Order Now!</button> {/* Modified this line */}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-col items-center justify-center z-10">
          <div className="bg-white rounded">
            <h1 className="text-black p-2 mb-2">Employee login:</h1>
          </div>
        </div>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const decoded = jwtDecode(credentialResponse?.credential);
            console.log(decoded.email);
            if (decoded.email === "csce315manager@gmail.com") {
              loginManager();
            } else if (decoded.email === "csce315cashier@gmail.com") {
              loginCashier();
            } else {
              loginCustomer();
            }
          }}
          onError={(error) => {
            console.error("Google login failed:", error);
          }}
        />
      </div>
    </div>
  );
}

export default App;
