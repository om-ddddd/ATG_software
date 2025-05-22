/**
 * Script to handle oscilloscope settings when the accept button is clicked
 */

// Import required modules
import { GcWidget } from './components/@ti/gc-widget-base/lib/GcWidget';
import { GcConsole } from './components/@ti/gc-core-assets/lib/GcConsole';

// Initialize console for logging
const console = new GcConsole('osc-config');
GcConsole.setLevel('osc-config', 4); // Enable console output
const wave_no = document.getElementById('no._of_waves');
const h_position = document.getElementById('h_position');

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    console.info('start_from_0.js loaded');

    // Get the accept button and add click event listener
    GcWidget.querySelector('#accept_button').then(acceptButton => {
        acceptButton.addEventListener('click', () => {
            console.info('Accept button clicked - configuring oscilloscope');
            
            // Navigate to main_tab when accept is clicked
            GcWidget.querySelector('#main_tab_container').then(tabContainer => {
                // Get the index of the main_tab
                const mainTabIndex = Array.from(tabContainer.querySelectorAll('gc-widget-tab-panel')).findIndex(
                    panel => panel.id === 'main_tab'
                );

                if (mainTabIndex >= 0) {
                    tabContainer.index = mainTabIndex;
                    
                    // Apply oscilloscope settings
                    configureOscilloscope();
                } else {
                    console.error('Main tab not found');
                }
            });
        });
    });
});

/**
 * Configure oscilloscope settings as specified
 */
function configureOscilloscope() {
    // Get oscilloscope element
    const osc = document.getElementById('oscilloscope');
    
    if (!osc) {
        console.error('Oscilloscope element not found');
        return;
    }
    
    console.info('Configuring oscilloscope with new settings');
    
    // Apply the sequence of settings as specified
    osc.setAttribute('capacity', 1);
    console.info('Set capacity to 1');
    
    osc.setAttribute('trigger-mode', 'manual');
    console.info('Set trigger-mode to manual');
    
    osc.setAttribute('trigger-armed', true);
    console.info('Set trigger-armed to true');
    
    // Short delay before applying the next settings
    setTimeout(() => {
        // Get current wave number value and calculate appropriate capacity
        const waveNoElement = document.getElementById('no._of_waves');
        let waveValue = 1; // Default to 1 if not set
        
        if (waveNoElement && waveNoElement.value) {
            waveValue = parseInt(waveNoElement.value) || 1; // Default to 1 if not a valid number
        }
        
        // Get sample rate from oscilloscope
        const sampleRate = parseFloat(osc.getAttribute('sample-rate') || 7.09); // Default to 7.09 if not set
        
        // Calculate capacity based on wave number, same as in the input event listener
        const capacity = waveValue * sampleRate * 707;
        
        osc.setAttribute('capacity', capacity);
        h_position.setAttribute('max', capacity);
        console.info(`Set capacity to ${capacity} based on ${waveValue} waves`);
        
        osc.setAttribute('trigger-mode', 'auto');
        console.info('Set trigger-mode to auto');
        
        console.info('Oscilloscope configuration complete');
    }, 100); // 100ms delay between settings
}
// Wait for DOM to load before adding event listener to wave_no
document.addEventListener('DOMContentLoaded', () => {
  // Add input event listener to wave_no element
  if (wave_no) {
    wave_no.addEventListener('input', function() {
      const osc = document.getElementById('oscilloscope');
      if (!osc) return;
      
      const value = parseInt(this.value) || 1; // Use 1 as default if not a valid number
      const sampleRate = parseFloat(osc.getAttribute('sample-rate') || 7.09);
      const capacity = Math.round(value * sampleRate * 707); // Round to nearest integer
      
      console.info(`Updating capacity to ${capacity} based on ${value} waves`);
      osc.setAttribute('capacity', capacity);
      h_position.setAttribute('max', capacity);
    });
  }
});