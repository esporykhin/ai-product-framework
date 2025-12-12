import React, { useState, useEffect } from 'react';
import { LandingPage } from '../features/landing/LandingPage';
import { FrameworkApp } from '../features/framework/FrameworkApp';

export const App = () => {
    const [route, setRoute] = useState<'landing' | 'app'>('landing');

    useEffect(() => {
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
