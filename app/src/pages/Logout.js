import React, {useEffect} from "react";
import {useCookies} from "react-cookie"
import {useNavigate} from "react-router-dom";

const Logout = () => {
  const [,, deleteCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  useEffect(() => {
    deleteCookie("token");
    navigate("/sign-in", {replace: true});
  });

  return <>Logging you out...</>
}

export default Logout;
