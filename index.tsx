
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPage } from './views/LandingPage';
import { FrameworkApp } from './FrameworkApp';

// Simple Router Component
const Router = () => {
    const [route, setRoute] = useState<'landing' | 'app'>('landing');

    useEffect(() => {
        // Basic hash router check on load
        const checkHash = () => {
            if (window.location.hash === '#app') {
                setRoute('app');
            } else {
                setRoute('landing');
            }
        };

        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const navigateToApp = () => {
        window.location.hash = 'app';
        setRoute('app');
    };

    if (route === 'app') {
        return <FrameworkApp />;
    }

    return <LandingPage onNavigateToApp={navigateToApp} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<Router />);
