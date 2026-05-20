// Module-level bridge so Topbar can trigger save/export without prop drilling.
// PageView registers its functions on mount and clears on unmount.

let _saveFn: (() => Promise<void>) | null = null
let _getPageData: (() => { title: string; content: string }) | null = null

export function registerSaveFn(fn: (() => Promise<void>) | null) {
  _saveFn = fn
}

export function registerPageDataFn(fn: (() => { title: string; content: string }) | null) {
  _getPageData = fn
}

export function invokeSave(): Promise<void> | undefined {
  return _saveFn?.()
}

export function getPageData() {
  return _getPageData?.() ?? null
}

export function hasSaveFn(): boolean {
  return _saveFn !== null
}
