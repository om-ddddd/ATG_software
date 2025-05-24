/**
 -------------------------------------------------------------------------------------------------------------------------------
This file provides boilerplate templates for interfacing with the GUI Composer framework.
For further information, see the available options under the Help main menu in the Designer.
-------------------------------------------------------------------------------------------------------------------------------
**/

import { GcUtils } from './components/@ti/gc-core-assets/lib/GcUtils';
import { GcConsole } from './components/@ti/gc-core-assets/lib/GcConsole';
import { bindingRegistry, valueChangedEventType } from './components/@ti/gc-core-databind/lib/CoreDatabind';
import { GcWidget } from './components/@ti/gc-widget-base/lib/GcWidget';
import { ActionRegistry } from './components/@ti/gc-widget-menu/lib/ActionRegistry';
import { initializePmVars } from './pm-variables.js';
import { initializeAuth } from './auth.js';
import {initAdminAuth} from './admin-auth.js';

const console = new GcConsole('myapp'); // creates a console instance with name 'myapp'
GcConsole.setLevel('myapp', 4);         // enable console output for myapp console instance
console.info('index.js is loaded...');

let animationId = null;

/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for working with webcomponents in the application
-------------------------------------------------------------------------------------------------------------------------------
**/

const init = () => {
    // Add menubar product-name-clicked event listener
    // GcWidget.querySelector('gc-widget-menubar').then(menubar => {
    //     menubar.addEventListener('product-name-clicked', () => window.open('https://dev.ti.com/', 'Dev Zone'));
    // });

    // Get the tide range selector

    // Get the accept button and add click listener
    GcWidget.querySelector('#accept_button').then(acceptButton => {
        acceptButton.addEventListener('click', () => {
            // Navigate to main_tab when accept is clicked
            GcWidget.querySelector('#main_tab_container').then(tabContainer => {
                // Get the index of the main_tab
                const mainTabIndex = Array.from(tabContainer.querySelectorAll('gc-widget-tab-panel')).findIndex(
                    panel => panel.id === 'main_tab'
                );

                if (mainTabIndex >= 0) {
                    tabContainer.index = mainTabIndex;

                    // Start updating water level values after accept button is clicked
                    startSineWaveGenerator();
                    
                    // Setup the oscilloscope with proper configuration
                    setupOscilloscope();
               
                    // Start listening for changes in water level values
                    if (window.pmVars && window.pmVars.addListener) {
                        // Update water level values immediately
                        updateActualWLSpan();
                        updateRequiredWLSpan();

                        // Add listeners for future changes
                        window.pmVars.addListener('mainoutput', updateActualWLSpan);
                        window.pmVars.addListener('cum_sineinput', updateRequiredWLSpan);
                    } else {
                        console.error('pmVars not available for adding listeners');
                    }
                }
            });
        });
    });

    // Add event listeners for H and R buttons
    GcWidget.querySelector('#button').then(hButton => {
        if (hButton) {
            hButton.addEventListener('click', () => {
                if (window.pmVars) {
                    window.pmVars.hold_status = 1;
                }
            });
        }
    });
    GcWidget.querySelector('#button_1').then(rButton => {
        if (rButton) {
            rButton.addEventListener('click', () => {
                if (window.pmVars) {
                    window.pmVars.hold_status = 0;
                }
            });
        }
    });

};

// Call the init function to set up event listeners
init();


/**
 * Start generating the sine wave values when the accept button is clicked
 */
function startSineWaveGenerator() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    startTime = performance.now();

    function updateSineValue(timestamp) {
        // Calculate elapsed time



        animationId = requestAnimationFrame(updateSineValue);
    }

    animationId = requestAnimationFrame(updateSineValue);
}
let capValue = 707; // Default to capacity for 1 wave (1 * sampleRate * 707)

/**
 * Configure the oscilloscope and set up input listeners
 */
function setupOscilloscope() {
  const osc = document.getElementById('oscilloscope');
  const waveInput = document.getElementById('no._of_waves');
  
  if (!osc) {
    console.error('Oscilloscope element not found');
    return;
  }
  
  // Get sample rate from oscilloscope
  const sampleRate = parseFloat(osc.getAttribute('sample-rate') || 7.09);
  console.log(`Using oscilloscope sample rate: ${sampleRate}`);
  
  // Set initial default value if wave input has a value
  if (waveInput && waveInput.value) {
    const value = parseFloat(waveInput.value);
    if (!isNaN(value)) {
      capValue = Math.round(value * sampleRate * 707);
    }
  }
  
  // Initialize oscilloscope with current capValue
  console.log('Initializing oscilloscope...');
  osc.setAttribute('capacity', 1);
  osc.setAttribute('trigger-mode', 'manual');
  osc.setAttribute('trigger-armed', true);
  
  // Short delay before applying final settings
  setTimeout(() => {
    osc.setAttribute('capacity', capValue);
    osc.setAttribute('trigger-mode', 'auto');
    
    // Update horizontal position slider max value to match the capacity
    const hPositionSlider = document.getElementById('h_position');
    if (hPositionSlider) {
      hPositionSlider.setAttribute('max', capValue);
      console.log(`Updated h_position slider max value to: ${capValue}`);
    }
    
    console.log(`Oscilloscope initialized with capacity: ${capValue}`);
  }, 100);
  
  // Configure input listener for future changes
  if (waveInput) {
    waveInput.addEventListener('input', function () {
      const value = parseFloat(this.value);
      if (isNaN(value)) return;
      
      console.log('User entered wave count:', value);
      
      // Calculate new capacity based on wave count
      capValue = Math.round(value * sampleRate * 707);
      console.log(`Updating capacity to: ${capValue}`);
      
      // Apply new capacity to oscilloscope
      osc.setAttribute('capacity', capValue);
      
      // Update horizontal position slider max value to match the capacity
      const hPositionSlider = document.getElementById('h_position');
      if (hPositionSlider) {
        hPositionSlider.setAttribute('max', capValue);
        console.log(`Updated h_position slider max value to: ${capValue}`);
      }
    });
    console.log('Wave input listener configured');
  } else {
    console.warn('Wave input element not found');
  }
}


// Update Actual WL and Required WL spans in container_1
function updateActualWLSpan() {
    const actualWLValue = document.getElementById('actual_wl_value');
    if (actualWLValue && window.pmVars) {
        let val = window.pmVars.mainoutput;
        if (typeof val === 'number') {
            actualWLValue.textContent = val.toFixed(2);
        } else if (!isNaN(parseFloat(val))) {
            actualWLValue.textContent = parseFloat(val).toFixed(2);
        } else {
            actualWLValue.textContent = val ?? '';
        }
    }
}
function updateRequiredWLSpan() {
    const requiredWLValue = document.getElementById('required_wl_value');
    if (requiredWLValue && window.pmVars) {
        let val = window.pmVars.cum_sineinput;
        if (typeof val === 'number') {
            requiredWLValue.textContent = val.toFixed(2);
        } else if (!isNaN(parseFloat(val))) {
            requiredWLValue.textContent = parseFloat(val).toFixed(2);
        } else {
            requiredWLValue.textContent = val ?? '';
        }
    }
}

// Initialize water level displays to "00"
function initWaterLevelDisplays() {
    const actualWLValue = document.getElementById('actual_wl_value');
    const requiredWLValue = document.getElementById('required_wl_value');

    if (actualWLValue) {
        actualWLValue.textContent = "00";
    }

    if (requiredWLValue) {
        requiredWLValue.textContent = "00";
    }
}
// Initialize water level displays to "00" on page load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initWaterLevelDisplays();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initWaterLevelDisplays();
    });
}

// Authentication code has been moved to auth.js

/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for databinding

Add custom computed value databindings here, using the following method:

syntax: bindingRegistry.bind(targetBinding, sourceBinding, [getter], [setter]);
    param targetBinding - single binding string or expression, or array of binding strings for multi-way binding.
    param sourceBinding - single binding string or expression, or array of binding strings for multi-way binding.
    param getter - (optional) - custom getter function for computing the targetBinding value(s) based on sourceBinding value(s).
    param setter - (optional) - custom setter function for computing the sourceBinding value(s) based on targetBinding value(s).

  (async () => {
      await bindingRegistry.waitForModelReady('widget');        // widget model, a built-in model
      await bindingRegistry.waitForModelReady('targetModelId'); // target model, gc-model-program, gc-model-streaming, etc...
      bindingRegistry.bind('widget.inputWidgetId.value', 'model.targetModelId.targetVariable');
      bindingRegistry.bind('widget.labelWidgetId.label', 'widget.inputWidgetId.value');
   })();
-------------------------------------------------------------------------------------------------------------------------------
**/

// PM variables are handled by pm-variables.js module

ActionRegistry.registerAction('cmd_exit', {
    run() { GcUtils.isNW ? require('nw.gui').Window.get().close() : window.close(); }
});

/**
 * Setup MutationObservers to detect when specific tab panels become visible
 */
function setupTabPanelObservers() {
  // Target elements
  const runTabPanel = document.getElementById('run');
  const settingsTabPanel = document.getElementById('page_settings');
  
  // Function to run when the 'run' tab panel becomes visible
  function runTabPanelFunction() {
    console.log('Run tab panel is now visible!');
    // Add your custom code here for when the 'run' tab panel becomes visible
    // For example:
    // - Initialize components 
    // - Load data
    // - Set default values
  }
  
  // Function to run when the 'page_settings' tab panel becomes visible
  function settingsTabPanelFunction() {
    console.log('Settings tab panel is now visible!');
    // Add your custom code here for when the 'page_settings' tab panel becomes visible
    // For example:
    // - Load settings
    // - Update configuration UI
    // - Fetch calibration values
  }
  
  // Set up observer for the 'run' tab panel
  if (runTabPanel) {
    const runObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.attributeName === 'style' || 
          mutation.attributeName === 'class' ||
          mutation.attributeName === 'hidden'
        ) {
          // Check if the panel is visible using computed style
          const isVisible = window.getComputedStyle(runTabPanel).display !== 'none' && 
                           !runTabPanel.hasAttribute('hidden');
          
          if (isVisible) {
            console.log('Run tab panel visibility detected!');
            runTabPanelFunction();
          //  initAdminAuth(); // Initialize admin authentication if needed
            
            // Optional: Stop observing after it's visible once
            // runObserver.disconnect();
          }
        }
      });
    });
    
    // Start observing
    runObserver.observe(runTabPanel, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'hidden'] 
    });
    console.log('Run tab panel observer initialized');
  } else {
    console.warn('Run tab panel element not found');
  }
  
  // Set up observer for the 'page_settings' tab panel
  if (settingsTabPanel) {
    const settingsObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.attributeName === 'style' || 
          mutation.attributeName === 'class' ||
          mutation.attributeName === 'hidden'
        ) {
          // Check if the panel is visible using computed style
          const isVisible = window.getComputedStyle(settingsTabPanel).display !== 'none' && 
                           !settingsTabPanel.hasAttribute('hidden');
          
          if (isVisible) {
            console.log('Settings tab panel visibility detected!');
            settingsTabPanelFunction();
            //initAdminAuth(); // Initialize admin authentication if needed
            // Optional: Stop observing after it's visible once
            // settingsObserver.disconnect();
          }
        }
      });
    });
    
    // Start observing
    settingsObserver.observe(settingsTabPanel, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'hidden'] 
    });
    console.log('Settings tab panel observer initialized');
  } else {
    console.warn('Settings tab panel element not found');
  }
}

// Add this to your init function or call it directly
document.addEventListener('DOMContentLoaded', () => {
  setupTabPanelObservers();
});

// Or add this line to your existing init function:
// setupTabPanelObservers();
