import React, {useState} from "react";
import {Link, Outlet, useLocation} from "react-router-dom";
import {CardIcon, HamburgerMenuIcon, LoginIcon, PowerIcon, SecureNoteIcon} from "../components/Icon.js";
import {Searchbar} from "./Entries.js";

const NavLink = ({to, children, className=""}) => {
  const location = useLocation();
  const current = to === location.pathname;
  return <Link to={to} className={className + (current ? " current" : "")}>{children}</Link>
}

const Landing = ({devMode, onLeaveDevMode}) => {
  const [navDrawerOpen, setNavDrawerOpen] = useState(window.innerWidth > 600);

  return (
    <div className="main">
      <header>
        <button onClick={() => {setNavDrawerOpen(!navDrawerOpen)}} aria-label="Menu" aria-expanded={navDrawerOpen}><HamburgerMenuIcon /></button> 
        <span className="font-stuff">RetroVault</span>
        <Searchbar />
      </header>
      <nav className={navDrawerOpen ? "open" : ""}>
        <NavLink to="/logins"><span>Logins</span><LoginIcon /></NavLink>
        <NavLink to="/notes"><span>Secure Notes</span><SecureNoteIcon /></NavLink>
        <NavLink to="/cards"><span>Cards</span><CardIcon /></NavLink>
        <div className="separator" />
        <NavLink to="/logout"><span>Sign out</span><PowerIcon /></NavLink>
      </nav>
      <main>
        {devMode && <p style={{color: "#400", backgroundColor: "#fdd"}}><b>You're currently in dev mode.</b> No requests will be sent; dummy data will be used instead. <button onClick={onLeaveDevMode}>Leave dev mode</button></p>}
        <Outlet />
      </main>
    </div>
  );
};

export default Landing;
