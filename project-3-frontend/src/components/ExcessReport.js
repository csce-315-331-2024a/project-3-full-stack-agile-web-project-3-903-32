import React, { useEffect, useState } from 'react';

const ExcessReport = () => {
  const [excessData, setExcessData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    const fetchExcessData = async () => {
      if (startTime) {
        setIsLoading(true);
        try {
          const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/api/excess_report?start_time=${encodeURIComponent(startTime)}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setExcessData(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExcessData();
  }, [startTime]);

  const handleDateChange = (event) => {
    setStartTime(event.target.value);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-h-screen overflow-y-auto"> {/*need to change max height*/}
      <div className="flex items-center mb-4">
        <label htmlFor="start-time" className="mr-2">Start Time:</label>
        <input
          type="datetime-local"
          id="start-time"
          name="start-time"
          value={startTime}
          onChange={handleDateChange}
          className="border-2 border-gray-300 p-2 rounded-lg"
        />
      </div>
      
      <div>
        <table className="min-w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 bg-gray-100 px-4 py-2 text-center">Menu Item ID</th>
              <th className="border border-gray-400 bg-gray-100 px-4 py-2 text-center">Menu Item Name</th>
            </tr>
          </thead>
          <tbody>
            {excessData.map((item) => (
              <tr key={item}>
                <td className="border border-gray-400 px-4 py-2 text-center">{item}</td>
                <td className="border border-gray-400 px-4 py-2 text-center">{"Menu Name"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcessReport;