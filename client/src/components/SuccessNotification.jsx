import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const SuccessNotification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <FaCheckCircle style={{ fontSize: '1.5rem' }} />
            <span style={{ fontWeight: 'bold' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <FaTimes />
            </button>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default SuccessNotification;
