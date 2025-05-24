/**
 * Module for handling PM model variables access and manipulation
 */

import { bindingRegistry, valueChangedEventType } from './components/@ti/gc-core-databind/lib/CoreDatabind';

// Export function to initialize PM variables
export async function initializePmVars() {
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

        return window.pmVars;
    } catch (err) {
        console.error('Error setting up PM model access:', err);
        return null;
    }
}

// Auto-initialize when module is loaded
initializePmVars();
