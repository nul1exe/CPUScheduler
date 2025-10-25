export function roundRobin(processes, quantum) {
  const ganttData = [];
  const queue = [];
  let currentTime = 0;
  const remaining = processes.map(p => ({
    ...p,
    remainingBurst: p.burst,
    firstResponse: null,
  }));

  while (remaining.some(p => p.remainingBurst > 0)) {
    for (const p of remaining) {
      if (p.arrival <= currentTime && !queue.includes(p) && p.remainingBurst > 0) {
        queue.push(p);
      }
    }

    if (queue.length === 0) {
      currentTime++;
      continue;
    }

    const current = queue.shift();
    if (current.firstResponse === null) current.firstResponse = currentTime;

    const execTime = Math.min(current.remainingBurst, quantum);
    ganttData.push({ pid: current.pid, start: currentTime, end: currentTime + execTime });

    current.remainingBurst -= execTime;
    currentTime += execTime;

    if (current.remainingBurst > 0) {
      queue.push(current);
    } else {
      current.completionTime = currentTime;
    }
  }

  const completed = remaining.map(p => ({
    ...p,
    turnaroundTime: p.completionTime - p.arrival,
    waitingTime: p.turnaroundTime - p.burst,
    responseTime: p.firstResponse - p.arrival,
  }));

  const totalWT = completed.reduce((sum, p) => sum + p.waitingTime, 0);
  const totalTAT = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
  const totalRT = completed.reduce((sum, p) => sum + p.responseTime, 0);

  const metrics = {
    avgWaitingTime: (totalWT / completed.length).toFixed(2),
    avgTurnaroundTime: (totalTAT / completed.length).toFixed(2),
    avgResponseTime: (totalRT / completed.length).toFixed(2),
    throughput: (completed.length / currentTime).toFixed(2),
    contextSwitches: ganttData.length,
  };

  return { ganttData, metrics, processes: completed, quantum };
}
