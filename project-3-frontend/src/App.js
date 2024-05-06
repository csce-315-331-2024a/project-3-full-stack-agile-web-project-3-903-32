import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import { gapi } from 'gapi-script';
import { jwtDecode } from "jwt-decode";


const imageMapping = {
  'video': "Background.mp4",
  'shakeImg': 'shake.png',
  'cheeseburgerImg': "cheeseburger.png"
}


const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";






function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true); // State to track video playback
  const videoRef = useRef(null); // Ref to access the video element
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');


  useEffect(() => {
    function start() {
      localStorage.setItem('isManagerLoggedIn', 'false');
      localStorage.setItem('isCashierLoggedIn', 'false');
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

  const getRole = async (email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/employee/gmail/${email}`, {
        method: 'GET',
        mode: 'cors',
      });
      if (response.ok) {
        const data = await response.json();
        setRole(data);
        if(data.position == "Cashier"){
          loginCashier();
        } else if (data.position == "Manager"){
          loginManager();
        }
      } else if (response.status === 404) {
        loginCustomer();
        console.log("not found");
      } else {
        loginCustomer();

        throw new Error('Failed to fetch role data');
      }
    } catch (error) {
      loginCustomer();

      console.error('Error fetching role data:', error);
    }
  };
  
  
/*
  async function createAccount({ email, role, name }) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/employee/add', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "email": email,
          "position": role,
          "employeename": name
        })
      });
      if (response.ok) {
        console.log("Account created: " + email);
      } else {
        console.error('Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }
  */



  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (isVideoPlaying) {
      video.style.display = 'none'; // Hide the video
    } else {
      video.style.display = 'block'; // Show the video
    }
    setIsVideoPlaying(!isVideoPlaying); // Toggle the state
  };
  

  const loginManager = () => {
    localStorage.setItem('isManagerLoggedIn', 'true');
    localStorage.setItem('isCashierLoggedIn', 'false');
    navigate('/manager');
  }

  const loginCashier = () => {
    localStorage.setItem('isManagerLoggedIn', 'false');
    localStorage.setItem('isCashierLoggedIn', 'true');
    navigate('/cashier');
  }

  const loginCustomer = () => {
    navigate('/customer');
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-60" src={imageMapping["video"]} ref={videoRef}></video>
      <div className="flex flex-col items-center justify-center z-10">
        <h1 className="text-white p-10 text-center text-9xl mb-8" style={{ backgroundColor: 'rgba(139, 0, 0, .8)', width: '100%', marginBottom: 0 }}>Rev's American Grill</h1>
        <div className="flex items-center justify-center flex-col"> {/* Modified this line */}
          <div className="flex items-center mb-4"> {/* Added a div to contain the cheeseburger image and button */}
          <img src={imageMapping["cheeseburgerImg"]} alt="Cheeseburger" className="w-40 h-auto mr-4" /> {/* Modified this line */}
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
            
            getRole(decoded.email);
            if (decoded.email === "csce315manager@gmail.com") {
             //loginManager();
            } else if (decoded.email === "csce315cashier@gmail.com") {
            //  loginCashier();
            } else {
           //   loginCustomer();
            }
          }}
          onError={(error) => {
            console.error("Google login failed:", error);
          }}
        />
      </div>
      <div className="flex justify-center mb-4">
      <button 
    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded absolute top-0 right-0 m-4" 
    onClick={toggleVideoPlayback} 
    style={{ zIndex: 9999 }}>
    {isVideoPlaying ? 'Low Mobility Mode Off' : 'Low Mobility Mode On'}
  </button>

      </div>
    </div>
  );
}

export default App;
