import { addListener, imageParser } from './utils.js'

describe('utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('addListener', () => {
        const element = {
            addEventListener: jest.fn()
        }

        const callback = () => {};

        it('should add event listener to an element', () => {
            addListener(element, 'click', callback)
            expect(element.addEventListener).toHaveBeenCalled()
            expect(element.addEventListener).toHaveBeenCalledWith('click', callback)
        })

        it('should throw error when no element provided', () => {
            expect(() => { addListener() }).toThrowError('HTMLelement should be an object')
        })

        it('should throw error when no event is provided', () => {
            expect(() => { addListener(element) }).toThrowError('event should be a string')
        })

        it('should throw error when event is not a string', () => {
            expect(() => { addListener(element, 3) }).toThrowError('event should be a string')
        })
        
        it('should throw error when no callback is provided', () => {
            expect(() => { addListener(element, 'click') }).toThrowError('callback should be a function')
        })

        it('should throw error when callback is not a function', () => {
            expect(() => { addListener(element, 'click', 'foo') }).toThrowError('callback should be a function')
        })
    })

    describe('imageParser', () => {
        const image = '<img src=\"test.jpg\" alt=\"test\" />'
        const url = 'test.12314215.jpg'

        it('should parse correctly the image information', () => {
            const result = imageParser(image, url);
            expect(result).toBeDefined();
            expect(result instanceof HTMLImageElement).toBeTruthy();
            expect(result.getAttribute('src')).toBe(url)
        })

        it('should throw error when no image provided', () => {
            expect(() => { imageParser() }).toThrowError('ImageElement should be an string')     
        })

        it('should throw error when image provided is not a string', () => {
            expect(() => { imageParser({}) }).toThrowError('ImageElement should be an string')     
        })

        it('should throw error when no url provided', () => {
            expect(() => { imageParser(image) }).toThrowError('imageURL should be an string')     
        })


        it('should throw error when url provided is not a string', () => {
            expect(() => { imageParser(image, {}) }).toThrowError('imageURL should be an string')     
        })
    })
})