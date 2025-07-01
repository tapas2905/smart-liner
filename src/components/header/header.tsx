import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './header.module.scss';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { setLogout } from "../../store/userSlice";
import alert from "../../services/alert";
import noProfileImage from "../../assets/images/no_profile_image.webp";

const Header: React.FC  = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef(null);
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close Profile dropdown toggle if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
   const handleLogout = () => {
    dispatch(setLogout());
    alert("You have been logged out successfully.", "success");
  };

  // Toggle the main menu open/close
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle dropdown menu toggle
  const handleDropdownToggle = (
    e: React.MouseEvent<HTMLSpanElement>,
    dropdownId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === dropdownId ? null : dropdownId));
  };

   // Handle Whole menu open/close
  const handleNavLinkClick = (e: React.MouseEvent<HTMLElement>) => {
    const link = (e.target as HTMLElement).closest('a');

    if (!link) return;

    if ((e.target as HTMLElement).closest('.dropdown-toggle')) {
      return;
    }

    setIsMenuOpen(false);
    setActiveDropdown(null);
  };


   // Add Remove Class on Body
  useEffect(() => {
    const body = document.body;
  
    if (isMenuOpen) {
      body.classList.add('body-fixed');
    } else {
      body.classList.remove('body-fixed');
    }
  
    // Optional cleanup on unmount
    return () => {
      body.classList.remove('body-fixed');
    };
  }, [isMenuOpen]);

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerLogoPrt}>
            <Link to="/"><img src='images/logo.svg' alt='Logo' /></Link>
          </div>
          <div className={styles.headerMenuPrt}>

            <nav className={`header-nav navbar navbar-expand-lg ${isMenuOpen ? 'show-menu' : ''}`}>
              <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarsExampleDefault">
                <ul className="navbar-nav" onClick={handleNavLinkClick}>
                  <li>
                    <Link to={'/'}>Product List</Link>
                  </li>
                  <li className="dropdown">
                    <Link to={'#'} onClick={handleNavLinkClick}>Shop Online</Link>
                    <span
                      className="dropdown-toggle"
                      onClick={(e) => handleDropdownToggle(e, 'dropdown01')}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === 'dropdown01' ? 'true' : 'false'}
                    ></span>
                    <ul className={`dropdown-menu slideInUp ${activeDropdown === 'dropdown01' ? 'show' : ''}`} aria-labelledby="dropdown01">
                      <li>
                        <Link to="/add-product">Fill manual form</Link>
                      </li>
                      <li>
                        <Link to="/add-product?attachFile=true">Automatically fill form from attachment or text</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          { isAuthenticated ? (
            <div
            className={styles.hdrSignInPrt}
            onClick={toggleProfile}
            ref={dropdownRef}
          >
            <div className={styles.hdrSignBtn}>
              <Link to={'#'}>
                <img
                  src={userInfo?.profileImage || noProfileImage}
                  alt='Profile'
                  className={styles.hdrProfileImg}
                />
                <span className={styles.hdrProfileName}>{userInfo?.name}</span>
                <i className="fa-solid fa-chevron-down hdr-profile-down-arrow"></i>
              </Link>
            </div>
            {isProfileOpen && (
              <div className={styles.hdrProfileDropdown}>
                <ul>
                  <li>
                    <Link to="/my-profile">
                      <i className="fa-regular fa-circle-user"></i>
                      <span>Profile</span>
                    </Link></li>
                  <li onClick={handleLogout}>
                    <Link to="#">
                     <i className="fa-solid fa-arrow-right-from-bracket"></i>
                     <span>Logout</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          ) : (
            <div
            className={styles.hdrSignInPrt}
          >
            <div className={styles.hdrSignBtn}>
              <Link to={'/login'}>
                <i className="fa-regular fa-circle-user"></i>
                <span>Sign In</span>
              </Link>
            </div>
          </div>
          )}
          <button
            className={`navbar-toggler ${isMenuOpen ? 'open' : ''}`}
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarsExampleDefault"
            aria-expanded={isMenuOpen ? 'true' : 'false'}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </div>
  );

};

export default Header;
