export function preemptivePriority(processes) {
  const ganttData = [];
  let currentTime = 0;
  const readyQueue = [];
  const remaining = processes.map(p => ({
    ...p,
    remainingBurst: p.burst,
    firstResponse: null,
  }));

  while (remaining.some(p => p.remainingBurst > 0)) {
    for (const p of remaining) {
      if (p.arrival <= currentTime && !readyQueue.includes(p) && p.remainingBurst > 0) {
        readyQueue.push(p);
      }
    }

    if (readyQueue.length === 0) {
      currentTime++;
      continue;
    }

    readyQueue.sort((a, b) => a.priority - b.priority);
    const current = readyQueue[0];
    if (current.firstResponse === null) current.firstResponse = currentTime;

    ganttData.push({ pid: current.pid, start: currentTime, end: currentTime + 1 });
    current.remainingBurst -= 1;
    currentTime++;

    if (current.remainingBurst === 0) {
      readyQueue.shift();
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

  return { ganttData, metrics, processes: completed };
}
