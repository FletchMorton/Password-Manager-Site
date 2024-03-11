import React, {useState} from "react";
import { debugFetch } from "../auth.js";
import {useCookies} from "react-cookie";
import {emailRegexp, formatList} from "../util.js";
import {DirtyableInput, ValidatingForm} from "./CopyableInput.js";

const LoginForm = ({devMode}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setCookies] = useCookies(["token", "userid"]);

  const [emailDirty, setEmailDirty] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);

  const emailValid = () => email.match(emailRegexp);

  const validate = () => {
    setError("");
    setEmailDirty(true);
    setPasswordDirty(true);
    const missing = [
      !email ? "email" : !emailValid() && "valid email",
      !password && "password",
    ].filter(i => i);
    return missing.length && "Missing " + formatList(missing);
  };

  return <ValidatingForm validate={validate} onSubmit={() => {
    debugFetch("/server/auth/signin", {body: {email, password}},
      devMode, {success: true, user: {email, password, username: "test user", _id: 1}, session: {"access_token": "eyJhb...", "token_type": "Bearer", "expires_in": 3600}, message: "Sign-In Successful! Returned information on the current user Returned the Session Token."}, 1000)
    .then(response => {
      setCookies("token", response.session, {maxAge: 60 * 60 * 10});  // expires in 10 hours
    }, error => {
      setError(error.message);
    });
  }}>
    <h1>Welcome back.</h1>

    <label>
      Email
      <DirtyableInput type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} required invalid={!emailValid()} dirty={emailDirty} setDirty={setEmailDirty} />
    </label>
    <label>
      Password
      <DirtyableInput type="password" value={password} onChange={e => setPassword(e.currentTarget.value)} required dirty={passwordDirty} setDirty={setPasswordDirty} />
    </label>
    <button type="submit">Log in</button>
    {error && <p className="error-message">{error}</p>}
  </ValidatingForm>;
};

export default LoginForm;
