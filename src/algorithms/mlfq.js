export function mlfq(processes, queues) {
  const ganttData = [];
  let currentTime = 0;
  const queueLevels = queues.map(q => ({ quantum: q, queue: [] }));
  const allProcesses = processes.map(p => ({
    ...p,
    remainingBurst: p.burst,
    firstResponse: null,
  }));

  while (allProcesses.some(p => p.remainingBurst > 0)) {
    for (const p of allProcesses) {
      if (p.arrival <= currentTime && p.remainingBurst > 0 && !queueLevels[0].queue.includes(p)) {
        queueLevels[0].queue.push(p);
      }
    }

    let currentProcess = null;
    let currentLevel = 0;

    for (let i = 0; i < queueLevels.length; i++) {
      if (queueLevels[i].queue.length > 0) {
        currentProcess = queueLevels[i].queue.shift();
        currentLevel = i;
        break;
      }
    }

    if (!currentProcess) {
      currentTime++;
      continue;
    }

    if (currentProcess.firstResponse === null) currentProcess.firstResponse = currentTime;

    const quantum = queueLevels[currentLevel].quantum;
    const execTime = Math.min(quantum, currentProcess.remainingBurst);

    ganttData.push({ pid: currentProcess.pid, start: currentTime, end: currentTime + execTime });
    currentProcess.remainingBurst -= execTime;
    currentTime += execTime;

    if (currentProcess.remainingBurst > 0) {
      if (currentLevel < queueLevels.length - 1)
        queueLevels[currentLevel + 1].queue.push(currentProcess);
      else
        queueLevels[currentLevel].queue.push(currentProcess);
    } else {
      currentProcess.completionTime = currentTime;
    }
  }

  const completed = allProcesses.map(p => ({
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
