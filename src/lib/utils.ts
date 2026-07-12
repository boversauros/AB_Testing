interface EventListenerTarget {
  addEventListener(
    event: string,
    callback: EventListenerOrEventListenerObject
  ): void
}

function addListener(
  HTML_element: EventListenerTarget,
  event: string,
  callback: EventListenerOrEventListenerObject
): void
function addListener(
  HTML_element?: unknown,
  event?: unknown,
  callback?: unknown
): void
function addListener(
  HTML_element?: unknown,
  event?: unknown,
  callback?: unknown
): void {
  if (typeof HTML_element !== 'object' || HTML_element === null) {
    throw new Error('HTMLelement should be an object')
  }
  if (typeof event !== 'string') throw new Error('event should be a string')
  if (typeof callback !== 'function') {
    throw new Error('callback should be a function')
  }

  const target = HTML_element as EventListenerTarget
  target.addEventListener(event, callback as EventListener)
}

export { addListener }
