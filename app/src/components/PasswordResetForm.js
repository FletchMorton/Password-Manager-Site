import React, {useEffect, useState} from "react";
import { debugFetch } from "../auth.js";
import {useNavigate, useSearchParams} from "react-router-dom";
import {DirtyableInput, ValidatingForm} from "./CopyableInput.js";

const PasswordResetForm = ({devMode}) => {
  const [params] = useSearchParams();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (password1 === password2) setPassword(password1);
    else setPassword("");
  }, [password1, password2]);

  const [password1Dirty, setPassword1Dirty] = useState(false);
  const [password2Dirty, setPassword2Dirty] = useState(false);

  const validate = () => {
    setError("");
    setPassword1Dirty(true);
    setPassword2Dirty(true);
    return !password && (
      password1 ? (
        password2 ? "Ensure passwords match." : "Reenter password."
      ) : "Missing password."
    );
  }

  if (!params.has("user") || !params.has("resetKey"))
    return (
      <div className="error-page">
        Looks like you're missing part of the password reset link.
        Try the link in the email you received again.
      </div>
    );

  return (
    <ValidatingForm validate={validate} onSubmit={() => {
      debugFetch("/server/auth/resetPassword", {body: {userID: params.get("user"), newPassword: password, resetKey: params.get("resetKey")}},
        devMode, {success: true}, 1000)
      .then(response => {
        navigate("/");
      }, error => {
        setError(error.message);
      })
    }}>
      <h1>Let's get you a new password.</h1>

      <label>
        Password
        <DirtyableInput type="password" value={password1} onChange={e => setPassword1(e.currentTarget.value)} required dirty={password1Dirty} setDirty={setPassword1Dirty} />
      </label>
      <label>
        Reenter password
        <DirtyableInput type="password" value={password2} onChange={e => setPassword2(e.currentTarget.value)} required dirty={password2Dirty} setDirty={setPassword2Dirty} />
      </label>
      <button>Reset password</button>
      {error && <p className="error-message">{error}</p>}
    </ValidatingForm>
  );
};

export default PasswordResetForm;
