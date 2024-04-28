import React from 'react';

const ModalCookConfirm = ({ isOpen, message, onConfirm, onCancel }) => {
    return (
        <>
            {isOpen &&
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="h-[150px] bg-white rounded-lg p-8">
                        <p className="text-lg font-semibold">{message}</p>
                        <div className="mt-8 flex justify-center">
                            <button className="font-semibold bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2" onClick={onCancel}>Cancel</button>
                            <button className="font-semibold ml-16 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded" onClick={onConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ModalCookConfirm;
