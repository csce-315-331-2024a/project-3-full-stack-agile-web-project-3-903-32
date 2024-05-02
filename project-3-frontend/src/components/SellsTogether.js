import React, { useEffect, useState } from 'react';

const SellsTogether = () => {
  const [sellData, setSellData] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {

    if (startTime && endTime && startTime > endTime) {
      alert("Start time cannot be set later than End time")
      return; // Exit early to prevent API call
    } 

    
    if(startTime && endTime){
      fetch(process.env.REACT_APP_BACKEND_URL + `/api/sells_together?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`)
      .then(Response => Response.json())
      .then(data => {
        const formattedData = Object.keys(data).map(key => ({
          item1: data[key][0],
          item2: data[key][1],
          frequency: data[key][2]
        }));
        console.log(formattedData);
        setSellData(formattedData);
    })
    .catch(error => {
      console.error('Error fetching Sells data:', error);
    });
    }
    
  }, [startTime,endTime]);

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
        {sellData.length > 0 ? (
          <table className="min-w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Item 1</th>
                <th className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Item 2</th>
                <th className='border border-gray-400 bg-gray-100 px-4 py-2 text-center'>Frequency</th>
              </tr>
            </thead>

            <tbody>
            {sellData.map((item,index) => (
                <tr key={index}>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.item1}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.item2}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item.frequency}</td>
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

export default SellsTogether;