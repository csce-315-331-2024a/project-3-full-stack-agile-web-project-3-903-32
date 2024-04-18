import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#0088FE', // Bright blue
  '#00C49F', // Bright teal
  '#FFBB28', // Bright yellow
  '#FF8042', // Bright orange
  '#A28FEF', // Soft purple
  '#34568B', // Royal blue
  '#6B5B95', // Mauve
  '#88B04B', // Apple green
  '#F7CAC9', // Pastel pink
  '#92A8D1', // Soft blue
  '#DD4124', // Fiery red
  '#D65076', // Magenta
  '#45B8AC', // Aqua
  '#EFC050', // Marigold
  '#5B5EA6'  // Indigo
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
        <p className="label">{`${data.name}: ${data.amount} (${data.percentage}%)`}</p>
      </div>
    );
  }

  return null;
};

const ProductUsage = () => {
  const [data, setData] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if(startTime && endTime){
      fetch(process.env.REACT_APP_BACKEND_URL + `/api/product_usage?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`)
      .then(response => response.json())
      .then(data => {
        const formattedData = Object.keys(data).map(key => ({
          name: key,
          amount: parseFloat(data[key].amount),
          percentage: parseFloat(data[key].percentage)
        }));
        setData(formattedData);
      })
      .catch(error => {
        console.error('Error fetching product usage data:', error);
      });
    }
    
  }, [startTime, endTime]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <label className='mr-6'>
          <span className="mr-2">Start time:</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border-2 border-gray-300 p-2 rounded-lg"
          />
        </label>
        <label>
        <span className="mr-2">End time:</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border-2 border-gray-300 p-2 rounded-lg"
          />
        </label>
      </div>
      <PieChart width={800} height={600}>
        <Pie
          data={data}
          cx={300}
          cy={200}
          outerRadius={180}
          fill="#8884d8"
          dataKey="amount"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{
            marginRight: '-50px',
            paddingBottom: '20px' 
          }}
          content={({ payload }) => (
            <div className="grid grid-cols-2 gap-4 ml-auto w-auto">
              {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center">
                  <svg className="mr-2" width="14" height="14" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="16" fill={entry.color} />
                  </svg>
                  <span>{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </div>
  );
};

export default ProductUsage;