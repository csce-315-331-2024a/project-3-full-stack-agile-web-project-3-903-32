import React, {useEffect, useState} from 'react';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [startTime,setStartTime] = useState('');
  const [endTime,setEndTime] = useState('');
  
  useEffect(() => {

    if (startTime && endTime && startTime > endTime) {
      alert("Start time cannot be set later than End time")
      return; // Exit early to prevent API call
    } 
    
    if(startTime && endTime){
      fetch(process.env.REACT_APP_BACKEND_URL + `/api/sales_by_time?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`)
      .then(response => response.json())
      .then(data => {
        const formattedData = Object.keys(data).map(key => ({
          name: data[key].menuName,
          id: parseFloat(data[key].menuID),
          amount: parseFloat(data[key].frequency),
        }));
        setSalesData(formattedData);
      })
      .catch(error => {
        console.error('Error fetching product usage data:', error);
      });
    }
    
  }, [startTime, endTime]);

  return (
    <div>
      <div className='flex items-center mb-4'>
        <label className='mr-6'>
          <span className='mr-2'>Start Time:</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className='border-2 border-gray-300 p-2 rounded-lg'
            />
        </label>

        <label className='mr-6'>
          <span className='mr-2'>End Time:</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className='border-2 border-gray-300 p-2 rounded-lg'
            />
        </label>
      </div>

      <div>
        {salesData.length > 0 ? (
          <table className="min-w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th style={{width: 100}}className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Menu Id</th>
                <th className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Menu Name</th>
                <th className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Frequency</th>
              </tr>
            </thead>

            <tbody>
            {salesData.map((item,index) => (
                <tr key={index}>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.id}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.name}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available for the selected time.</div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;