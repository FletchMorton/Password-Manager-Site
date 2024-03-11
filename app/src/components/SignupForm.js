import React, {useEffect, useState} from "react";
import {debugFetch} from "../auth.js";
import {emailRegexp, formatList} from "../util.js";
import {DirtyableInput, ValidatingForm} from "./CopyableInput.js";


const SignupForm = ({devMode}) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [password, setPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (password1 === password2) setPassword(password1);
    else setPassword("");
  }, [password1, password2]);

  const [emailDirty, setEmailDirty] = useState(false);
  const [usernameDirty, setUsernameDirty] = useState(false);
  const [password1Dirty, setPassword1Dirty] = useState(false);
  const [password2Dirty, setPassword2Dirty] = useState(false);

  const emailValid = () => email.match(emailRegexp);

  const validate = () => {
    setError("");
    setEmailDirty(true);
    setUsernameDirty(true);
    setPassword1Dirty(true);
    setPassword2Dirty(true);
    const passwordError = !password && (
      // password1 is handled by missing
      password2 ? "Ensure passwords match." : "Reenter password."
    );
    const missing = [
      !email ? "email" : !emailValid() && "valid email",
      !username && "username",
      !password1 && "password",
    ].filter(i => i);
    if (missing.length && (!password1 || password)) return "Missing " + formatList(missing);
    else if (!missing.length) return passwordError;
    else if (missing.length && passwordError) return "Missing " + formatList(missing) + "; " + passwordError.toLowerCase();
  }

  return <ValidatingForm validate={validate} onSubmit={async () => {
    debugFetch("/server/auth/signup", {body: {username, email, password}}, devMode, {success: true, user: {username, email, password}, message: "User created! Returned information on the new user."}, 1000)
    .then(response => setEmailSent(true),
      error => setError(error.message));
  }}>
    <h1>Hi there.</h1>
    {emailSent
      ? <>
        <p>Great! We've sent a confirmation email to&nbsp;<b>{email}</b>. You may now close this tab.</p>
        <button type="submit">Resend</button><button type="button" onClick={e => {e.preventDefault(); setEmailSent(false);}}>Return</button>
      </>
      : <>
        <p>Let's get you signed up.</p>
        <label>
          Email
          <DirtyableInput type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} required dirty={emailDirty} setDirty={setEmailDirty} />
        </label>
        <label>
          Username
          <DirtyableInput type="text" value={username} onChange={e => setUsername(e.currentTarget.value)} required dirty={usernameDirty} setDirty={setUsernameDirty} />
        </label>
        <label>
          Password
          <DirtyableInput type="password" value={password1} onChange={e => setPassword1(e.currentTarget.value)} required dirty={password1Dirty} setDirty={setPassword1Dirty} />
        </label>
        <label>
          Reenter password
          <DirtyableInput type="password" value={password2} onChange={e => setPassword2(e.currentTarget.value)} required dirty={password2Dirty} setDirty={setPassword2Dirty} />
        </label>
        <button type="submit">Send confirmation email</button>
        {error && <p className="error-message">{error}</p>}
      </>}
  </ValidatingForm>;
};

export default SignupForm;
