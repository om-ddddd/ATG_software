// Initialize sine wave variables
let sineValue = 19.06; // Initial DC offset value
let tideRange = 10; // Default tide range (peak to peak value)
let angularFrequency = 0.0014; // Angular frequency
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
/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for working with webcomponents in the application
-------------------------------------------------------------------------------------------------------------------------------
**/