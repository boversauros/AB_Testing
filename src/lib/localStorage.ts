// Basic abstraction of window.localStorage CRUD.

export type StorageValue = string | number | boolean

const myStorage = window.localStorage

const setItem = (
  key?: string | null,
  value?: StorageValue | null
): void => {
  if (!key || !value) return

  myStorage.setItem(key, String(value))
}

function getItem(key: string): string | null
function getItem(key?: null): undefined
function getItem(key?: string | null): string | null | undefined {
  if (!key) return undefined

  return myStorage.getItem(key)
}

const deleteItem = (key?: string | null): void => {
  if (!key) return

  myStorage.removeItem(key)
}

const clear = (): void => {
  myStorage.clear()
}

export { setItem, getItem, deleteItem, myStorage, clear }
