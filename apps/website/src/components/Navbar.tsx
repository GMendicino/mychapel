import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(window.scrollY);

    // const toggleMenu = () => {
    //    setIsOpen(!isOpen);
    //};

    const closeMenu = () => {
        setIsOpen(false);
    };

useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY) {
            setIsOpen(false);
        }
        setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);


    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/" onClick={closeMenu}>
                    <img
                        src={"/images/UoAlogo.png"} alt="University of Aberdeen"
                        style={{ borderRadius: "10px"}}
                    />
                </Link>
            </div>

            <ul className={`navbar-links ${isOpen ? "active" : ""}`}>
                <li><a href="https://software-engineering-97t.pages.dev/" className="navbar-help" onClick = {closeMenu}>Tour Creator</a></li>
                <li><Link to="/help" className="navbar-help" onClick = {closeMenu}>Help</Link></li>
            </ul>
            
        </nav>
    );
};