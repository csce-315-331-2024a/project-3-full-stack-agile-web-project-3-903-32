import React, {useEffect, useState} from "react";
import Navbar from "../components/NavbarCashier";

const Cook = () => {
    const [order, setOrder] = useState([]);
    
    useEffect(() => {

    });
    
    return (
    <div className="flex flex-col h-screen bg-gray-100">
        <Navbar />
        <div className='flex justify-center gap-20 py-10 w-screen h-screen overflow-x-hidden bg-customMaroon text-white'>
            <div className="flex-col">
                <h1 className="text-6xl font-semibold mb-4">Cooks</h1>

                <div className='w-[1200px] h-[470px] p-4 bg-white rounded-lg overlow-auto text-black'>

                </div>

            </div>

            
        </div>
    </div>
    )

    
};

export default Cook;



