import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import React from "react";

const routes = {
  "/": {
    path: "/",
    text: "Elpriser",
    header: "ELPRISER!!"
  },
  "/konsumtion": {
    path: "/konsumtion",
    text: "Konsumtion",
    header: "KONSUMTION!!"
  }
}

export default function Layout() {
  const location = useLocation();
  return (
    <div>
      <Navbar active={location.pathname} routes={routes} />
      {routes[location.pathname] &&
        <div className="header">
          <h1>
            <span role='img' aria-label="Love">🎉🎊🎈 </span>
            {routes[location.pathname].header}
            <span role='img' aria-label="Love"> 🎈🎊🎉</span>
          </h1>
        </div>
      }
      <Outlet />
    </div>
  );
}