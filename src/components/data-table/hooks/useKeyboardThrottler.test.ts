import { renderHook } from '@testing-library/react-hooks';
import { useKeyboardThrottler } from './useKeyboardThrottler'; // Path is now relative to this new location

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
        // eventsPerSecond: 6, // Updated to reflect new prop name if test logic depended on old ones
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
        // eventsPerSecond: 6,
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
        // eventsPerSecond: 6,
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