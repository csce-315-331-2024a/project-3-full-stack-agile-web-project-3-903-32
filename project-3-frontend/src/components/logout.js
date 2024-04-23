import { GoogleLogout } from 'react-google-login';

const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";

function Logout() {
    
  const onSuccess = () => {
    console.log("Log out successfull!");
  }

  return (
    <div id="signOutButton">
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onSuccess={onSuccess}
      />
    </div>
  )
}

export default Logout;
