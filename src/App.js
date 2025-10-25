import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import GanttChart from "./components/GanttChart";
import MetricsPanel from "./components/MetricsPanel";
import ResponseVsQuantum from "./components/ResponseVsQuantum";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';s

export default function App() {
  const [algorithm, setAlgorithm] = useState("");
  const [results, setResults] = useState(null);
  const [quantumData, setQuantumData] = useState([]);

  // Handler when ControlPanel runs simulation
  const handleRun = (res) => {
    setResults(res);

    // Only generate Response vs Quantum data for Round Robin
    if (res.algorithm === "Round Robin") {
      const data = [];
      for (let q = 1; q <= 10; q++) {
        const tempRes = res.runWithQuantum(q); // Assume each algo object has this function for RR
        data.push({
          quantum: q,
          responseTime: parseFloat(tempRes.metrics.avgResponseTime),
        });
      }
      setQuantumData(data);
    } else {
      setQuantumData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Shared Lab Server CPU Scheduler
      </h1>

      {/* Gantt Chart */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex justify-center">
        <div className="w-full max-w-[950px]">
          <GanttChart timeline={results?.timeline || []} />
        </div>
      </div>

      {/* Plot + Metrics for RR, or Metrics only */}
      {algorithm === "Round Robin" && quantumData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left: Response vs Quantum */}
          <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-center">
            <ResponseVsQuantum data={quantumData} />
          </div>

          {/* Right: Metrics */}
          <div className="bg-white rounded-2xl shadow p-4">
            <MetricsPanel metrics={results?.metrics || {}} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <MetricsPanel metrics={results?.metrics || {}} />
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow p-4">
        <ControlPanel
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          setResults={setResults}
          // setResults={handleRun}
          showQuantum={false}
          showContextSwitch={false}
          showAlgoDropdownSmall={true} // smaller dropdown
        />
      </div>
    </div>
  );
}
