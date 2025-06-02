/**
 * Timer Handler Module
 * This module provides a global timer object that can be set, paused, and resumed manually.
 * It allows executing functions at specific intervals that can be configured.
 */

// The singleton timer instance
let timerInstance = null;

/**
 * Timer class for managing interval-based tasks
 */
class Timer {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.interval = 1000; // Default interval: 1 second
        this.callbacks = [];
        this.elapsedTime = 0;
        this.lastTickTime = null;
    }

    /**
     * Set the interval for the timer
     * @param {number} milliseconds - The interval in milliseconds
     */
    setInterval(milliseconds) {
        if (typeof milliseconds !== 'number' || milliseconds < 0) {
            throw new Error('Interval must be a positive number');
        }
        
        this.interval = milliseconds;
        
        // If timer is running, restart it with the new interval
        if (this.isRunning) {
            this.stop();
            this.start();
        }
        
        return this;
    }

    /**
     * Add a callback function to be executed on each timer tick
     * @param {Function} callback - The function to execute
     * @returns {string} The ID of the callback for removal later
     */
    addCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        this.callbacks.push({
            id,
            fn: callback
        });
        
        return id;
    }

    /**
     * Remove a callback by its ID
     * @param {string} id - The ID of the callback to remove
     * @returns {boolean} True if the callback was removed, false otherwise
     */
    removeCallback(id) {
        const initialLength = this.callbacks.length;
        this.callbacks = this.callbacks.filter(callback => callback.id !== id);
        return this.callbacks.length !== initialLength;
    }

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) {
            return this;
        }
        
        this.isRunning = true;
        this.lastTickTime = Date.now();
        
        this.intervalId = setInterval(() => {
            const now = Date.now();
            const delta = now - this.lastTickTime;
            this.lastTickTime = now;
            
            this.elapsedTime += delta;
            
            // Execute all callbacks
            this.callbacks.forEach(callback => {
                try {
                    callback.fn({
                        elapsedTime: this.elapsedTime,
                        deltaTime: delta
                    });
                } catch (error) {
                    console.error('Error in timer callback:', error);
                }
            });
        }, this.interval);
        
        return this;
    }

    /**
     * Stop/pause the timer
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.isRunning = false;
        return this;
    }

    /**
     * Resume the timer after stopping
     */
    resume() {
        return this.start();
    }

    /**
     * Reset the timer's elapsed time counter
     */
    reset() {
        this.elapsedTime = 0;
        this.lastTickTime = this.isRunning ? Date.now() : null;
        return this;
    }

    /**
     * Check if the timer is currently running
     * @returns {boolean} True if the timer is running
     */
    isActive() {
        return this.isRunning;
    }

    /**
     * Get the current elapsed time
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsedTime() {
        return this.elapsedTime;
    }
    
    /**
     * Get the current interval setting
     * @returns {number} Interval in milliseconds
     */
    getCurrentInterval() {
        return this.interval;
    }
}

/**
 * Get the global timer instance (creates one if it doesn't exist)
 * @returns {Timer} The global timer instance
 */
export function getTimer() {
    if (!timerInstance) {
        timerInstance = new Timer();
    }
    return timerInstance;
}

/**
 * Helper function to schedule a function to run at intervals
 * @param {Function} callback - Function to execute
 * @param {number} interval - Interval in milliseconds
 * @returns {Object} Control object with id and control methods
 */
export function scheduleTask(callback, interval = 1000) {
    const timer = getTimer();
    
    // Set the interval if provided
    if (interval !== timer.getCurrentInterval()) {
        timer.setInterval(interval);
    }
    
    // Add the callback
    const callbackId = timer.addCallback(callback);
    
    // Start the timer if it's not already running
    if (!timer.isActive()) {
        timer.start();
    }
    
    // Return an object with control methods
    return {
        id: callbackId,
        stop: () => {
            timer.removeCallback(callbackId);
            // If no more callbacks, stop the timer
            if (timer.callbacks.length === 0) {
                timer.stop();
            }
        },
        pause: () => {
            timer.stop();
        },
        resume: () => {
            timer.start();
        },
        updateInterval: (newInterval) => {
            timer.setInterval(newInterval);
        }
    };
}

// Global timer controller for easy console access
const TimerController = {
    start: (interval = 1000) => {
        const timer = getTimer();
        timer.setInterval(interval);
        if (!timer.isActive()) {
            timer.start();
        }
        console.log(`Timer started with ${interval}ms interval`);
        return timer;
    },
    
    pause: () => {
        const timer = getTimer();
        timer.stop();
        console.log('Timer paused');
        return timer;
    },
    
    stop: () => {
        const timer = getTimer();
        timer.stop();
        timer.reset();
        console.log('Timer stopped and reset');
        return timer;
    },
    
    resume: () => {
        const timer = getTimer();
        timer.start();
        console.log('Timer resumed');
        return timer;
    },
    
    setInterval: (interval) => {
        const timer = getTimer();
        timer.setInterval(interval);
        console.log(`Timer interval set to ${interval}ms`);
        return timer;
    },
    
    addTask: (taskFunction) => {
        const timer = getTimer();
        const id = timer.addCallback(taskFunction);
        console.log(`Task added with ID: ${id}`);
        return id;
    },
    
    removeTask: (id) => {
        const timer = getTimer();
        const removed = timer.removeCallback(id);
        console.log(`Task ${id} ${removed ? 'removed' : 'not found'}`);
        return removed;
    },
    
    status: () => {
        const timer = getTimer();
        console.log(`Timer Status:
- Running: ${timer.isActive()}
- Interval: ${timer.getCurrentInterval()}ms
- Elapsed: ${timer.getElapsedTime()}ms
- Active tasks: ${timer.callbacks.length}`);
        return {
            running: timer.isActive(),
            interval: timer.getCurrentInterval(),
            elapsed: timer.getElapsedTime(),
            taskCount: timer.callbacks.length
        };
    },
    
    /**
     * Generate plot from current CSV data
     * @returns {Promise<Object>} Plot generation result
     */
    generatePlotFromCurrentCSV: async () => {
        try {
            // Get current CSV filename from localStorage
            const currentCsvFilename = localStorage.getItem('currentRecordingFilename');
            
            if (!currentCsvFilename) {
                throw new Error('No current recording filename found in localStorage');
            }
            
            // Get selected tide name for title
            const selectedTideName = localStorage.getItem('selectedTideName') || 'default';
            
            // Generate plot filename by changing CSV extension to PNG
            const plotFilename = currentCsvFilename.replace(/\.csv$/i, '.png');
            const plotTitle = `Auto Plot - ${selectedTideName} - ${new Date().toLocaleString()}`;
            
            console.log(`Generating auto plot from: ${currentCsvFilename} -> ${plotFilename}`);
            
            // Use global plotHandler to create plot
            if (typeof plotHandler === 'undefined') {
                throw new Error('plotHandler is not available globally');
            }
            
            const result = await plotHandler.createPlot(
                currentCsvFilename,
                plotTitle,
                plotFilename
            );
            
            console.log('Auto plot generated successfully:', result.data.fileName);
            return result;
            
        } catch (error) {
            console.error('Failed to generate auto plot:', error);
            throw error;
        }
    }
};

// Make TimerController globally available
if (typeof window !== 'undefined') {
    window.TimerController = TimerController;
}

/**
 * Add automatic plotting task that generates plots from current CSV data
 * @returns {string} Task ID
 */
TimerController.addAutoPlotTask = () => {
    const autoPlotTask = async ({ elapsedTime }) => {
        console.log(`Auto Plot Task executed at ${elapsedTime}ms`);
        
        try {
            // Generate plot from current CSV data
            await TimerController.generatePlotFromCurrentCSV();
            console.log('Auto plot generated successfully');
        } catch (error) {
            console.error('Auto plot task failed:', error);
        }
    };
    
    // Add the plotting task to the timer
    const id = TimerController.addTask ? TimerController.addTask(autoPlotTask) : null;
    console.log('Auto plot task added with ID:', id);
    return id;
};

// Named export for TimerController
export { TimerController };

// Default export
export default {
    getTimer,
    scheduleTask,
    TimerController
};

/**
 * Example usage of the timer system:
 * 
 * // Console-friendly usage:
 * TimerController.start(2000);  // Start with 2 second interval
 * TimerController.addDemoTask(); // Add a demo task
 * TimerController.status();     // Check status
 * TimerController.pause();      // Pause the timer
 * TimerController.resume();     // Resume the timer
 * TimerController.stop();       // Stop and reset
 * 
 * // Start auto plotting every 30 seconds (default)
 * timerController.startAutoPlot();
 * 
 * // Start auto plotting every 1 minute
 * timerController.startAutoPlot(60000);
 * 
 * // Stop auto plotting
 * timerController.stopAutoPlot();
 * 
 * // Add auto plot as a task (if using task-based system)
 * timerController.addAutoPlotTask();
 * 
 * // Check if auto plotting is running
 * console.log('Auto plotting active:', timerController.isAutoPlottingActive());
 */
