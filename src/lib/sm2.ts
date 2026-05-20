/** SM-2 spaced repetition algorithm */

export type SMRating = 0 | 1 | 2 | 3   // 0=Again, 1=Hard, 2=Good, 3=Easy

// Maps our 4-button ratings to SM-2 quality (0-5)
const QUALITY: Record<SMRating, number> = { 0: 1, 1: 3, 2: 4, 3: 5 }

export interface SMState {
  interval: number      // days
  repetitions: number
  easeFactor: number
  dueDate: number       // ms timestamp; 0 = new card
}

export const INITIAL_SM: SMState = {
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
  dueDate: 0,
}

export function applyReview(state: SMState, rating: SMRating): SMState {
  const q = QUALITY[rating]
  let { interval, repetitions, easeFactor } = state

  if (q < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions++
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000

  return { interval, repetitions, easeFactor, dueDate }
}

export function isDue(card: SMState): boolean {
  return card.dueDate <= Date.now()
}

export function nextIntervals(state: SMState): Record<SMRating, number> {
  return {
    0: applyReview(state, 0).interval,
    1: applyReview(state, 1).interval,
    2: applyReview(state, 2).interval,
    3: applyReview(state, 3).interval,
  }
}

export function formatInterval(days: number): string {
  if (days <= 0) return 'hoje'
  if (days === 1) return '1d'
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}m`
  return `${Math.round(days / 365)}a`
}
