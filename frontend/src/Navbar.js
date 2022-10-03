import "./Navbar.css";

import { Link } from "react-router-dom";
import React from "react";
import { ToggleButton } from "./components/Buttons";

export default function Navbar(props) {

  return (
    <div className="navbar">
      {Object.values(props.routes).map((route) => (
        <ToggleButton key={route.path} active={props.active === route.path}>
          <Link to={route.path}>{route.text}</Link>
        </ToggleButton>
      ))}
    </div>
  );
}
