import React from 'react';
/**
 * 
 * @param {object} param0 - the states use to determind the Cook confirm Modal
 * @returns the modal for cook confirm
 */
const ModalCookConfirm = ({ isOpen, message, onConfirm, onCancel }) => {
    return (
        <>
            {isOpen &&
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="h-[150px] bg-white rounded-lg p-8">
                        <p className="text-lg font-semibold">{message}</p>
                        <div className="mt-8 flex justify-center">
                            <button className="font-semibold bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2" onClick={onConfirm}>Confirm</button>
                            <button className="font-semibold ml-16 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded" onClick={onCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ModalCookConfirm;
