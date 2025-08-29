import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faHistory,
  faSignOutAlt,
  faBars,
  faTint,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/Sidebar.css";

import { AdminContext } from "../App";

export default function Sidebar() {
  // ✅ Load collapse state from localStorage (default false if not set)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem("sidebarCollapsed")) || false;
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const { isAdmin, setIsAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  // For 7-click detection
  const clickCount = useRef(0);
  const clickTimeout = useRef(null);

  // ✅ Save collapse state whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    setShowConfirm(false);
    navigate("/admin");
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();

    clickCount.current += 1;

    if (clickCount.current === 7) {
      clickCount.current = 0;
      clearTimeout(clickTimeout.current);
      navigate("/master-admin"); // Hidden 7-click shortcut
      return;
    }

    clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      clickCount.current = 0;
    }, 5000);

    setTimeout(() => {
      if (clickCount.current !== 0) {
        navigate("/dashboard");
      }
    }, 200);
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="hamburger" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          {!isCollapsed && (
            <h2>
              <FontAwesomeIcon icon={faTint} style={{ marginRight: "5px" }} />
              AquaCheck
            </h2>
          )}
        </div>

        <ul className="nav-links">
          <li>
            <a
              href="/dashboard"
              className="nav-link"
              onClick={handleDashboardClick}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <FontAwesomeIcon icon={faTachometerAlt} />
              {!isCollapsed && <span> Dashboard</span>}
            </a>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/datahistory" className="nav-link">
                  <FontAwesomeIcon icon={faHistory} />
                  {!isCollapsed && <span> Dataset History</span>}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="nav-link logout-button"
                  type="button"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  {!isCollapsed && <span> Logout</span>}
                </button>
              </li>
            </>
          )}
        </ul>
      </aside>

      {showConfirm && (
        <div className="overlay">
          <div className="logout-modal">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-buttons">
              <button className="yes" onClick={confirmLogout}>
                Yes
              </button>
              <button className="no" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
