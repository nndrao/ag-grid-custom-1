import { renderHook } from '@testing-library/react-hooks';
import { useKeyboardThrottler } from './useKeyboardThrottler';

describe('useKeyboardThrottler', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Mock addEventListener and removeEventListener
    addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should add and remove event listeners', () => {
    const { unmount } = renderHook(() => 
      useKeyboardThrottler({
        keys: ['Tab', 'ArrowDown'],
        maxEventsPerWindow: 3,
        timeWindowMs: 500,
      })
    );
    
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );
  });
  
  it('should not add event listeners when disabled', () => {
    renderHook(() => 
      useKeyboardThrottler({
        keys: ['Tab', 'ArrowDown'],
        maxEventsPerWindow: 3,
        timeWindowMs: 500,
        enabled: false,
      })
    );
    
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });
  
  it('should use the provided target element', () => {
    const targetElement = document.createElement('div');
    const addSpy = jest.spyOn(targetElement, 'addEventListener');
    
    renderHook(() => 
      useKeyboardThrottler({
        keys: ['Tab', 'ArrowDown'],
        maxEventsPerWindow: 3,
        timeWindowMs: 500,
        targetElement,
      })
    );
    
    expect(addSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );
  });
});
