import './App.css';
import React, {useState} from "react";
import {Link, Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements, defer, redirect} from "react-router-dom";
import {CookiesProvider, useCookies} from "react-cookie";
import Entries from "./pages/Entries.js";
import Index from "./pages/Index.js";
import Landing from "./pages/Landing.js";
import Logout from "./pages/Logout.js";
import {authFetch} from "./auth.js";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import PasswordReset from "./pages/PasswordReset.js";

const doAuthFetch = (token, url, {body={}, ...options}, devMode, debugFallback, debugWait) => async ({request}) => {
  if (token) {
    const params = new URL(request.url).searchParams;
    const keyword = params.get("q");
    console.log(params, keyword);
    return defer({
      items: authFetch(token, url, {
        body: keyword ? {keyword, ...body} : body,
        ...options,
      }, devMode, debugFallback(keyword || ""), debugWait),
    });
  }
  return null;
};

const Router = () => {
  const [cookies] = useCookies(["token"]);
  const [devMode, setDevMode] = useState(false);
  const isDevelopment = window.location.hostname === "localhost" && process.env.NODE_ENV === "development";

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index loader={() => redirect(cookies.token ? "/landing" : "/sign-in")} />
        <Route element={cookies.token ? <Navigate to="/landing" /> : <Index devMode={devMode} setDevMode={isDevelopment && setDevMode} />}>
          <Route path="/sign-in" element={<Login devMode={devMode} />} />
          <Route path="/accountVerification" element={<Signup devMode={devMode} />} />
          <Route path="/resetPassword" element={<PasswordReset devMode={devMode} />} />
        </Route>
        <Route element={cookies.token ? <Landing devMode={devMode} onLeaveDevMode={() => setDevMode(false)} /> : undefined}>
          <Route path="/landing" element={<Navigate to="/logins" replace />} />
          <Route path="/logins"
            loader={doAuthFetch(cookies, "/server/pass/list", {},
              devMode, keyword => [
                {_id: "1", application: `an item! ${keyword}`, username: "user1", password: "password1"},
                {_id: "2", application: `another ${keyword} item!`, username: "user2", password: "pass2"},
              ], 1000)}
            element={<Entries key="logins" defaultType="login" devMode={devMode} onEnterDevMode={isDevelopment && (() => setDevMode(true))} />}
          />
          <Route path="/notes"
            loader={doAuthFetch(cookies, "/server/note/list", {},
              devMode, keyword => [
                {_id: "1", title: `A secure note! Not really. ${keyword}`, text: "Lorem ipsum dolor sit amet, or whatever."},
                {_id: "2", title: `Another fake secure note! Now with ${keyword}`, text: "Lorem ipsum dolor sit amet II, or whatever."},
              ], 1000)}
            element={<Entries key="notes" defaultType="secureNote" devMode={devMode} onEnterDevMode={isDevelopment && (() => setDevMode(true))} />}
          />
          <Route path="/cards"
            loader={doAuthFetch(cookies, "/server/card/list", {},
              devMode, keyword => [
                {_id: "1", cardNumber: `1234567890123456${keyword}`, firstName: "Cardholder", lastName: "One", cvv: "111", expiration: "2025-01", bank: "Bank of Cardholding"},
                {_id: "2", cardNumber: `2345678901234561${keyword}`, firstName: "Cardholder", lastName: "Two", cvv: "222", expiration: "2025-02", bank: "Cardholders Inc"},
              ], 1000)}
            element={<Entries key="cards" defaultType="card" devMode={devMode} onEnterDevMode={isDevelopment && (() => setDevMode(true))} />}
          />
          <Route path="/logout" element={<Logout />} />
        </Route>
        <Route path="/*" element={<div className="error-page">Page not found. <Link to="/">Go back home</Link>?</div>} />
      </Route>
    )
  );

  return <RouterProvider router={router} />
}

const App = () => {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <Router />
    </CookiesProvider>
  );
};

export default App;
