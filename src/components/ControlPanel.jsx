import { useEffect, useState } from "react";
import processesData from "../data/processes.json";
import { roundRobin } from "../algorithms/roundRobin";
import { preemptivePriority } from "../algorithms/preemptivePriority";
import { mlfq } from "../algorithms/mlfq";

export default function ControlPanel({
  algorithm,
  setAlgorithm,
  setResults,
}) {
  const [numProcesses, setNumProcesses] = useState(5);
  const [contextSwitch, setContextSwitch] = useState(0);
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [quantum, setQuantum] = useState(1);

  useEffect(() => {
    // Transform process data to match algorithm requirements
    const processesWithDefaults = processesData.map((p, index) => ({
      pid: p.pid || `P${index + 1}`,
      burst: p.burst || 8,
      arrival: p.arrival || 0,
      priority: p.priority || 1
    }));
    setAvailableProcesses(processesWithDefaults);
  }, []);

  const handleNumChange = (delta) => {
    setNumProcesses((prev) => Math.max(1, prev + delta));
  };

  const runSimulation = () => {
    if (!algorithm) {
      setShowModal(true);
      return;
    }

    if (quantum <= 0) {
      setQuantum(1);
      return;
    }

    const selectedProcesses = availableProcesses.slice(0, numProcesses);
    let simulationResults;

    switch (algorithm) {
      case 'Round Robin':
        simulationResults = roundRobin(selectedProcesses, quantum);
        break;
      
      case 'Priority':
        simulationResults = preemptivePriority(selectedProcesses);
        break;
      
      case 'MLFQ':
        // MLFQ with 3 queues with increasing time quantum
        const queueQuantums = [quantum, quantum * 2, quantum * 4];
        simulationResults = mlfq(selectedProcesses, queueQuantums);
        break;

      default:
        return;
    }

    // Transform results to match the expected format
    const results = {
      algorithm,
      processes: simulationResults.processes,
      timeline: simulationResults.ganttData.map(entry => ({
        pid: entry.pid,
        start: entry.start,
        end: entry.end
      })),
      metrics: {
        avgResponseTime: parseFloat(simulationResults.metrics.avgResponseTime),
        avgWaitingTime: parseFloat(simulationResults.metrics.avgWaitingTime),
        avgTurnaroundTime: parseFloat(simulationResults.metrics.avgTurnaroundTime),
        throughput: parseFloat(simulationResults.metrics.throughput),
        contextSwitches: simulationResults.metrics.contextSwitches
      }
    };

    setResults(results);
  };

const calculateAvgResponseTime = (timeline) => {
  const firstResponse = {};
  timeline.forEach(entry => {
    if (!firstResponse[entry.pid]) {
      firstResponse[entry.pid] = entry.start;
    }
  });
  return Object.values(firstResponse).reduce((a, b) => a + b, 0) / Object.keys(firstResponse).length;
};

  const handleAlgorithmChange = (e) => setAlgorithm(e.target.value);

  return (
    <div className="bg-gray-100 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6">
      {/* Left: Algorithm info */}
      <div className="flex-1">
        <label className="block text-gray-700 font-semibold mb-2">
          Algorithm:
        </label>
        <select
          value={algorithm}
          onChange={handleAlgorithmChange}
          className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer focus:outline-none"
        >
          <option value="">Select Algorithm</option>
          <option value="Round Robin">Round Robin</option>
          <option value="MLFQ">Multi-Level Feedback Queue</option>
          <option value="Priority">Preemptive Priority</option>
        </select>

        {/* Algorithm Description */}
        <p className="text-gray-600 text-sm mt-3">
          {algorithm === "Round Robin"
            ? "Round Robin will execute each process for the duration of the time quantum. It will then move on to the next process."
            : algorithm === "MLFQ"
            ? "Multi-Level Feedback Queue dynamically adjusts process priority based on behavior and CPU bursts."
            : algorithm === "Preemptive Priority"
            ? "Preemptive Priority selects the process with the highest priority to execute next."
            : "Select an algorithm to view its description."}
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Algorithm Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please select an algorithm before running the simulation.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Right: Controls */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Number of Processes */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Number of Processes:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNumChange(-1)}
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              -
            </button>
            <span className="w-10 text-center">{numProcesses}</span>
            <button
              onClick={() => handleNumChange(1)}
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Context Switch Time */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Context Switch Time:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setContextSwitch((prev) => Math.max(0, prev - 0.5))
              }
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              -
            </button>
            <span className="w-10 text-center">{contextSwitch}</span>
            <button
              onClick={() => setContextSwitch((prev) => prev + 0.5)}
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Time Quantum */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Time Quantum:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantum((prev) => Math.max(0.5, prev - 0.5))}
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              -
            </button>
            <span className="w-10 text-center">{quantum}</span>
            <button
              onClick={() => setQuantum((prev) => prev + 0.5)}
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runSimulation}
          className="mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
}