import React, { useEffect, useState } from 'react';

const ExcessReport = () => {
  const [excessData, setExcessData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExcessData = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API endpoint
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/excess_report');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setExcessData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExcessData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="max-h-[500px] overflow-y-auto">
        <table className="min-w-full border-collapse border border-black-200">
          <thead>
            <tr>
              <th className="border border-gray-200 bg-gray-100 px-4 py-2 text-center">Menu Item ID</th>
              <th className="border border-gray-200 bg-gray-100 px-4 py-2 text-center">Menu Item Name</th>
              {/* Add other table headers if necessary */}
            </tr>
          </thead>
          <tbody>
            {excessData.map((item) => (
              <tr key={item}>
                <td className="border border-gray-200 px-4 py-2 text-center">{item}</td>
                <td className="border border-gray-200 px-4 py-2 text-center">{"Menu Name"}</td>
                {/* Add other item details if necessary */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcessReport;