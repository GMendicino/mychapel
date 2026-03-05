import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import '../styles/index.css';

interface LayoutProps {
  children: ReactNode; 
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Navbar />
            <div>
                { children }
            </div>
        </>
    );
};