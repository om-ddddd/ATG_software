/**
 * Oscilloscope Control Module
 * 
 * This module handles the interaction between UI sliders and the oscilloscope display.
 * It manages vertical and horizontal scaling and positioning of waveforms.
 * 
 * @author TI GUI Composer Team
 * @version 1.0.0
 * @lastModified May 22, 2025
 */

// Import required modules if needed
// import { GcConsole } from './components/@ti/gc-core-assets/lib/GcConsole';

/**
 * Initialize the oscilloscope controls when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeOscilloscopeControls();
});

/**
 * Initialize all oscilloscope controls and event listeners
 * @returns {void}
 */
function initializeOscilloscopeControls() {
    // Get UI control elements
    const sliders = {
        verticalScale: document.getElementById('v_scale'),
        verticalPosition: document.getElementById('v_position'),
        horizontalScale: document.getElementById('h_scale'),
        horizontalPosition: document.getElementById('h_position')
    };
    
    // Get oscilloscope elements
    const oscilloscopeElements = {
        mainOscilloscope: document.getElementById('oscilloscope'),
        inputChannel1: document.getElementById('input_1'),
        inputChannel2: document.getElementById('input')
    };
    
    // Validate that all required elements exist
    if (!validateElements(sliders, oscilloscopeElements)) {
        console.error('Oscilloscope controls initialization failed: Missing required elements');
        return;
    }
    
    // Attach event listeners to sliders
    attachSliderEventListeners(sliders, oscilloscopeElements);
    
    console.log('Oscilloscope controls initialized successfully');
}

/**
 * Validate that all required DOM elements exist
 * @param {Object} sliders - Object containing slider elements
 * @param {Object} oscilloscopeElements - Object containing oscilloscope elements
 * @returns {boolean} True if all elements exist, false otherwise
 */
function validateElements(sliders, oscilloscopeElements) {
    // Check slider elements
    for (const [key, element] of Object.entries(sliders)) {
        if (!element) {
            console.error(`Missing slider element: ${key}`);
            return false;
        }
    }
    
    // Check oscilloscope elements
    for (const [key, element] of Object.entries(oscilloscopeElements)) {
        if (!element) {
            console.error(`Missing oscilloscope element: ${key}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Attach event listeners to slider controls
 * @param {Object} sliders - Object containing slider elements
 * @param {Object} oscilloscopeElements - Object containing oscilloscope elements
 */
function attachSliderEventListeners(sliders, oscilloscopeElements) {
    const { verticalScale, verticalPosition, horizontalScale, horizontalPosition } = sliders;
    const { mainOscilloscope, inputChannel1, inputChannel2 } = oscilloscopeElements;
    
    // Vertical scale control
    verticalScale.addEventListener('input', function() {
        const value = parseFloat(this.value);
        console.log(`Setting vertical scale to ${value}`);
        
        // Apply vertical scale to both input channels
        inputChannel1.setAttribute('vertical-scale', value);
        inputChannel2.setAttribute('vertical-scale', value);
    });
    
    // Vertical position control
    verticalPosition.addEventListener('input', function() {
        const value = parseFloat(this.value);
        console.log(`Setting vertical position to ${value}`);
        
        // Apply vertical position to both input channels
        inputChannel1.setAttribute('vertical-pos', value);
        inputChannel2.setAttribute('vertical-pos', value);
    });
    
    // Horizontal scale (zoom) control
    horizontalScale.addEventListener('input', function() {
        const value = parseFloat(this.value);
        console.log(`Setting horizontal zoom to ${value}`);
        
        // Apply horizontal zoom to main oscilloscope
        mainOscilloscope.setAttribute('horizontal-zoom', value);
    });
    
    // Horizontal position control
    horizontalPosition.addEventListener('input', function() {
        const value = parseFloat(this.value);
        console.log(`Setting horizontal position to ${value}`);
        
        // Apply horizontal position to main oscilloscope
        mainOscilloscope.setAttribute('horizontal-pos', value);
    });
}
