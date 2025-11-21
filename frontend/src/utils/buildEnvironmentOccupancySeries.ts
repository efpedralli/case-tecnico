type Entry = {
  id: number;
  checkInAt: string;
  checkOutAt: string | null;
};

export function buildEnvironmentOccupancySeries(entries: Entry[]) {
  type Event = { time: number; delta: number };

  const events: Event[] = [];

  for (const e of entries) {
    const inTime = new Date(e.checkInAt).getTime();
    if (!Number.isNaN(inTime)) {
      events.push({ time: inTime, delta: +1 });
    }

    if (e.checkOutAt) {
      const outTime = new Date(e.checkOutAt).getTime();
      if (!Number.isNaN(outTime)) {
        events.push({ time: outTime, delta: -1 });
      }
    }
  }

  // ordena por tempo
  events.sort((a, b) => a.time - b.time);

  let occupancy = 0;
  const points: { x: number; y: number }[] = [];

  for (const ev of events) {
    occupancy += ev.delta;
    points.push({ x: ev.time, y: occupancy });
  }

  return points;
}
