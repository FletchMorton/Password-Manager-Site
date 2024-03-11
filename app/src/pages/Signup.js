import React from "react";
import VerificationForm from "../components/VerificationForm.js";

const Login = ({devMode}) => {
  return (
    <div className="form signup">
      <VerificationForm devMode={devMode} />
    </div>
  );
};

export default Login;
