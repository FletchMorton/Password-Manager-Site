import React from "react";
import PasswordResetForm from "../components/PasswordResetForm.js";

const PasswordReset = ({devMode}) => {
  return (
    <div className="form password-reset">
      <PasswordResetForm devMode={devMode} />
    </div>
  );
};

export default PasswordReset;
