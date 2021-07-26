import { setItem, getItem, deleteItem, clear } from './localStorage.js'

jest.spyOn(window.localStorage.__proto__, 'setItem')
jest.spyOn(window.localStorage.__proto__, 'getItem')
jest.spyOn(window.localStorage.__proto__, 'removeItem')
jest.spyOn(window.localStorage.__proto__, 'clear')


describe('localStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should set item correctly', () => {
        setItem('hello', 'world')
        expect(localStorage.setItem).toHaveBeenCalled()
        expect(window.localStorage.getItem('hello')).toEqual('world')
    })

    it('should not set an item when argument is missed', () => {
        setItem('hello', null)
        setItem(null, 'world')
        expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should get item correctly', () => {
        setItem('hello', 'world')
        const item = getItem('hello')
        expect(item).toBeDefined()
        expect(item).toBe('world')
        expect(localStorage.getItem).toHaveBeenCalled()
    })

    it('should not get item if no key provided', () => {
        getItem()
        expect(localStorage.getItem).not.toHaveBeenCalled()
    })

    it('should delete item correctly', () => {
        setItem('hello', 'world')
        deleteItem('hello')
        const item = getItem('hello')
        expect(item).toBe(null)
        expect(localStorage.removeItem).toHaveBeenCalled()
    })

    it('should not delete item when no key provided', () => {
        setItem('hello', 'world')
        deleteItem()
        const item = getItem('hello')
        expect(item).toBe('world')
        expect(localStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should clear localStorage correctly', () => {
        clear()
        expect(localStorage.clear).toHaveBeenCalled()
    })
})
