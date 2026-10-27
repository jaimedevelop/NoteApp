interface Appointment {
  id: string
  startMinute?: number | null
  endMinute?: number | null
}

export function appointmentPlacement(task: Appointment, start: number) {
  const scheduled = task.startMinute != null && task.endMinute != null
  const duration = scheduled ? task.endMinute! - task.startMinute! : 60
  const end = scheduled ? start + duration : Math.min(start + duration, 1440)
  return { start, end, valid: start >= 0 && end <= 1440 && end > start }
}

// Connected overlap groups share a width; touching endpoints can reuse a lane.
export function positionAppointments<T extends Appointment>(appointments: T[]) {
  const sorted = [...appointments].sort((a, b) => a.startMinute! - b.startMinute! || a.id.localeCompare(b.id))
  const groups: T[][] = []
  let groupEnd = -1
  for (const task of sorted) {
    if (task.startMinute! >= groupEnd) {
      groups.push([])
      groupEnd = task.endMinute!
    } else groupEnd = Math.max(groupEnd, task.endMinute!)
    groups[groups.length - 1].push(task)
  }
  return groups.flatMap(group => {
    const lanes: number[] = []
    const entries = group.map(task => {
      let lane = lanes.findIndex(end => end <= task.startMinute!)
      if (lane < 0) lane = lanes.length
      lanes[lane] = task.endMinute!
      return { task, lane }
    })
    return entries.map(entry => ({ ...entry, laneCount: lanes.length }))
  })
}
