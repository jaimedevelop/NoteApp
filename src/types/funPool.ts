export interface FunPoolItem {
  id: string
  title: string
  notes: string
  status: 'active' | 'complete'
  assignedDates: string[]   // ISO dates — item can appear on multiple days
  createdAt: number
}

export interface CreateFunPoolPayload {
  title: string
  notes?: string
}