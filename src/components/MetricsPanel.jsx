export default function MetricsPanel({ metrics }) {
  if (!metrics || Object.keys(metrics).length === 0) {
    return <p className="text-gray-500">No metrics yet. Run simulation.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Metrics Panel</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-lg text-blue-600 font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
