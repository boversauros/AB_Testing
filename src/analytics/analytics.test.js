import { Analytics } from './index.js'
import * as storage from '../lib/localStorage.js'


const setItem = jest.spyOn(storage, 'setItem');
const getItem = jest.spyOn(storage, 'getItem');

describe('Analytics', () => {
    const variations = [{ id: 'test', variation: 'control' }]

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        setItem.mockClear();
        getItem.mockClear();
    });


    it('should initialize correct the class', () => {
        const analytics = new Analytics({ context: { variations } })
        expect(analytics._context).toBeDefined();
        expect(analytics._context).toEqual({ variations })
    })

    it('should give context correctly', () => {
        const analytics = new Analytics({ context: { variations } })
        const context = analytics._getContext();
        expect(context).toBeDefined();
        expect(context.variations).toEqual(variations);
        expect(context.user).toBeDefined();
        expect(typeof context.user).toBe('object');
        expect(context.user.gdpr).toBeTruthy();
    })

    it('should track correctly a not unique event', () => {
        const analytics = new Analytics({ context: { variations } })

        analytics.track('click', { properties: 'test' });
        expect(setItem).not.toHaveBeenCalled();
        expect(getItem).not.toHaveBeenCalled();
    })

    it('should track correctly a unique event', () => {
        const analytics = new Analytics({ context: { variations } })

        analytics.track('click', { properties: 'test' }, true);
        expect(setItem).toHaveBeenCalled();
        expect(getItem).toHaveBeenCalled();
        expect(getItem).toHaveBeenCalledWith('click');
        expect(setItem).toHaveBeenCalledWith('click', true);
    })

    it('should track correctly a not unique page`', () => {
        const analytics = new Analytics({ context: { variations } })

        analytics.page('page', { properties: 'test' });
        expect(setItem).not.toHaveBeenCalled();
        expect(getItem).not.toHaveBeenCalled();
    })

    it('should track correctly a unique page', () => {
        const analytics = new Analytics({ context: { variations } })

        analytics.page('page', { properties: 'test' }, true);
        expect(setItem).toHaveBeenCalled();
        expect(getItem).toHaveBeenCalled();
        expect(getItem).toHaveBeenCalledWith('page');
        expect(setItem).toHaveBeenCalledWith('page', true);
    })
})