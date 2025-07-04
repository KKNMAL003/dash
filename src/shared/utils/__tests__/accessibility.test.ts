import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  focusUtils,
  screenReaderUtils,
  keyboardUtils,
  ariaUtils,
  formUtils,
  generateId,
  contrastUtils,
  highContrastUtils,
} from '../accessibility';

describe('Accessibility Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('generateId', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });

    it('generates different IDs for different prefixes', () => {
      const id1 = generateId('button');
      const id2 = generateId('input');
      
      expect(id1).toMatch(/^button-/);
      expect(id2).toMatch(/^input-/);
    });
  });

  describe('focusUtils', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="container">
          <button id="btn1">Button 1</button>
          <input id="input1" type="text" />
          <button id="btn2" disabled>Disabled Button</button>
          <a id="link1" href="#">Link 1</a>
          <div id="div1" tabindex="0">Focusable Div</div>
        </div>
      `;
    });



    describe('focusFirst', () => {
      it('focuses the first focusable element', () => {
        const container = document.getElementById('container')!;
        const focused = focusUtils.focusFirst(container);
        
        expect(focused).toBe(true);
        expect(document.activeElement?.id).toBe('btn1');
      });

      it('returns false when no focusable elements exist', () => {
        const emptyDiv = document.createElement('div');
        const focused = focusUtils.focusFirst(emptyDiv);
        
        expect(focused).toBe(false);
      });
    });

    describe('focusLast', () => {
      it('focuses the last focusable element', () => {
        const container = document.getElementById('container')!;
        const focused = focusUtils.focusLast(container);
        
        expect(focused).toBe(true);
        expect(document.activeElement?.id).toBe('div1');
      });
    });

    describe('trapFocus', () => {
      it('traps focus within container on Tab', () => {
        const container = document.getElementById('container')!;
        const btn1 = document.getElementById('btn1')!;
        const div1 = document.getElementById('div1')!;
        
        btn1.focus();
        
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        // Mock moving to last element
        div1.focus();
        focusUtils.trapFocus(container, event as any);
        
        // Should cycle back to first element
        expect(document.activeElement?.id).toBe('btn1');
      });

      it('traps focus on Shift+Tab', () => {
        const container = document.getElementById('container')!;
        const btn1 = document.getElementById('btn1')!;
        const div1 = document.getElementById('div1')!;
        
        btn1.focus();
        
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        focusUtils.trapFocus(container, event as any);
        
        // Should move to last element
        expect(document.activeElement?.id).toBe('div1');
      });
    });

    describe('saveFocus and restoreFocus', () => {
      it('saves and restores focus correctly', () => {
        const btn1 = document.getElementById('btn1')!;
        const input1 = document.getElementById('input1')!;
        
        btn1.focus();
        const savedElement = focusUtils.saveFocus();
        
        input1.focus();
        expect(document.activeElement).toBe(input1);
        
        focusUtils.restoreFocus(savedElement);
        expect(document.activeElement).toBe(btn1);
      });
    });
  });

  describe('screenReaderUtils', () => {
    it('announces messages to screen readers', () => {
      const message = 'Test announcement';
      screenReaderUtils.announce(message);
      
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer).toBeInTheDocument();
      expect(announcer?.textContent).toBe(message);
    });

    it('announces urgent messages', () => {
      const message = 'Urgent message';
      screenReaderUtils.announce(message, 'assertive');
      
      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer).toBeInTheDocument();
      expect(announcer?.textContent).toBe(message);
    });

    it('creates screen reader text', () => {
      const text = screenReaderUtils.createScreenReaderText('Hidden text');
      
      expect(text).toHaveClass('sr-only');
      expect(text.textContent).toBe('Hidden text');
    });
  });

  describe('keyboardUtils', () => {
    describe('isActionKey', () => {
      it('identifies action keys correctly', () => {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        const aEvent = new KeyboardEvent('keydown', { key: 'a' });
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });

        expect(keyboardUtils.isActionKey(enterEvent)).toBe(true);
        expect(keyboardUtils.isActionKey(spaceEvent)).toBe(true);
        expect(keyboardUtils.isActionKey(aEvent)).toBe(false);
        expect(keyboardUtils.isActionKey(tabEvent)).toBe(false);
      });
    });

    describe('handleArrowNavigation', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <div id="container">
            <button id="item1">Item 1</button>
            <button id="item2">Item 2</button>
            <button id="item3">Item 3</button>
          </div>
        `;
      });

      it('navigates with arrow keys', () => {
        const items = Array.from(document.querySelectorAll('button'));
        const item1 = document.getElementById('item1')!;

        item1.focus();

        let newIndex = -1;
        const onIndexChange = (index: number) => { newIndex = index; };

        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        keyboardUtils.handleArrowNavigation(downEvent, 0, items.length, onIndexChange);

        expect(newIndex).toBe(1);
      });

      it('wraps around at boundaries', () => {
        const items = Array.from(document.querySelectorAll('button'));

        let newIndex = -1;
        const onIndexChange = (index: number) => { newIndex = index; };

        // Test wrapping from last to first
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        keyboardUtils.handleArrowNavigation(downEvent, 2, items.length, onIndexChange);
        expect(newIndex).toBe(0);

        // Test wrapping from first to last
        const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        keyboardUtils.handleArrowNavigation(upEvent, 0, items.length, onIndexChange);
        expect(newIndex).toBe(2);
      });
    });
  });

  describe('ariaUtils', () => {
    describe('getExpandableAttributes', () => {
      it('returns correct attributes for expandable elements', () => {
        const attrs = ariaUtils.getExpandableAttributes(true, 'content-id');
        
        expect(attrs).toEqual({
          'aria-expanded': 'true',
          'aria-controls': 'content-id',
        });
      });
    });

    describe('getFieldAttributes', () => {
      it('returns correct attributes for form fields', () => {
        const attrs = ariaUtils.getFieldAttributes(
          undefined, // labelId
          'help-text', // describedById
          true, // required
          false // invalid
        );

        expect(attrs).toEqual({
          'aria-describedby': 'help-text',
          'aria-required': true,
        });
      });
    });
  });

  describe('formUtils', () => {
    describe('getErrorAttributes', () => {
      it('generates error attributes when hasError is true', () => {
        const attrs = formUtils.getErrorAttributes('email', 'email-error', true);

        expect(attrs).toEqual({
          'aria-describedby': 'email-error',
          'aria-invalid': true,
        });
      });

      it('generates empty object when hasError is false', () => {
        const attrs = formUtils.getErrorAttributes('email', 'email-error', false);

        expect(attrs).toEqual({});
      });
    });

    describe('getFormGroupAttributes', () => {
      it('generates form group attributes', () => {
        const attrs = formUtils.getFormGroupAttributes('label-id', 'field-id', 'error-id');

        expect(attrs).toEqual({
          role: 'group',
          'aria-labelledby': 'label-id',
          'aria-describedby': 'error-id',
        });
      });
    });
  });

  describe('contrastUtils', () => {
    describe('meetsContrastRequirement', () => {
      it('checks contrast requirements correctly', () => {
        // Light on dark should meet requirements
        const lightOnDark = contrastUtils.meetsContrastRequirement('white', 'gray-900');
        expect(lightOnDark).toBe(true);

        // Dark on light should meet requirements
        const darkOnLight = contrastUtils.meetsContrastRequirement('gray-900', 'white');
        expect(darkOnLight).toBe(true);

        // Similar colors should not meet requirements
        const similar = contrastUtils.meetsContrastRequirement('gray-100', 'gray-200');
        expect(similar).toBe(false);
      });
    });
  });
});
