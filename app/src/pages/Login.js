import React, {useState} from "react";
import SignupForm from "../components/SignupForm.js";
import LoginForm from "../components/LoginForm.js";
import PasswordResetRequestForm from "../components/PasswordResetRequestForm.js";

const Login = ({devMode}) => {
  const [isSignup, setSignup] = useState(false);
  const [isReset, setReset] = useState(false);

  return (
    <div className={"form " + (isSignup ? "signup" : "login")}>
      {
        isSignup
        ? <>
          <SignupForm devMode={devMode} />
          <p>Already have an account? <button type="button" onClick={e => {e.preventDefault(); setSignup(false)}}>Log in</button>.</p>
          </>
        : isReset
        ? <>
          <PasswordResetRequestForm devMode={devMode} />
          <p>Remembered your password? <button type="button" onClick={e => {e.preventDefault(); setReset(false)}}>Log in</button>.</p>
          </>
        : <>
          <LoginForm devMode={devMode} />
          <p>Forgot your password? <button type="button" onClick={e => {e.preventDefault(); setReset(true)}}>Reset your password</button>.
          <br />Need an account? <button type="button" onClick={e => {e.preventDefault(); setSignup(true)}}>Sign up</button>.</p>
          </>
      }
    </div>
  );
}

export default Login
