import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addListener } from '@/lib/utils'

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addListener', () => {
    const element = {
      addEventListener: vi.fn()
    }

    const callback = (): void => {}

    it('should add event listener to an element', () => {
      addListener(element, 'click', callback)
      expect(element.addEventListener).toHaveBeenCalled()
      expect(element.addEventListener).toHaveBeenCalledWith('click', callback)
    })

    it('should throw error when no element provided', () => {
      expect(() => addListener()).toThrowError(
        'HTMLelement should be an object'
      )
    })

    it('should throw error when no event is provided', () => {
      expect(() => addListener(element)).toThrowError('event should be a string')
    })

    it('should throw error when event is not a string', () => {
      expect(() => addListener(element, 3)).toThrowError(
        'event should be a string'
      )
    })

    it('should throw error when no callback is provided', () => {
      expect(() => addListener(element, 'click')).toThrowError(
        'callback should be a function'
      )
    })

    it('should throw error when callback is not a function', () => {
      expect(() => addListener(element, 'click', 'foo')).toThrowError(
        'callback should be a function'
      )
    })
  })
})
