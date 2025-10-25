import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

export default function GanttChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-gray-500 text-sm">No simulation data yet.</p>;
  }

  // Get all unique processes
  const processes = [...new Set(timeline.map(t => t.pid))];

  // Build chart data dynamically
  const chartData = processes.map(pid => {
    const entries = timeline.filter(t => t.pid === pid);
    const processData = { pid };
    entries.forEach((e, i) => {
      processData[`block${i}`] = e.end - e.start; // bar length
      processData[`start${i}`] = e.start;         // starting point
    });
    return processData;
  });

  // Determine max number of blocks to render
  const maxBlocks = Math.max(...chartData.map(d => Object.keys(d).filter(k => k.startsWith("block")).length));

  // Find total time for X-axis scaling
  const totalTime = Math.max(...timeline.map(t => t.end));

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Gantt Chart</h2>

      <BarChart
        width={950}
        height={400}
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, totalTime]}
          label={{ value: "Time", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          type="category"
          dataKey="pid"
          width={80}
          label={{ value: "Process", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value, name) =>
            name.startsWith("block")
              ? [`Duration: ${value}`, "Execution Segment"]
              : value
          }
        />

        {/* Dynamically render all blocks */}
        {Array.from({ length: maxBlocks }).map((_, i) => (
          <Bar
            key={i}
            dataKey={`block${i}`}
            stackId="a"
            fill={`hsl(${(i * 50) % 360}, 70%, 40%)`}
          >
            <LabelList dataKey={`block${i}`} position="inside" fill="white" />
          </Bar>
        ))}
      </BarChart>

      <p className="text-sm mt-3 text-gray-500">
        Each colored segment represents a CPU time slice for that process.
      </p>
    </div>
  );
}
