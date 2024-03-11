import {useCookies} from "react-cookie";
import React, {Await, defer} from "react-router-dom";


const AuthAwait = ({url, body, options={}, children, errorElement, debugFallback, debugWait=1000}) => {
  const [cookies] = useCookies(["token"]);

  return (
    <Await
      resolve={
        defer({
          data:
          window.location.hostname === "localhost"
            ? debugFallback ? new Promise(res => setTimeout(() => {console.log("waited!"); res(debugFallback)}, debugWait)) : Promise.reject("no debug fallback!")
            : fetch(url, {
              method: "POST",
              ...options,
              body: {
                token: cookies.token,
                ...body,
              }
            }).then(res => {if (res.ok) return res.json(); throw res})
        })
      }
      children={children}
      errorElement={errorElement}
    />
  )
};

export default AuthAwait;
