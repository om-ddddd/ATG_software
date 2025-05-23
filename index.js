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

const console = new GcConsole('myapp'); // creates a console instance with name 'myapp'
GcConsole.setLevel('myapp', 4);         // enable console output for myapp console instance
console.info('index.js is loaded...');

// Initialize sine wave variables
let sineValue = 19.06; // Initial DC offset value
let tideRange = 10; // Default tide range (peak to peak value)
let angularFrequency = 0.0014; // Angular frequency
let startTime = null;
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

// Handle Change User Dialog
document.addEventListener('DOMContentLoaded', () => {
  const okButton = document.getElementById('okChangeUser');
  const formElement = document.getElementById('changeUserForm');
  
  if (okButton) {
    okButton.addEventListener('click', async () => {
      // Get form values
      const userType = document.querySelector('input[name="userType"]:checked').value;
      const newUserName = document.getElementById('newUserName').value;
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const retypePassword = document.getElementById('retypePassword').value;
      
      // Simple validation
      if (currentPassword.trim() === '') {
        showError('Current password is required.');
        return;
      }
      
      if (newPassword !== retypePassword) {
        showError('New password and retyped password do not match.');
        return;
      }
      
      if (newPassword && newPassword.length < 3) {
        showError('New password must be at least 3 characters.');
        return;
      }
      
      try {
        // Create the request body
        const requestBody = {
          userType: userType,
          newUserName: newUserName,
          currentPassword: currentPassword,
          newPassword: newPassword
        };
        
        // Send the API request
        const response = await fetch('/api/changeUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Show success message
          showSuccess(result.message || 'User information updated successfully');
          
          // Clear form fields
          document.getElementById('newUserName').value = '';
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('retypePassword').value = '';
          
          // Close dialog after a delay
          setTimeout(() => {
            document.getElementById('changeUserDialog').style.display = 'none';
          }, 1500);
        } else {
          // Show error message
          showError(result.message || 'Failed to update user information');
        }
      } catch (error) {
        showError('An error occurred while updating user information');
        console.error('Change user API error:', error);
      }
    });
  }
  
  // Helper function to show error messages
  function showError(message) {
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      formElement.appendChild(errorElement);
    }
    
    // Hide success message if any
    const successElement = document.querySelector('.success-message');
    if (successElement) successElement.style.display = 'none';
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 3000);
  }
  
  // Helper function to show success messages
  function showSuccess(message) {
    let successElement = document.querySelector('.success-message');
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'success-message';
      formElement.appendChild(successElement);
    }
    
    // Hide error message if any
    const errorElement = document.querySelector('.error-message');
    if (errorElement) errorElement.style.display = 'none';
    
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }
});

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

// Add code to expose PM model variables to browser console
(async () => {
    try {
        // Wait for the PM model to be ready
        await bindingRegistry.waitForModelReady('pm');
        console.info('PM model is ready');

        // Create a global object to access PM variables
        window.pmVars = {
            // Getter functions to read current values
            get switchinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.switchinput');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting switchinput:', err);
                    return undefined;
                }
            },
            get sineinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.sineinput');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting sineinput:', err);
                    return undefined;
                }
            },
            get cum_sineinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.cum_sineinput');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting cum_sineinput:', err);
                    return undefined;
                }
            },
            get mainoutput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.mainoutput');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting mainoutput:', err);
                    return undefined;
                }
            },
            get gatestatus() {
                try {
                    const binding = bindingRegistry.getBinding('pm.gatestatus');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting gatestatus:', err);
                    return undefined;
                }
            },
            get hold_status() {
                try {
                    const binding = bindingRegistry.getBinding('pm.hold_status');
                    return binding?.getValue();
                } catch (err) {
                    console.error('Error getting hold_status:', err);
                    return undefined;
                }
            },

            // Setter functions to change values
            set switchinput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.switchinput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for switchinput not found');
                    }
                } catch (err) {
                    console.error('Error setting switchinput:', err);
                }
                return value;
            },
            set sineinput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.sineinput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for sineinput not found');
                    }
                } catch (err) {
                    console.error('Error setting sineinput:', err);
                }
                return value;
            },
            set cum_sineinput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.cum_sineinput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for cum_sineinput not found');
                    }
                } catch (err) {
                    console.error('Error setting cum_sineinput:', err);
                }
                return value;
            },
            set mainoutput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.mainoutput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for mainoutput not found');
                    }
                } catch (err) {
                    console.error('Error setting mainoutput:', err);
                }
                return value;
            },
            set gatestatus(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.gatestatus');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for gatestatus not found');
                    }
                } catch (err) {
                    console.error('Error setting gatestatus:', err);
                }
                return value;
            },
            set hold_status(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.hold_status');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        console.error('Error: PM binding for hold_status not found');
                    }
                } catch (err) {
                    console.error('Error setting hold_status:', err);
                }
                return value;
            },

            // Helper function to get all PM variables at once
            getAll() {
                try {
                    return {
                        switchinput: this.switchinput,
                        sineinput: this.sineinput,
                        cum_sineinput: this.cum_sineinput,
                        mainoutput: this.mainoutput,
                        gatestatus: this.gatestatus,
                        hold_status: this.hold_status
                    };
                } catch (err) {
                    console.error('Error getting all PM variables:', err);
                    return {};
                }
            },

            // Helper function to monitor changes in a variable
            monitor(varName, intervalMs = 1000) {
                // Check if variable name is valid
                if (!['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gatestatus', 'hold_status'].includes(varName)) {
                    console.error(`Error: Invalid PM variable name "${varName}"`);
                    console.info('Valid variables: switchinput, sineinput, cum_sineinput, mainoutput, gatestatus, hold_status');
                    return `Invalid variable name: ${varName}`;
                }

                if (!this._monitors) this._monitors = {};

                // Clear existing monitor for this variable if any
                if (this._monitors[varName]) {
                    clearInterval(this._monitors[varName]);
                }

                let lastValue = this[varName];
                console.log(`Monitoring pm.${varName}, current value:`, lastValue);

                this._monitors[varName] = setInterval(() => {
                    try {
                        const currentValue = this[varName];
                        if (currentValue !== lastValue) {
                            console.log(`pm.${varName} changed: ${lastValue} → ${currentValue}`);
                            lastValue = currentValue;
                        }
                    } catch (err) {
                        console.error(`Error monitoring pm.${varName}:`, err);
                    }
                }, intervalMs);

                return `Monitoring pm.${varName}. Use pmVars.stopMonitor('${varName}') to stop.`;
            },

            // Stop monitoring a variable
            stopMonitor(varName) {
                if (this._monitors && this._monitors[varName]) {
                    clearInterval(this._monitors[varName]);
                    delete this._monitors[varName];
                    return `Stopped monitoring pm.${varName}`;
                }
                return `Not monitoring pm.${varName}`;
            },

            // Stop all monitors
            stopAllMonitors() {
                if (this._monitors) {
                    Object.keys(this._monitors).forEach(varName => {
                        clearInterval(this._monitors[varName]);
                    });
                    this._monitors = {};
                }
                return 'Stopped all monitors';
            }
        };

        // Add listener support to track changes in real-time
        const pmVarNames = ['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gatestatus', 'hold_status'];
        pmVarNames.forEach(varName => {
            const binding = bindingRegistry.getBinding(`pm.${varName}`);
            if (binding) {
                binding.addEventListener(valueChangedEventType, (details) => {
                    // If we have listeners for this variable, notify them
                    if (window.pmVars._listeners && window.pmVars._listeners[varName]) {
                        window.pmVars._listeners[varName].forEach(callback => {
                            try {
                                callback(details.newValue, details.oldValue);
                            } catch (err) {
                                console.error(`Error in listener for pm.${varName}:`, err);
                            }
                        });
                    }
                });
            }
        });

        // Add methods to register and unregister listeners
        window.pmVars._listeners = {};

        window.pmVars.addListener = function (varName, callback) {
            // Check if variable name is valid
            if (!['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gatestatus', 'hold_status'].includes(varName)) {
                console.error(`Error: Invalid PM variable name "${varName}"`);
                console.info('Valid variables: switchinput, sineinput, cum_sineinput, mainoutput, gatestatus, hold_status');
                return `Invalid variable name: ${varName}`;
            }

            if (typeof callback !== 'function') {
                console.error('Error: Callback must be a function');
                return 'Callback must be a function';
            }

            if (!this._listeners) {
                this._listeners = {};
            }
            if (!this._listeners[varName]) {
                this._listeners[varName] = [];
            }
            this._listeners[varName].push(callback);
            return `Added listener for pm.${varName}`;
        };

        window.pmVars.removeListener = function (varName, callback) {
            if (this._listeners && this._listeners[varName]) {
                const index = this._listeners[varName].indexOf(callback);
                if (index !== -1) {
                    this._listeners[varName].splice(index, 1);
                    return `Removed listener for pm.${varName}`;
                }
            }
            return `Listener not found for pm.${varName}`;
        };

        console.info('PM variables are now accessible via the global "pmVars" object in the browser console.');
        console.info('================================================================');
        //     console.info('PM Variables now available in browser console via global "pmVars" object');
        //     console.info('================================================================');
        //     console.info('Getting/Setting Values:');
        //     console.info('  - Get value: pmVars.switchinput');
        //     console.info('  - Set value: pmVars.switchinput = true');
        //     console.info('  - Get all values: pmVars.getAll()');
        //     console.info('');
        //     console.info('Monitoring:');
        //     console.info('  - Start monitoring: pmVars.monitor("switchinput", 500) // 500ms interval');
        //     console.info('  - Stop specific monitor: pmVars.stopMonitor("switchinput")');
        //     console.info('  - Stop all monitors: pmVars.stopAllMonitors()');
        //     console.info('');
        //     console.info('Custom Event Listeners:');
        //     console.info('  - Add listener: const myCallback = (newVal, oldVal) => console.log(`Changed: ${oldVal} → ${newVal}`);');
        //     console.info('    pmVars.addListener("switchinput", myCallback);');
        //     console.info('  - Remove specific listener: pmVars.removeListener("switchinput", myCallback);');
        //     console.info('================================================================');
    } catch (err) {
        console.error('Error setting up PM model access:', err);
    }
})();
window.appVars = {
    // Getter and setter for sineValue
    get sineValue() {
        return sineValue;
    },
    set sineValue(value) {
        sineValue = Number(value);
        // Update the UI if input component exists
        GcWidget.querySelector('#input_2').then(sineValueInput => {
            if (sineValueInput) {
                sineValueInput.value = sineValue.toFixed(2);
            }
        });
        // Update the oscilloscope if it exists
        GcWidget.querySelector('#input').then(input => {
            if (input && input.addDataPoint) {
                input.addDataPoint(sineValue);
            }
        });
        return sineValue;
    },

    // Getter and setter for tideRange
    get tideRange() {
        return tideRange;
    },
    set tideRange(value) {
        tideRange = Number(value);
        return tideRange;
    },

    // Getter and setter for angularFrequency
    get angularFrequency() {
        return angularFrequency;
    },
    set angularFrequency(value) {
        angularFrequency = Number(value);
        return angularFrequency;
    },

    // Restart the sine wave generator
    restartGenerator() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        startSineWaveGenerator();
        return 'Sine wave generator restarted';
    }
};

console.info('Application variables are accessible via the global "appVars" object in the browser console.');
console.info('================================================================');
// console.info('Example usage:');
// console.info('  - Get current sine value: appVars.sineValue');
// console.info('  - Set sine value: appVars.sineValue = 25.5');
// console.info('  - Change tide range: appVars.tideRange = 20');
// console.info('  - Restart generator: appVars.restartGenerator()');

// Example code:
//
// (async () => {
//     /* Wait for widget and target models to be ready */
//     await bindingRegistry.waitForModelReady('widget');
//     await bindingRegistry.waitForModelReady('targetModelId');
//
//     /* A simple computed values based on simple expression */
//     bindingRegistry.bind('widget.id.propertyName', "targetModelId.targetVariable == 1 ? 'binding is one' : 'binding is not one'");
//
//     /* A custom two-way binding with custom getter and setter functions */
//     /* (setter is optional and getter only indicates one-way binding)   */
//     bindingRegistry.bind('widget.id.propertyName', 'targetModelId.targetVariable',
//         value => { return value*5/9 + 32; }, /* getter */
//         value => { return (value-32)*9/5; }  /* setter */
//     );
//
//     /* 1 to n bindings */
//     bindingRegistry.bind('widget.date.value', {
//         /* Dependant bindings needed in order to compute the date, in name/value pairs */
//             weekday: 'widget.dayOfWeek.selectedLabel',
//             day: 'widget.dayOfMonth.value',
//             month: 'widget.month.selectedLabel',
//             year: 'widget.year.value'
//         },
//         /* Getter for date computation */
//         function(values) {
//             /* compute and return the string value to bind to the widget with id 'date' */
//             return values.weekday + ', ' + values.month + ' ' + values.day + ', ' + values.year;
//         }
//     );
// })();


/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for registering menu and toolbar action callback
-------------------------------------------------------------------------------------------------------------------------------
**/

ActionRegistry.registerAction('cmd_exit', {
    run() { GcUtils.isNW ? require('nw.gui').Window.get().close() : window.close(); }
});
