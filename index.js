/**
 -------------------------------------------------------------------------------------------------------------------------------
This file provides boilerplate templates for interfacing with the GUI Composer framework.
For further information, see the available options under the Help main menu in the Designer.
-------------------------------------------------------------------------------------------------------------------------------
**/

// ===============================================
// CORE IMPORTS - Essential framework components
// ===============================================
import { GcUtils } from "./components/@ti/gc-core-assets/lib/GcUtils"; // Core utility functions for GUI Composer
import { GcConsole } from "./components/@ti/gc-core-assets/lib/GcConsole"; // Console logging system for debugging
import { GcWidget } from "./components/@ti/gc-widget-base/lib/GcWidget"; // Base widget functionality for UI components
import { ActionRegistry } from "./components/@ti/gc-widget-menu/lib/ActionRegistry"; // Register and manage UI actions
import { quickstart } from "./frontendJSFiles/quick_start.js";
// ===============================================
// APPLICATION-SPECIFIC IMPORTS - Custom modules
// ===============================================
import { initializePmVars } from "./frontendJSFiles/pm-variables.js"; // Initialize process measurement variables
import { initAdministration } from "./frontendJSFiles/auth.js"; // Initialize user authentication system
import {
  startRecording,
  stopRecording,
} from "./frontendJSFiles/csv-handler.js"; // Handle CSV data recording functionality
import { initAdminAuth } from "./frontendJSFiles/admin-auth.js"; // Initialize admin-level authentication
import { TimerController } from "./frontendJSFiles/timer-handler.js"; // Control timing operations for oscilloscope

// ===============================================
// GLOBAL VARIABLES - Application state management
// ===============================================
let startTime = null; // Track when sine wave generation started
let animationId = null; // Store animation frame ID for cancellation

// ===============================================
// CONSOLE INITIALIZATION - Setup debugging output
// ===============================================
const console = new GcConsole("myapp"); // Create dedicated console instance for this application
GcConsole.setLevel("myapp", 4); // Set logging level (4 = all messages including debug)
//console.info("index.js is loaded..."); // Log successful initialization

// ===============================================
// MAIN INITIALIZATION FUNCTION
// ===============================================
const init = () => {
  // Note: Commented out menubar product-name-clicked event listener
  // This would open TI Dev Zone when product name is clicked
  // GcWidget.querySelector('gc-widget-menubar').then(menubar => {
  //     menubar.addEventListener('product-name-clicked', () => window.open('https://dev.ti.com/', 'Dev Zone'));
  // });

  // ===============================================
  // SYSTEM INITIALIZATION - Core modules startup
  // ===============================================
  initializePmVars(); // Initialize process measurement variables and data binding
  initAdministration(); // Setup user authentication and authorization system
  
  // ===============================================
  // ACCEPT BUTTON EVENT HANDLER - Main application entry point
  // ===============================================
  GcWidget.querySelector("#accept_button").then((acceptButton) => {
    acceptButton.addEventListener("click", () => {
      //console.info("Accept button clicked - transitioning to main application");
      
      // ===============================================
      // TAB NAVIGATION - Switch to main application tab
      // ===============================================
      GcWidget.querySelector("#main_tab_container").then((tabContainer) => {
        // Find the index of the main_tab panel within the tab container
        const mainTabIndex = Array.from(
          tabContainer.querySelectorAll("gc-widget-tab-panel")
        ).findIndex((panel) => panel.id === "main_tab");
        
        if (mainTabIndex >= 0) {
          // Switch to the main tab programmatically
          tabContainer.index = mainTabIndex;
          
          // ===============================================
          // TIMESTAMP GENERATION - Create session instance timestamp
          // ===============================================
          // Get current date and time for session tracking
          const now = new Date();

          // Configure date formatting options for Kolkata timezone (IST)
          const dateOptions = {
            timeZone: "Asia/Kolkata", // Use Indian Standard Time
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Use 24-hour format for consistency
          };

          // Create formatter instance for Kolkata timezone
          const kolkataFormatter = new Intl.DateTimeFormat(
            "en-IN", // Indian locale
            dateOptions
          );
          
          // Parse the formatted date into individual components
          const formattedParts = kolkataFormatter.formatToParts(now);

          // Extract date parts and construct the formatted string (YYYY-MM-DD HH:MM:SS)
          const dateParts = {};
          formattedParts.forEach((part) => {
            dateParts[part.type] = part.value;
          });

          // Construct formatted timestamp string in YYYY-MM-DD HH:MM:SS format
          const formattedDateTime = `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
          
          // Store session instance timestamp in localStorage for tracking
          localStorage.setItem("instance", formattedDateTime);
          //console.info(`Session instance timestamp saved: ${formattedDateTime}`);

          // ===============================================
          // CORE COMPONENT INITIALIZATION - Start main application functions
          // ===============================================
          // Start the sine wave generator for water level simulation
          startSineWaveGenerator();
          
          // Configure and initialize the oscilloscope display
          setupOscilloscope();

          // ===============================================
          // DYNAMIC MODULE LOADING - Load export functionality
          // ===============================================
          // Dynamically import export functions after oscilloscope is ready
          import("./frontendJSFiles/export-functions.js")
            .then((module) => {
              // Check if the export function initialization method exists
              if (typeof module.initializeExportFunctions === "function") {
                // Initialize data export capabilities (CSV, plots, etc.)
                module.initializeExportFunctions();
                //console.info("Export functions initialized successfully");
              }
            })
            .catch((error) => {
              console.error("Failed to initialize export functions:", error);
            });

          // ===============================================
          // WATER LEVEL MONITORING SETUP - Real-time data display
          // ===============================================
          // Check if process measurement variables are available
          if (window.pmVars && window.pmVars.addListener) {
            // Update water level display elements with current values
            updateActualWLSpan(); // Show current actual water level
            updateRequiredWLSpan(); // Show target/required water level
            
            // ===============================================
            // INITIAL STATE CONFIGURATION - Set default values
            // ===============================================
            // Sync quick input with current main output value
            pmVars.quick_input = pmVars.mainoutput;
            pmVars.quick_hold = 1; // Enable hold mode initially
          const quickStartCheckbox = document.getElementById("quick_start");
          quickStartCheckbox.checked = true;
            quickstart(); // Call quickstart function to handle initial state
            // Pause timer controller to start in controlled state
            TimerController.pause();
            // console.log('Timer paused - application in initial hold state');
            
            // ===============================================
            // EVENT LISTENERS REGISTRATION - Real-time data updates
            // ===============================================
            // Register listeners for real-time water level updates
            window.pmVars.addListener("mainoutput", updateActualWLSpan); // Listen for actual water level changes
            window.pmVars.addListener("cum_sineinput", updateRequiredWLSpan); // Listen for required water level changes
          } else {
            console.error("pmVars not available for adding listeners - data binding failed");
          }
        }
      });
    });
  });
  
  // ===============================================
  // HOLD BUTTON EVENT HANDLER - Pause/Stop functionality
  // ===============================================
  GcWidget.querySelector("#button").then((hButton) => {
    if (hButton) {
      hButton.addEventListener("click", () => {
        //console.info("Hold button clicked - pausing system operations");
        
        if (window.pmVars) {
          // Set system to hold state
          window.pmVars.hold_status = 1; // Enable hold mode
          const quickStartCheckbox = document.getElementById("quick_start");
          quickStartCheckbox.checked = false;
          // Pause timer operations
          TimerController.pause();
          // console.log('Timer paused via hold button');
          
          // Stop CSV data recording
          stopRecording()
            .then(() => {
              // Recording stopped successfully - silent success handling
              //console.info("CSV recording stopped successfully");
            })
            .catch(() => {
              // Silent handling of recording stop errors
              console.warn("Error stopping CSV recording (handled silently)");
            });
        }
      });
    }
  });
  
  // ===============================================
  // RESUME BUTTON EVENT HANDLER - Resume/Start functionality
  // ===============================================
  GcWidget.querySelector("#button_1").then((rButton) => {
    if (rButton) {
      rButton.addEventListener("click", () => {
        //console.info("Resume button clicked - starting system operations");
        
        if (window.pmVars) {
          // Release system from hold state
          window.pmVars.hold_status = 0; // Disable hold mode
          window.pmVars.quick_hold = 0; // Disable quick hold mode
          
          // Resume timer operations
          TimerController.resume();
          // console.log('Timer resumed via resume button');
          
          // Start CSV data recording with 1 second interval
          startRecording(1000)
            .then(() => {
              // Recording started successfully
              // console.log("CSV writing started successfully");
            })
            .catch(() => {
              // Silent handling of recording start errors
              console.warn("Error starting CSV recording (handled silently)");
            });
        }
      });
    }
  });
  
  // ===============================================
  // QUICK INPUT CONTROLS - Manual water level override
  // ===============================================
  // Get references to quick input UI elements
  const quickHoldCheckbox = document.getElementById("quick_hold");
  const container3 = document.getElementById("container3"); // Quick input container
  const quickEnterBtn = document.getElementById("quick_enter");
  const quickInputField = document.getElementById("quick_input");

  // ===============================================
  // QUICK INPUT INITIALIZATION - Set default UI state
  // ===============================================
  // Initialize quick input controls to hidden/unchecked state
  quickHoldCheckbox.checked = false;
  container3.style.opacity = "0"; // Hide quick input container initially

  // ===============================================
  // QUICK INPUT VISIBILITY TOGGLE - Show/hide manual input controls
  // ===============================================
  // Toggle visibility of quick input container based on checkbox state
  quickHoldCheckbox.addEventListener("change", function () {
    container3.style.opacity = quickHoldCheckbox.checked ? 1 : 0;
    //console.info(`Quick input controls ${quickHoldCheckbox.checked ? 'shown' : 'hidden'}`);
  });

  // ===============================================
  // QUICK INPUT SUBMISSION - Manual water level override
  // ===============================================
  // Handle manual water level input submission
  quickEnterBtn.addEventListener("click", function () {
    const quick_input = quickInputField.value;
    //console.info(`Quick input submitted: ${quick_input}`);

    if (window.pmVars) {
      // Set the manual input value and enable hold mode
      window.pmVars.quick_input = parseFloat(quick_input);
      window.pmVars.quick_hold = 1; // Enable quick hold mode
      const quickStartCheckbox = document.getElementById("quick_start");
      quickStartCheckbox.checked = false; // Ensure quick start is enabled
      // Pause timer to maintain manual override
      TimerController.pause();
      // console.log('Timer paused - quick input mode activated');
    }

    // Debug logging (commented out for production)
    //console.log("Quick Input:", quick_input);
    //console.log("pmVars.quick_hold set to 1");
  });
};

// ===============================================
// SINE WAVE GENERATOR - Water level simulation
// ===============================================
/**
 * Starts the sine wave generator for simulating water level changes
 * Uses requestAnimationFrame for smooth animation updates
 */
function startSineWaveGenerator() {
  // Cancel any existing animation to prevent multiple instances
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Record start time for wave calculations
  startTime = performance.now();
  
  // Animation loop function for updating sine wave values
  function updateSineValue(timestamp) {
    // Schedule next frame update
    animationId = requestAnimationFrame(updateSineValue);
  }

  // Start the animation loop
  animationId = requestAnimationFrame(updateSineValue);
  //console.info("Sine wave generator started");
}

// ===============================================
// OSCILLOSCOPE CONFIGURATION - Display setup
// ===============================================
let capValue = 707; // Default oscilloscope capacity value

/**
 * Configures and initializes the oscilloscope display component
 * Sets up timing, capacity, and trigger modes based on frequency settings
 */
function setupOscilloscope() {
  let timePeriod = 0; // Time period calculated from frequency
  
  // ===============================================
  // FREQUENCY CALCULATION - Determine time period from frequency
  // ===============================================
  if (window.pmVars && window.pmVars.frequency) {
    // Calculate time period using T = 1/f formula
    timePeriod = 1 / window.pmVars.frequency;
    // console.log(`Time Period: ${timePeriod.toFixed(2)}s based on frequency: ${window.pmVars.frequency}Hz`);
  }
  // console.log(`Time Period: ${timePeriod.toFixed(2)}s`);
  
  // ===============================================
  // DOM ELEMENT RETRIEVAL - Get oscilloscope and input elements
  // ===============================================
  const osc = document.getElementById("oscilloscope"); // Main oscilloscope display element
  const waveInput = document.getElementById("no._of_waves"); // Number of waves input field

  // Validate oscilloscope element exists
  if (!osc) {
    console.error("Oscilloscope element not found - cannot proceed with setup");
    return;
  }
  
  // ===============================================
  // SAMPLE RATE CONFIGURATION - Get oscilloscope sampling parameters
  // ===============================================
  // Get sample rate from oscilloscope attributes (default: 7.09)
  const sampleRate = parseFloat(osc.getAttribute("sample-rate") || 7.09);
  //console.info(`Oscilloscope sample rate: ${sampleRate}`);
  
  // ===============================================
  // WAVE COUNT PROCESSING - Calculate capacity and timer settings
  // ===============================================
  if (waveInput && waveInput.value) {
    const value = parseFloat(waveInput.value);
    
    // Store wave count in localStorage for persistence
    if (!isNaN(value)) {
      localStorage.setItem("no_of_waves", value);
      //console.info(`Wave count saved to localStorage: ${value}`);
    }
    
    // Calculate oscilloscope capacity based on waves, sample rate, and time period
    if (!isNaN(value)) {
      capValue = Math.round(value * sampleRate * timePeriod);
      //console.info(`Calculated oscilloscope capacity: ${capValue}`);
    }
    
    // Start timer controller with calculated duration
    if (!isNaN(value)) {
      const durationMs = value * timePeriod * 1000; // Convert to milliseconds
      TimerController.start(durationMs);
      //console.info(`Timer started for ${value * timePeriod} seconds (${durationMs}ms)`);
      
      // Add automatic plotting task and check status
      TimerController.addAutoPlotTask();  // Schedule auto plot generation
      TimerController.status();  // Log current timer status
    }
  }
  
  // ===============================================
  // OSCILLOSCOPE INITIAL CONFIGURATION - Set basic attributes
  // ===============================================
  // Set initial capacity to 1 for proper initialization
  osc.setAttribute("capacity", 1);
  osc.setAttribute("trigger-mode", "manual"); // Start with manual trigger mode
  osc.setAttribute("trigger-armed", true); // Arm the trigger for data capture
  
  // ===============================================
  // DEFERRED CONFIGURATION - Apply final settings after initialization
  // ===============================================
  // Use setTimeout to allow initial setup to complete before applying final settings
  setTimeout(() => {
    // Apply calculated capacity value
    osc.setAttribute("capacity", capValue);
    //console.info(`Oscilloscope capacity set to: ${capValue}`);
    
    // Switch to automatic trigger mode for continuous operation
    osc.setAttribute("trigger-mode", "auto");
    //console.info("Oscilloscope switched to auto trigger mode");

    // ===============================================
    // HORIZONTAL POSITION SLIDER SYNC - Update UI controls
    // ===============================================
    // Update horizontal position slider max value to match oscilloscope capacity
    const hPositionSlider = document.getElementById("h_position");
    if (hPositionSlider) {
      hPositionSlider.setAttribute("max", capValue);
      //console.info(`Horizontal position slider max set to: ${capValue}`);
    }
  }, 100); // 100ms delay to ensure proper initialization order
  
  // ===============================================
  // DYNAMIC WAVE INPUT HANDLER - Real-time capacity updates
  // ===============================================
  if (waveInput) {
    // Add event listener for real-time wave count changes
    waveInput.addEventListener("input", function () {
      const value = parseFloat(this.value);
      
      // Validate input value
      if (isNaN(value)) {
        console.warn("Invalid wave input value");
        return;
      }
      
      // Recalculate capacity based on new wave count
      capValue = Math.round(value * sampleRate * timePeriod);
      //console.info(`Wave input changed: ${value} waves, new capacity: ${capValue}`);
      
      // Update oscilloscope capacity immediately
      osc.setAttribute("capacity", capValue);
      
      // Sync horizontal position slider with new capacity
      const hPositionSlider = document.getElementById("h_position");
      if (hPositionSlider) {
        hPositionSlider.setAttribute("max", capValue);
        //console.info(`Horizontal slider updated for new capacity: ${capValue}`);
      }
    });
  } else {
    console.warn("Wave input element not found - dynamic updates disabled");
  }
}

// ===============================================
// WATER LEVEL DISPLAY FUNCTIONS - UI Updates
// ===============================================

/**
 * Updates the actual water level display element
 * Formats and displays the current mainoutput value
 */
function updateActualWLSpan() {
  const actualWLValue = document.getElementById("actual_wl_value");
  
  if (actualWLValue && window.pmVars) {
    let val = window.pmVars.mainoutput; // Get current actual water level
    
    // Format value based on type and display with 2 decimal places
    if (typeof val === "number") {
      actualWLValue.textContent = val.toFixed(2);
    } else if (!isNaN(parseFloat(val))) {
      actualWLValue.textContent = parseFloat(val).toFixed(2);
    } else {
      // Handle non-numeric values gracefully
      actualWLValue.textContent = val ?? "";
    }
  }
}

/**
 * Updates the required water level display element
 * Formats and displays the target cum_sineinput value
 */
function updateRequiredWLSpan() {
  const requiredWLValue = document.getElementById("required_wl_value");
  
  if (requiredWLValue && window.pmVars) {
    let val = window.pmVars.cum_sineinput; // Get target/required water level
    
    // Format value based on type and display with 2 decimal places
    if (typeof val === "number") {
      requiredWLValue.textContent = val.toFixed(2);
    } else if (!isNaN(parseFloat(val))) {
      requiredWLValue.textContent = parseFloat(val).toFixed(2);
    } else {
      // Handle non-numeric values gracefully
      requiredWLValue.textContent = val ?? "";
    }
  }
}

/**
 * Initializes water level display elements with default values
 * Sets both actual and required water level displays to "00.00"
 */
function initWaterLevelDisplays() {
  const actualWLValue = document.getElementById("actual_wl_value");
  const requiredWLValue = document.getElementById("required_wl_value");

  // Set default display values
  if (actualWLValue) {
    actualWLValue.textContent = "00.00";
    //console.info("Actual water level display initialized");
  }

  if (requiredWLValue) {
    requiredWLValue.textContent = "00.00";
    //console.info("Required water level display initialized");
  }
}

// ===============================================
// DOM READY STATE HANDLING - Early initialization
// ===============================================
// Check if DOM is already loaded and initialize immediately, or wait for DOMContentLoaded
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  // DOM is already ready, initialize immediately
  initWaterLevelDisplays();
  setupTideRangeListener();
} else {
  // DOM not ready yet, wait for DOMContentLoaded event
  document.addEventListener("DOMContentLoaded", () => {
    initWaterLevelDisplays();
    setupTideRangeListener();
  });
}

// ===============================================
// TIDE RANGE SELECTOR SETUP - Dropdown management
// ===============================================
/**
 * Sets up the tide range dropdown selector with persistence and event handling
 * Handles loading saved selections and processing new selections
 */
function setupTideRangeListener() {
  const tideRangeDropdown = document.getElementById("tide-range");
  
  if (tideRangeDropdown) {
    //console.info("Setting up tide range dropdown listener");
    
    // ===============================================
    // SAVED SELECTION RESTORATION - Load previous choice
    // ===============================================
    const savedTideName = localStorage.getItem("selectedTideName");
    if (savedTideName) {
      //console.info(`Restoring saved tide selection: ${savedTideName}`);
      
      // Use setTimeout to ensure dropdown options are loaded
      setTimeout(() => {
        // Check if saved option exists in current dropdown
        if (
          Array.from(tideRangeDropdown.options).some(
            (option) => option.value === savedTideName
          )
        ) {
          // Restore the saved selection
          tideRangeDropdown.value = savedTideName;
          
          // Trigger change event to load associated data
          const changeEvent = new Event("change");
          tideRangeDropdown.dispatchEvent(changeEvent);
          //console.info(`Saved tide selection restored and triggered: ${savedTideName}`);
        }
      }, 500); // 500ms delay to ensure dropdown is populated
    }

    // ===============================================
    // TIDE SELECTION CHANGE HANDLER - Process new selections
    // ===============================================
    tideRangeDropdown.addEventListener("change", (event) => {
      const selectedTideName = event.target.value;
      //console.info(`Tide selection changed to: ${selectedTideName}`);
      
      if (selectedTideName) {
        // ===============================================
        // CUSTOM EVENT DISPATCH - Notify other components
        // ===============================================
        const tideSelectedEvent = new CustomEvent("tideSelected", {
          detail: { tideName: selectedTideName },
          bubbles: true,
          cancelable: true,
        });

        // Dispatch custom event for other components to listen
        tideRangeDropdown.dispatchEvent(tideSelectedEvent);
        
        // Save selection to localStorage for persistence
        localStorage.setItem("selectedTideName", selectedTideName);
        //console.info(`Tide selection saved to localStorage: ${selectedTideName}`);

        // ===============================================
        // TIDE DATA RETRIEVAL - Fetch tide details from API
        // ===============================================
        fetch("/api/getAllTides")
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //console.info("Tide data retrieved successfully");
              
              // Find the selected tide in the response data
              const selectedTide = data.tides.find(
                (tide) => tide.name === selectedTideName
              );
              
              if (selectedTide) {
                //console.info(`Selected tide details:`, selectedTide);
                
                // ===============================================
                // UI UPDATES - Populate offset input field
                // ===============================================
                const offsetInput = document.getElementById("input_6");
                if (offsetInput) {
                  offsetInput.value = selectedTide.offset || "";
                  //console.info(`Offset input updated: ${selectedTide.offset}`);
                }
                
                // ===============================================
                // PROCESS VARIABLES UPDATE - Set sine input range
                // ===============================================
                if (window.pmVars) {
                  window.pmVars.sineinput = selectedTide.range;
                  //console.info(`Sine input range set to: ${selectedTide.range}`);
                  
                  // Update the required water level display
                  updateRequiredWLSpan();
                }
              } else {
                console.warn(`Selected tide '${selectedTideName}' not found in API response`);
              }
            } else {
              console.error("Failed to get tide details:", data.message);
            }
          })
          .catch((error) => {
            console.error("Error fetching tide details:", error);
          });
      }
    });
  } else {
    console.warn("Tide range dropdown element not found");
  }
}

// ===============================================
// APPLICATION INITIALIZATION TRIGGER - Start main application
// ===============================================
// Initialize the application based on DOM ready state
document.readyState === "complete"
  ? init() // DOM already ready, start immediately
  : document.addEventListener("DOMContentLoaded", init); // Wait for DOM ready event

// Note: Authentication code has been moved to auth.js module

// ===============================================
// DATA BINDING FRAMEWORK DOCUMENTATION
// ===============================================
/**
 -------------------------------------------------------------------------------------------------------------------------------
Boilerplate code for databinding

Add custom computed value databindings here, using the following method:

syntax: bindingRegistry.bind(targetBinding, sourceBinding, [getter], [setter]);
    param targetBinding - single binding string or expression, or array of binding strings for multi-way binding.
    param sourceBinding - single binding string or expression, or array of binding strings for multi-way binding.
    param getter - (optional) - custom getter function for computing the targetBinding value(s) based on sourceBinding value(s).
    param setter - (optional) - custom setter function for computing the sourceBinding value(s) based on targetBinding value(s).

Example usage:
  (async () => {
      await bindingRegistry.waitForModelReady('widget');        // widget model, a built-in model
      await bindingRegistry.waitForModelReady('targetModelId'); // target model, gc-model-program, gc-model-streaming, etc...
      bindingRegistry.bind('widget.inputWidgetId.value', 'model.targetModelId.targetVariable');
      bindingRegistry.bind('widget.labelWidgetId.label', 'widget.inputWidgetId.value');
   })();
-------------------------------------------------------------------------------------------------------------------------------
**/

// Note: PM variables are handled by pm-variables.js module

// ===============================================
// ACTION REGISTRY - Application exit command
// ===============================================
// Register exit command for application closure
ActionRegistry.registerAction("cmd_exit", {
  run() {
    // Check if running in NW.js environment or browser and close accordingly
    GcUtils.isNW ? require("nw.gui").Window.get().close() : window.close();
    //console.info("Application exit command executed");
  },
});

// ===============================================
// TAB PANEL OBSERVERS - Monitor tab visibility changes
// ===============================================
/**
 * Sets up observers to monitor tab panel visibility changes
 * Executes specific functions when tabs become visible
 */
function setupTabPanelObservers() {
  // ===============================================
  // TAB PANEL ELEMENT REFERENCES - Get target tab panels
  // ===============================================
  const runTabPanel = document.getElementById("run"); // Main run/operation tab
  const settingsTabPanel = document.getElementById("page_settings"); // Settings configuration tab
  const tideManipulationTabPanel = document.getElementById("tide_manipulation"); // Tide management tab
  
  // ===============================================
  // RUN TAB FUNCTION - Executed when run tab becomes visible
  // ===============================================
  /**
   * Function to execute when the 'run' tab panel becomes visible
   * Loads tide data and populates the dropdown
   */
  function runTabPanelFunction() {
    //console.info("Run tab panel became visible - loading tide data");
    
    // Fetch all available tides from the API
    fetch("/api/getAllTides")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //console.info(`Loaded ${data.tides.length} tides for run tab`);
          
          const dropdown = document.getElementById("tide-range");
          if (dropdown) {
            // ===============================================
            // DROPDOWN CLEANUP - Remove existing options
            // ===============================================
            // Clear existing options except the first one (--Choose--)
            while (dropdown.options.length > 1) {
              dropdown.remove(1);
            }

            // ===============================================
            // DROPDOWN POPULATION - Add tide options
            // ===============================================
            // Add tide options to dropdown
            data.tides.forEach((tide) => {
              const option = document.createElement("option");
              option.value = tide.name;
              option.textContent = `${tide.name} (Range: ${tide.range}, Offset: ${tide.offset})`;
              dropdown.appendChild(option);
            });

            // ===============================================
            // SAVED SELECTION RESTORATION - Restore previous choice
            // ===============================================
            // Select previously saved tide from localStorage if available
            const savedTideName = localStorage.getItem("selectedTideName");
            if (savedTideName) {
              //console.info(`Restoring saved tide selection in run tab: ${savedTideName}`);
              
              // Find and select the saved option if it exists
              const savedOption = Array.from(dropdown.options).find(
                (option) => option.value === savedTideName
              );
              if (savedOption) {
                dropdown.value = savedTideName;

                // Trigger change event to load tide data
                const changeEvent = new Event("change");
                dropdown.dispatchEvent(changeEvent);
                //console.info(`Saved tide selection restored and triggered in run tab`);
              }
            }
          }
        } else {
          console.error("Failed to load tides for run tab:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error loading tides for Run tab:", error);
      });
  }

  // ===============================================
  // SETTINGS TAB FUNCTION - Executed when settings tab becomes visible
  // ===============================================
  /**
   * Function to execute when the 'settings' tab panel becomes visible
   * Currently empty - placeholder for future settings functionality
   */
  function settingsTabPanelFunction() {
    //console.info("Settings tab panel became visible");
    // TODO: Add settings tab specific functionality here
  }
  
  // ===============================================
  // RUN TAB OBSERVER SETUP - Monitor run tab visibility
  // ===============================================
  if (runTabPanel) {
    //console.info("Setting up run tab panel observer");
    
    // Create mutation observer to watch for visibility changes
    const runObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if style, class, or hidden attributes changed (affects visibility)
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          // Determine if the tab panel is currently visible
          const isVisible =
            window.getComputedStyle(runTabPanel).display !== "none" &&
            !runTabPanel.hasAttribute("hidden");

          if (isVisible) {
            //console.info("Run tab panel became visible - executing tab function");
            runTabPanelFunction(); // Execute run tab specific functionality
            // Note: initAdminAuth() could be called here if admin authentication is needed
          }
        }
      });
    });
    
    // Start observing the run tab panel for attribute changes
    runObserver.observe(runTabPanel, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ["style", "class", "hidden"], // Only watch specific attributes
    });
  } else {
    console.warn("Run tab panel element not found");
  }
  
  // ===============================================
  // SETTINGS TAB OBSERVER SETUP - Monitor settings tab visibility
  // ===============================================
  if (settingsTabPanel) {
    //console.info("Setting up settings tab panel observer");
    
    // Create mutation observer for settings tab visibility changes
    const settingsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if style, class, or hidden attributes changed (affects visibility)
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          // Determine if the settings tab panel is currently visible
          const isVisible =
            window.getComputedStyle(settingsTabPanel).display !== "none" &&
            !settingsTabPanel.hasAttribute("hidden");

          if (isVisible) {
            //console.info("Settings tab panel became visible - executing tab function");
            settingsTabPanelFunction(); // Execute settings tab specific functionality
            // Note: initAdminAuth() could be called here if admin authentication is needed
          }
        }
      });
    });

    // Start observing the settings tab panel for attribute changes
    settingsObserver.observe(settingsTabPanel, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ["style", "class", "hidden"], // Only watch specific attributes
    });
  } else {
    console.warn("Settings tab panel element not found");
  }
  
  // ===============================================
  // TIDE MANIPULATION TAB OBSERVER SETUP - Monitor tide management tab visibility
  // ===============================================
  if (tideManipulationTabPanel) {
    //console.info("Setting up tide manipulation tab panel observer");
    
    /**
     * Function to execute when the 'tide manipulation' tab panel becomes visible
     * Loads tide data for management operations
     */
    function tideManipulationTabPanelFunction() {
      //console.info("Tide manipulation tab panel became visible - loading tide data");
      
      // Fetch all available tides for manipulation
      fetch("/api/getAllTides")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            //console.info(`Loaded ${data.tides.length} tides for manipulation tab`);
            // TODO: Implement tide manipulation specific UI updates here
          } else {
            console.error("Failed to load tides for manipulation tab:", data.message);
          }
        })
        .catch((error) => {
          console.error("Error loading tides for manipulation:", error);
        });
      // Note: initAdminAuth() could be called here if admin authentication is needed
    }

    // Create mutation observer for tide manipulation tab visibility changes
    const tideManipulationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if style, class, or hidden attributes changed (affects visibility)
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          // Determine if the tide manipulation tab panel is currently visible
          const isVisible =
            window.getComputedStyle(tideManipulationTabPanel).display !==
            "none" && !tideManipulationTabPanel.hasAttribute("hidden");
            
          if (isVisible) {
            //console.info("Tide manipulation tab panel became visible - executing tab function");
            tideManipulationTabPanelFunction(); // Execute tide manipulation specific functionality
          }
        }
      });
    });
    
    // Start observing the tide manipulation tab panel for attribute changes
    tideManipulationObserver.observe(tideManipulationTabPanel, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ["style", "class", "hidden"], // Only watch specific attributes
    });
  } else {
    console.warn("Tide Manipulation tab panel element not found");
  }
}

// ===============================================
// TAB PANEL OBSERVERS INITIALIZATION - Setup on DOM ready
// ===============================================
// Initialize tab panel observers when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  //console.info("DOM loaded - setting up tab panel observers");
  setupTabPanelObservers();
});

// Note: Alternative direct call (commented out)
// setupTabPanelObservers();

// ===============================================
// WINDOW CLEANUP - Handle application closure
// ===============================================
// Add event listener to stop CSV recording when the window is closed
window.addEventListener("beforeunload", () => {
  //console.info("Window closing - stopping CSV recording");
  
  // Ensure CSV recording is stopped before window closes
  stopRecording()
    .then(() => {
      // Recording stopped successfully - silent success handling
      //console.info("CSV recording stopped successfully on window close");
    })
    .catch(() => {
      // Silent handling of recording stop errors
      console.warn("Error stopping CSV recording on window close (handled silently)");
    });
});
