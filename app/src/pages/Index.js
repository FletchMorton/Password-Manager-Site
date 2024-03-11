import React from "react";
import {Outlet} from "react-router-dom";

const Index = ({devMode, setDevMode}) => {
  return (
    <div className="login-page">
      <div className="side-image" />
      <div className="form-container">
        {
          setDevMode && <p style={{color: "#400", backgroundColor: "#fdd"}}>Dev mode is currently {devMode ? <><b>on</b>, meaning requests will not be sent</> : <b>off</b>}. <button onClick={() => setDevMode(!devMode)}>Toggle dev mode</button></p>
        }
        <Outlet />
      </div>
    </div>

  );
};

export default Index;

