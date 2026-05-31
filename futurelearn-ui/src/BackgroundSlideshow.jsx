import React, { useState, useEffect } from 'react';

const BackgroundSlideshow = () => {
    const images = [
    "image1.jpg",
    "image9.jpg",
    "image3.jpg",
    "image4.jpg",
    "image8.jpg"
];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 15000);
        return () => clearInterval(interval);
    }, [images.length]);

    const containerStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, overflow: 'hidden' };
    const slideStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 2s ease-in-out' };
    // ... (haut du code inchangé)

    const overlayStyle = { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        // RÉGLAGES CORRIGÉS :
        // On passe de 0.3 à 0.15 pour que le blanc soit très léger
        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
        // On passe de 8px à 3px pour que l'image soit plus nette
        backdropFilter: 'blur(3px)', 
        WebkitBackdropFilter: 'blur(3px)' 
    };

// ... (reste du code)

    return (
        <div style={containerStyle}>
            {images.map((img, index) => (
                <div key={index} style={{ ...slideStyle, backgroundImage: `url(${img})`, opacity: index === currentIndex ? 1 : 0 }} />
            ))}
            <div style={overlayStyle}></div>
        </div>
    );
};

export default BackgroundSlideshow;