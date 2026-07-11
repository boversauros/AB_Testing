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

function imageParser(ImageElement: string, imageURL: string): HTMLImageElement
function imageParser(ImageElement?: unknown, imageURL?: unknown): HTMLImageElement
function imageParser(
  ImageElement?: unknown,
  imageURL?: unknown
): HTMLImageElement {
  if (typeof ImageElement !== 'string') {
    throw new Error('ImageElement should be an string')
  }
  if (typeof imageURL !== 'string') {
    throw new Error('imageURL should be an string')
  }

  const container = document.createElement('div')
  container.innerHTML = ImageElement
  const image = container.firstElementChild

  if (!(image instanceof HTMLImageElement)) {
    throw new Error('ImageElement should contain an image')
  }

  image.src = imageURL
  return image
}

export { addListener, imageParser }
