import React from 'react';

const ModalCookConfirm = ({ isOpen, message, onConfirm, onCancel }) => {
    return (
        <>
            {isOpen &&
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="h-[200px] bg-white rounded-lg p-8">
                        <p className="text-lg">{message}</p>
                        <div className="mt-8 flex justify-center">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={onCancel}>Cancel</button>
                            <button className="ml-16 bg-red-500 text-white px-4 py-2 rounded" onClick={onConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ModalCookConfirm;
