import React, {useEffect, useState} from "react";
import {debugFetch} from "../auth.js";
import {Navigate, useSearchParams} from "react-router-dom";


const VerificationForm = ({devMode}) => {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.has("user") && params.has("verificationKey")) {
      debugFetch("/server/auth/verifyAccount", {body: {userID: params.get("user"), verificationKey: params.get("verificationKey")}},
        devMode, {message: "User verified! Redirecting to Home page..."}, 1000)
      .then(() => setDone(true), error => setError(error.message));
    }
  }, [params, devMode]);

  if (!params.has("user") || !params.has("verificationKey"))
    return (
      <div className="error-page">
        Looks like you're missing part of the email verification link.
        Try the link in the email you received again.
      </div>
    )

  if (done)
    return <Navigate to="/" replace />
  else if (error) return <div className="error-page">{error}</div>
  else return (
    <div>
      Verifying...
    </div>
  )
};

export default VerificationForm;
