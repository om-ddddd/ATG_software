/**
 * Module for handling PM model variables access and manipulation
 */

import { bindingRegistry, valueChangedEventType } from '../components/@ti/gc-core-databind/lib/CoreDatabind';

// Export function to initialize PM variables
export async function initializePmVars() {
    try {
        // Wait for the PM model to be ready
        await bindingRegistry.waitForModelReady('pm');
        //console.info('PM model is ready');

        // Create a global object to access PM variables
        window.pmVars = {
            // Getter functions to read current values
            get switchinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.switchinput');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting switchinput:', err);
                    return undefined;
                }
            },
            get sineinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.sineinput');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting sineinput:', err);
                    return undefined;
                }
            },
            get cum_sineinput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.cum_sineinput');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting cum_sineinput:', err);
                    return undefined;
                }
            },
            get mainoutput() {
                try {
                    const binding = bindingRegistry.getBinding('pm.mainoutput');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting mainoutput:', err);
                    return undefined;
                }
            },
            get gate_status() {
                try {
                    const binding = bindingRegistry.getBinding('pm.gate_status');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting gate_status:', err);
                    return undefined;
                }
            },
            get hold_status() {
                try {
                    const binding = bindingRegistry.getBinding('pm.hold_status');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting hold_status:', err);
                    return undefined;
                }
            },
            get pot_output() {
                try {
                    const binding = bindingRegistry.getBinding('pm.pot_output');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting pot_output:', err);
                    return undefined;
                }
            },
            get kp() {
                try {
                    const binding = bindingRegistry.getBinding('pm.kp');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting kp:', err);
                    return undefined;
                }
            },
            get ki() {
                try {
                    const binding = bindingRegistry.getBinding('pm.ki');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting ki:', err);
                    return undefined;
                }
            },
            get main_gain() {
                try {
                    const binding = bindingRegistry.getBinding('pm.main_gain');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting main_gain:', err);
                    return undefined;
                }
            },
            get offset() {
                try {
                    const binding = bindingRegistry.getBinding('pm.offset');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting offset:', err);
                    return undefined;
                }
            },
            get fine_offset() {
                try {
                    const binding = bindingRegistry.getBinding('pm.fine_offset');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting fine_offset:', err);
                    return undefined;
                }
            },
            get quick_hold() {
                try {
                    const binding = bindingRegistry.getBinding('pm.quick_hold');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting quick_hold:', err);
                    return undefined;
                }
            },
            get quick_input() {
                try {
                    const binding = bindingRegistry.getBinding('pm.quick_input');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting quick_input:', err);
                    return undefined;
                }
            },
            get frequency() {
                try {
                    const binding = bindingRegistry.getBinding('pm.frequency');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting frequency:', err);
                    return undefined;
                }
            },
            get stop() {
                try {
                    const binding = bindingRegistry.getBinding('pm.stop');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting stop:', err);
                    return undefined;
                }
            },
            get forward() {
                try {
                    const binding = bindingRegistry.getBinding('pm.forward');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting forward:', err);
                    return undefined;
                }
            },
            get forward_derivative() {
                try {
                    const binding = bindingRegistry.getBinding('pm.forward_derivative');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting forward_derivative:', err);
                    return undefined;
                }
            },
            get point_95() {
                try {
                    const binding = bindingRegistry.getBinding('pm.point_95');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting point_95:', err);
                    return undefined;
                }
            },
            get dcoffset() {
                try {
                    const binding = bindingRegistry.getBinding('pm.dcoffset');
                    return binding?.getValue();
                } catch (err) {
                    //console.error('Error getting dcoffset:', err);
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
                        //console.error('Error: PM binding for switchinput not found');
                    }
                } catch (err) {
                    //console.error('Error setting switchinput:', err);
                }
                return value;
            },
            set sineinput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.sineinput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for sineinput not found');
                    }
                } catch (err) {
                    //console.error('Error setting sineinput:', err);
                }
                return value;
            },
            set cum_sineinput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.cum_sineinput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for cum_sineinput not found');
                    }
                } catch (err) {
                    //console.error('Error setting cum_sineinput:', err);
                }
                return value;
            },
            set mainoutput(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.mainoutput');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for mainoutput not found');
                    }
                } catch (err) {
                    //console.error('Error setting mainoutput:', err);
                }
                return value;
            },
            set gate_status(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.gate_status');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for gate_status not found');
                    }
                } catch (err) {
                    //console.error('Error setting gate_status:', err);
                }
                return value;
            },
            set hold_status(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.hold_status');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for hold_status not found');
                    }
                } catch (err) {
                    //console.error('Error setting hold_status:', err);
                }
                return value;
            },
            set pot_output(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.pot_output');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for pot_output not found');
                    }
                } catch (err) {
                    //console.error('Error setting pot_output:', err);
                }
                return value;
            },
            set kp(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.kp');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for kp not found');
                    }
                } catch (err) {
                    //console.error('Error setting kp:', err);
                }
                return value;
            },
            set ki(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.ki');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for ki not found');
                    }
                } catch (err) {
                    //console.error('Error setting ki:', err);
                }
                return value;
            },
            set main_gain(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.main_gain');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for main_gain not found');
                    }
                } catch (err) {
                    //console.error('Error setting main_gain:', err);
                }
                return value;
            },
            set offset(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.offset');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for offset not found');
                    }
                } catch (err) {
                    //console.error('Error setting offset:', err);
                }
                return value;
            },
            set fine_offset(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.fine_offset');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for fine_offset not found');
                    }
                } catch (err) {
                    //console.error('Error setting fine_offset:', err);
                }
                return value;
            },
            set quick_hold(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.quick_hold');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for quick_hold not found');
                    }
                } catch (err) {
                    //console.error('Error setting quick_hold:', err);
                }
                return value;
            },
            set quick_input(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.quick_input');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for quick_input not found');
                    }
                } catch (err) {
                    //console.error('Error setting quick_input:', err);
                }
                return value;
            },
            set frequency(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.frequency');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for frequency not found');
                    }
                } catch (err) {
                    //console.error('Error setting frequency:', err);
                }
                return value;
            },
            set stop(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.stop');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for stop not found');
                    }
                } catch (err) {
                    //console.error('Error setting stop:', err);
                }
                return value;
            },
            set forward(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.forward');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for forward not found');
                    }
                } catch (err) {
                    //console.error('Error setting forward:', err);
                }
                return value;
            },
            set forward_derivative(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.forward_derivative');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for forward_derivative not found');
                    }
                } catch (err) {
                    //console.error('Error setting forward_derivative:', err);
                }
                return value;
            },
            set point_95(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.point_95');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for point_95 not found');
                    }
                } catch (err) {
                    //console.error('Error setting point_95:', err);
                }
                return value;
            },
            set dcoffset(value) {
                try {
                    const binding = bindingRegistry.getBinding('pm.dcoffset');
                    if (binding) {
                        binding.setValue(value);
                    } else {
                        //console.error('Error: PM binding for dcoffset not found');
                    }
                } catch (err) {
                    //console.error('Error setting dcoffset:', err);
                }
                return value;
            },

            // Helper function to get all PM variables at once
            getAll() {
                try {
                    return {
                        switchinput: this.switchinput,//peace mar
                        sineinput: this.sineinput,
                        cum_sineinput: this.cum_sineinput,
                        mainoutput: this.mainoutput,
                        gate_status: this.gate_status,
                        hold_status: this.hold_status,
                        pot_output: this.pot_output,
                        kp: this.kp,
                        ki: this.ki,
                        main_gain: this.main_gain,
                        offset: this.offset,
                        fine_offset: this.fine_offset,
                        quick_hold: this.quick_hold,
                        quick_input: this.quick_input,
                        frequency: this.frequency,
                        stop: this.stop,
                        forward: this.forward,
                        forward_derivative: this.forward_derivative,
                        point_95: this.point_95,
                        dcoffset: this.dcoffset
                    };
                } catch (err) {
                    //console.error('Error getting all PM variables:', err);
                    return {};
                }
            },

            // Helper function to monitor changes in a variable
            monitor(varName, intervalMs = 1000) {
                // Check if variable name is valid
                if (!['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gate_status', 'hold_status', 'pot_output', 'kp', 'ki', 'main_gain', 'offset', 'fine_offset', 'quick_hold', 'quick_input', 'frequency', 'stop', 'forward', 'forward_derivative', 'point_95', 'dcoffset'].includes(varName)) {
                    //console.error(`Error: Invalid PM variable name "${varName}"`);
                    //console.info('Valid variables: switchinput, sineinput, cum_sineinput, mainoutput, gate_status, hold_status, pot_output, kp, ki, main_gain, offset, fine_offset, quick_hold, quick_input, frequency, stop, forward, forward_derivative, point_95, dcoffset');
                    return `Invalid variable name: ${varName}`;
                }

                if (!this._monitors) this._monitors = {};

                // Clear existing monitor for this variable if any
                if (this._monitors[varName]) {
                    clearInterval(this._monitors[varName]);
                }

                let lastValue = this[varName];
                // //console.log(`Monitoring pm.${varName}, current value:`, lastValue);

                this._monitors[varName] = setInterval(() => {
                    try {
                        const currentValue = this[varName];
                        if (currentValue !== lastValue) {
                            // //console.log(`pm.${varName} changed: ${lastValue} → ${currentValue}`);
                            lastValue = currentValue;
                        }
                    } catch (err) {
                        //console.error(`Error monitoring pm.${varName}:`, err);
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
        const pmVarNames = ['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gate_status', 'hold_status', 'pot_output', 'kp', 'ki', 'main_gain', 'offset', 'fine_offset', 'quick_hold', 'quick_input', 'frequency', 'stop', 'forward', 'forward_derivative', 'point_95', 'dcoffset'];
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
                                //console.error(`Error in listener for pm.${varName}:`, err);
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
            if (!['switchinput', 'sineinput', 'cum_sineinput', 'mainoutput', 'gate_status', 'hold_status', 'pot_output', 'kp', 'ki', 'main_gain', 'offset', 'fine_offset', 'quick_hold', 'quick_input', 'frequency', 'stop', 'forward', 'forward_derivative', 'point_95', 'dcoffset'].includes(varName)) {
                //console.error(`Error: Invalid PM variable name "${varName}"`);
                //console.info('Valid variables: switchinput, sineinput, cum_sineinput, mainoutput, gate_status, hold_status, pot_output, kp, ki, main_gain, offset, fine_offset, quick_hold, quick_input, frequency, stop, forward, forward_derivative, point_95, dcoffset');
                return `Invalid variable name: ${varName}`;
            }

            if (typeof callback !== 'function') {
                //console.error('Error: Callback must be a function');
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

        // Set default values for new PM variables
        window.pmVars.point_95 = 0.95;
        window.pmVars.forward = 70;
        window.pmVars.forward_derivative = 6000;
       
        //console.info('PM variables are now accessible via the global "pmVars" object in the browser //console.');
        //console.info('================================================================');

        return window.pmVars;
    } catch (err) {
        //console.error('Error setting up PM model access:', err);
        return null;
    }
}

// Auto-initialize when module is loaded
initializePmVars();
