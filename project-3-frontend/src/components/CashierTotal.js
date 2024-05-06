import React, { useState } from 'react';
import Cashier from './Cashier';

/**
 * 
 * @returns the total amount in the orderList
 */
const CashierContainer = () => {
    const [total, setTotal] = useState(0);

    return (
        <Cashier total={total} setTotal={setTotal} />
    );
};

export default CashierContainer;
