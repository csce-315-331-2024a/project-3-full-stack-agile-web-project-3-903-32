import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-5 rounded-lg flex flex-col min-h-[200px] relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-3xl bg-transparent border-none cursor-pointer">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;