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
Boilerplate code for working with webcomponents in the application
-------------------------------------------------------------------------------------------------------------------------------
**/

const init = () => {
    console.info('Initializing application...');

    // Add menubar product-name-clicked event listener
    // GcWidget.querySelector('gc-widget-menubar').then(menubar => {
    //     menubar.addEventListener('product-name-clicked', () => window.open('https://dev.ti.com/', 'Dev Zone'));
    // });

    // Get the tide range selector
    GcWidget.querySelector('#tide_range').then(tideRangeSelector => {
        tideRangeSelector.addEventListener('change', (event) => {
            // Update the tide range when selection changes
            const selectedIndex = event.target.selectedIndex;
            const selectedLabels = event.target.labels.split(',');
            tideRange = parseInt(selectedLabels[selectedIndex], 10);
            console.info(`Tide range selected: ${tideRange}`);
        });
    });

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
                    // Start sine wave generator and setup label updaters
                    startSineWaveGenerator();
                    setupWaterLevelLabels();
                }
            });
        });
    });

    // Add event listener for H button to set hold_status to 1
    GcWidget.querySelector('#button').then(hButton => {
        hButton.addEventListener('click', () => {
            // Set hold_status to 1 when H button is clicked
            if (window.pmVars) {
                window.pmVars.hold_status = 1;
                console.info('H button pressed: hold_status set to 1');
            }
        });
    });

    // Add event listener for R button to set hold_status to 0
    GcWidget.querySelector('#button_1').then(rButton => {
        rButton.addEventListener('click', () => {
            // Set hold_status to 0 when R button is clicked
            if (window.pmVars) {
                window.pmVars.hold_status = 0;
                console.info('R button pressed: hold_status set to 0');
            }
        });
    });

    // Set up the oscilloscope initially
    GcWidget.querySelector('#oscilloscope').then(oscilloscope => {
        if (oscilloscope) {
            console.info('Oscilloscope found and initialized');
            
            // If we're already on the main tab, set up the labels
            GcWidget.querySelector('#main_tab_container').then(tabContainer => {
                if (tabContainer && tabContainer.index === Array.from(tabContainer.querySelectorAll('gc-widget-tab-panel'))
                    .findIndex(panel => panel.id === 'main_tab')) {
                    setupWaterLevelLabels();
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
        const timeElapsed = (timestamp - startTime) / 1000;
        const amplitude = tideRange / 2; // Half of peak-to-peak value

        // Calculate sine value with DC offset
        sineValue = 19.06 + amplitude * Math.sin(angularFrequency * timeElapsed);
        
        // // Update the cum_sineinput value in pmVars
        // if (window.pmVars) {
        //     window.pmVars.cum_sineinput = sineValue;
        // }

        // Update the input sine value display
        GcWidget.querySelector('#input_2').then(sineValueInput => {
            if (sineValueInput) {
                sineValueInput.value = sineValue.toFixed(2);
            }
        });

        // Update the oscilloscope with actual values from pmVars
        if (window.pmVars) {
            // Update mainoutput (Actual WL) oscilloscope
            GcWidget.querySelector('#input').then(input => {
                if (input && input.addDataPoint) {
                    const mainoutputValue = window.pmVars.mainoutput;
                    if (mainoutputValue !== undefined) {
                        input.addDataPoint(mainoutputValue);
                    }
                }
            });
            
            // Update cum_sineinput (Required WL) oscilloscope
            GcWidget.querySelector('#input_1').then(input => {
                if (input && input.addDataPoint) {
                    const cumSineValue = window.pmVars.cum_sineinput;
                    if (cumSineValue !== undefined) {
                        input.addDataPoint(cumSineValue);
                    } else {
                        // If no value yet in pmVars, use the calculated sine value
                        input.addDataPoint(sineValue);
                    }
                }
            });
        }

        animationId = requestAnimationFrame(updateSineValue);
    }

    animationId = requestAnimationFrame(updateSineValue);
}

/**
 * Setup the Required WL and Actual WL labels to show pmVars values
 */
function setupWaterLevelLabels() {
    // Get references to the labels
    let requiredWLLabel, actualWLLabel;
    
    GcWidget.querySelector('#label').then(label => {
        requiredWLLabel = label;
        updateRequiredWL();
    });
    
    GcWidget.querySelector('#label_1').then(label => {
        actualWLLabel = label;
        updateActualWL();
    });
    
    // Update Required WL label with cum_sineinput value
    function updateRequiredWL() {
        if (window.pmVars && requiredWLLabel) {
            const value = window.pmVars.cum_sineinput;
            if (value !== undefined) {
                requiredWLLabel.label = `Required WL: ${typeof value === 'number' ? value.toFixed(2) : value}`;
            } else {
                requiredWLLabel.label = 'Required WL: --';
            }
            setTimeout(updateRequiredWL, 100); // Update regularly
        }
    }
    
    // Update Actual WL label with mainoutput value
    function updateActualWL() {
        if (window.pmVars && actualWLLabel) {
            const value = window.pmVars.mainoutput;
            if (value !== undefined) {
                actualWLLabel.label = `Actual WL: ${typeof value === 'number' ? value.toFixed(2) : value}`;
            } else {
                actualWLLabel.label = 'Actual WL: --';
            }
            setTimeout(updateActualWL, 100); // Update regularly
        }
    }
    
    // Add listeners for value changes (alternative approach)
    if (window.pmVars && window.pmVars.addListener) {
        window.pmVars.addListener('cum_sineinput', (newValue) => {
            if (requiredWLLabel) {
                requiredWLLabel.label = `Required WL: ${typeof newValue === 'number' ? newValue.toFixed(2) : newValue}`;
            }
        });
        
        window.pmVars.addListener('mainoutput', (newValue) => {
            if (actualWLLabel) {
                actualWLLabel.label = `Actual WL: ${typeof newValue === 'number' ? newValue.toFixed(2) : newValue}`;
            }
        });
    }
}

document.readyState === 'complete' ? init() : document.addEventListener('DOMContentLoaded', init);

/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for registering menu and toolbar action callback
-------------------------------------------------------------------------------------------------------------------------------
**/

ActionRegistry.registerAction('cmd_exit', {
    run() { GcUtils.isNW ? require('nw.gui').Window.get().close() : window.close(); }
});
