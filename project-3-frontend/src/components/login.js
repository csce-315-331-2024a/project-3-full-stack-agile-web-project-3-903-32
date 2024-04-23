import { GoogleLogin } from 'react-google-login';

const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";

function Login() {

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! Current user: ", res.profileObj);
      }
      
      const onFailure = (res) => {
        console.log("LOGIN FAILED! Current user: ", res);
      }

  return (
    <div id="signInButton">
      <GoogleLogin
        clientId={clientId}
        buttonText="Login"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
      />
    </div>
  )
}

export default Login;
