import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function ResponseVsQuantum({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No data to plot.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Response Time vs Quantum</h2>
      <LineChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="quantum"
          label={{ value: "Quantum", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "Avg Response Time", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="responseTime"
          stroke="#34D399"
          strokeWidth={2}
        />
      </LineChart>
    </div>
  );
}
