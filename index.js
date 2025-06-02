/**
 -------------------------------------------------------------------------------------------------------------------------------
This file provides boilerplate templates for interfacing with the GUI Composer framework.
For further information, see the available options under the Help main menu in the Designer.
-------------------------------------------------------------------------------------------------------------------------------
**/

import { GcUtils } from "./components/@ti/gc-core-assets/lib/GcUtils";
import { GcConsole } from "./components/@ti/gc-core-assets/lib/GcConsole";
import { GcWidget } from "./components/@ti/gc-widget-base/lib/GcWidget";
import { ActionRegistry } from "./components/@ti/gc-widget-menu/lib/ActionRegistry";
import { initializePmVars } from "./frontendJSFiles/pm-variables.js";
import { initAdministration } from "./frontendJSFiles/auth.js";
import {
  startRecording,
  stopRecording,
} from "./frontendJSFiles/csv-handler.js";

// Initialize the application when the DOM is fully loaded

import { initAdminAuth } from "./frontendJSFiles/admin-auth.js";
import { TimerController } from "./frontendJSFiles/timer-handler.js";

let startTime = null;

const console = new GcConsole("myapp"); // creates a console instance with name 'myapp'
GcConsole.setLevel("myapp", 4); // enable console output for myapp console instance
console.info("index.js is loaded...");

let animationId = null;

const init = () => {
  // Add menubar product-name-clicked event listener
  // GcWidget.querySelector('gc-widget-menubar').then(menubar => {
  //     menubar.addEventListener('product-name-clicked', () => window.open('https://dev.ti.com/', 'Dev Zone'));
  // });

  // Get the tide range selector
  initializePmVars(); // Initialize pmVars
  initAdministration();
  // Get the accept button and add click listener
  GcWidget.querySelector("#accept_button").then((acceptButton) => {
    acceptButton.addEventListener("click", () => {
      // Navigate to main_tab when accept is clicked
      GcWidget.querySelector("#main_tab_container").then((tabContainer) => {
        // Get the index of the main_tab
        const mainTabIndex = Array.from(
          tabContainer.querySelectorAll("gc-widget-tab-panel")
        ).findIndex((panel) => panel.id === "main_tab");
        if (mainTabIndex >= 0) {
          tabContainer.index = mainTabIndex;
          // Save the current date and time in localStorage as instance (Kolkata timezone, 24-hour format)
          const now = new Date();

          // Format the date and time in Kolkata timezone using Intl.DateTimeFormat
          const dateOptions = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Use 24-hour format
          };

          // Format the date using Intl API with Kolkata timezone
          const kolkataFormatter = new Intl.DateTimeFormat(
            "en-IN",
            dateOptions
          );
          const formattedParts = kolkataFormatter.formatToParts(now);

          // Extract date parts and construct the formatted string (YYYY-MM-DD HH:MM:SS)
          const dateParts = {};
          formattedParts.forEach((part) => {
            dateParts[part.type] = part.value;
          });

          const formattedDateTime = `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
          localStorage.setItem("instance", formattedDateTime);

          // Start updating water level values after accept button is clicked
          startSineWaveGenerator();
          // Setup the oscilloscope with proper configuration
          setupOscilloscope();


          // Initialize export functions after oscilloscope is set up
          import("./frontendJSFiles/export-functions.js")
            .then((module) => {
              if (typeof module.initializeExportFunctions === "function") {
                //console.log('Initializing export functions...');
                module.initializeExportFunctions();
              }
            })
            .catch((error) => {
              console.error("Failed to initialize export functions:", error);
            });

          // Start listening for changes in water level values
          if (window.pmVars && window.pmVars.addListener) {
            // Update water level values immediately
            updateActualWLSpan();
            updateRequiredWLSpan();
            // Set initial values for quick input and hold for syncing mainoutput with cum_sineinput
            pmVars.quick_input = pmVars.mainoutput;
            pmVars.quick_hold = 1;
            TimerController.pause();
            console.log('timer paused');

            // Add listeners for future changes
            window.pmVars.addListener("mainoutput", updateActualWLSpan);
            window.pmVars.addListener("cum_sineinput", updateRequiredWLSpan);
          } else {
            console.error("pmVars not available for adding listeners");
          }
        }
      });
    });
  });
  GcWidget.querySelector("#button").then((hButton) => {
    if (hButton) {
      hButton.addEventListener("click", () => {
        if (window.pmVars) {
          window.pmVars.hold_status = 1;
          TimerController.pause();
          console.log('timer paused');
          stopRecording()
            .then(() => {
              // Recording stopped successfully
            })
            .catch(() => {
              // Silent handling of errors
            });
        }
      });
    }
  });
  GcWidget.querySelector("#button_1").then((rButton) => {
    if (rButton) {
      rButton.addEventListener("click", () => {
        if (window.pmVars) {
          window.pmVars.hold_status = 0;
          window.pmVars.quick_hold = 0;
          TimerController.resume();
          console.log('timer resumed');
          startRecording(1000)
            .then(() => {
              // Recording started successfully
              console.log("csv writing started successfully");
            })
            .catch(() => {
              // Silent handling of errors
            });
        }
      });
    }
  });
  const quickHoldCheckbox = document.getElementById("quick_hold");
  const container3 = document.getElementById("container3");
  const quickEnterBtn = document.getElementById("quick_enter");
  const quickInputField = document.getElementById("quick_input");

  // Uncheck checkbox and hide container3 initially
  quickHoldCheckbox.checked = false;
  container3.style.display = "none";

  // Toggle visibility of container3 based on checkbox
  quickHoldCheckbox.addEventListener("change", function () {
    container3.style.display = quickHoldCheckbox.checked ? "flex" : "none";
  });

  // On Enter click, set values to pmVars
  quickEnterBtn.addEventListener("click", function () {
    const quick_input = quickInputField.value;

    if (window.pmVars) {
      window.pmVars.quick_input = parseFloat(quick_input);
      window.pmVars.quick_hold = 1;
      TimerController.pause();
      console.log('timer paused');
    }

    //console.log("Quick Input:", quick_input);
    //console.log("pmVars.quick_hold set to 1");
  });
};

function startSineWaveGenerator() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  startTime = performance.now();
  function updateSineValue(timestamp) {
    animationId = requestAnimationFrame(updateSineValue);
  }

  animationId = requestAnimationFrame(updateSineValue);
}
let capValue = 707; //
function setupOscilloscope() {
  let timePeriod = 0;
  if (window.pmVars && window.pmVars.frequency) {
    timePeriod = 1 / window.pmVars.frequency;
    console.log(`Time Period: ${timePeriod.toFixed(2)}s based on frequency: ${window.pmVars.frequency}Hz`);
  }
  console.log(`Time Period: ${timePeriod.toFixed(2)}s`);
  const osc = document.getElementById("oscilloscope");
  const waveInput = document.getElementById("no._of_waves");

  if (!osc) {
    console.error("Oscilloscope element not found");
    return;
  }
  const sampleRate = parseFloat(osc.getAttribute("sample-rate") || 7.09);
  if (waveInput && waveInput.value) {
    const value = parseFloat(waveInput.value);
    if (!isNaN(value)) {
      localStorage.setItem("no_of_waves", value);
    }
    if (!isNaN(value)) {
      capValue = Math.round(value * sampleRate * timePeriod);
    }
    if (!isNaN(value)) {
      TimerController.start(value * timePeriod * 1000);
      console.info(`Timer started for ${value * timePeriod} seconds`);
      TimerController.addAutoPlotTask();  // Add auto plot task
      TimerController.status();  // Check status
    }
  }
  // Calculate the time period from frequency (T = 1/f)
  osc.setAttribute("capacity", 1);
  osc.setAttribute("trigger-mode", "manual");
  osc.setAttribute("trigger-armed", true);
  setTimeout(() => {
    osc.setAttribute("capacity", capValue);
    osc.setAttribute("trigger-mode", "auto");

    // Update horizontal position slider max value to match the capacity
    const hPositionSlider = document.getElementById("h_position");
    if (hPositionSlider) {
      hPositionSlider.setAttribute("max", capValue);
    }
  }, 100);
  if (waveInput) {
    waveInput.addEventListener("input", function () {
      const value = parseFloat(this.value);
      if (isNaN(value)) return;
      capValue = Math.round(value * sampleRate * timePeriod);
      osc.setAttribute("capacity", capValue);
      const hPositionSlider = document.getElementById("h_position");
      if (hPositionSlider) {
        hPositionSlider.setAttribute("max", capValue);
      }
    });
  } else {
    console.warn("Wave input element not found");
  }
}
function updateActualWLSpan() {
  const actualWLValue = document.getElementById("actual_wl_value");
  if (actualWLValue && window.pmVars) {
    let val = window.pmVars.mainoutput;
    if (typeof val === "number") {
      actualWLValue.textContent = val.toFixed(2);
    } else if (!isNaN(parseFloat(val))) {
      actualWLValue.textContent = parseFloat(val).toFixed(2);
    } else {
      actualWLValue.textContent = val ?? "";
    }
  }
}
function updateRequiredWLSpan() {
  const requiredWLValue = document.getElementById("required_wl_value");
  if (requiredWLValue && window.pmVars) {
    let val = window.pmVars.cum_sineinput;
    if (typeof val === "number") {
      requiredWLValue.textContent = val.toFixed(2);
    } else if (!isNaN(parseFloat(val))) {
      requiredWLValue.textContent = parseFloat(val).toFixed(2);
    } else {
      requiredWLValue.textContent = val ?? "";
    }
  }
}
function initWaterLevelDisplays() {
  const actualWLValue = document.getElementById("actual_wl_value");
  const requiredWLValue = document.getElementById("required_wl_value");

  if (actualWLValue) {
    actualWLValue.textContent = "00.00";
  }

  if (requiredWLValue) {
    requiredWLValue.textContent = "00.00";
  }
}
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initWaterLevelDisplays();
  setupTideRangeListener();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initWaterLevelDisplays();
    setupTideRangeListener();
  });
}
function setupTideRangeListener() {
  const tideRangeDropdown = document.getElementById("tide-range");
  if (tideRangeDropdown) {
    const savedTideName = localStorage.getItem("selectedTideName");
    if (savedTideName) {
      setTimeout(() => {
        if (
          Array.from(tideRangeDropdown.options).some(
            (option) => option.value === savedTideName
          )
        ) {
          tideRangeDropdown.value = savedTideName;
          const changeEvent = new Event("change");
          tideRangeDropdown.dispatchEvent(changeEvent);
        }
      }, 500);
    }

    tideRangeDropdown.addEventListener("change", (event) => {
      const selectedTideName = event.target.value;
      if (selectedTideName) {
        const tideSelectedEvent = new CustomEvent("tideSelected", {
          detail: { tideName: selectedTideName },
          bubbles: true,
          cancelable: true,
        });

        tideRangeDropdown.dispatchEvent(tideSelectedEvent);
        localStorage.setItem("selectedTideName", selectedTideName);

        fetch("/api/getAllTides")
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const selectedTide = data.tides.find(
                (tide) => tide.name === selectedTideName
              );
              if (selectedTide) {
                const offsetInput = document.getElementById("input_6");
                if (offsetInput) {
                  offsetInput.value = selectedTide.offset || "";
                }
                if (window.pmVars) {
                  window.pmVars.sineinput = selectedTide.range;
                  updateRequiredWLSpan();
                }
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
  }
}
document.readyState === "complete"
  ? init()
  : document.addEventListener("DOMContentLoaded", init);
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

ActionRegistry.registerAction("cmd_exit", {
  run() {
    GcUtils.isNW ? require("nw.gui").Window.get().close() : window.close();
  },
});
function setupTabPanelObservers() {
  // Target elements
  const runTabPanel = document.getElementById("run");
  const settingsTabPanel = document.getElementById("page_settings");
  const tideManipulationTabPanel = document.getElementById("tide_manipulation"); // Function to run when the 'run' tab panel becomes visible
  function runTabPanelFunction() {
    fetch("/api/getAllTides")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const dropdown = document.getElementById("tide-range");
          if (dropdown) {
            // Clear existing options except the first one (--Choose--)
            while (dropdown.options.length > 1) {
              dropdown.remove(1);
            }

            // Add tide options
            data.tides.forEach((tide) => {
              const option = document.createElement("option");
              option.value = tide.name;
              option.textContent = `${tide.name} (Range: ${tide.range}, Offset: ${tide.offset})`;
              dropdown.appendChild(option);
            });

            // Select previously saved tide from localStorage if available
            const savedTideName = localStorage.getItem("selectedTideName");
            if (savedTideName) {
              // Find and select the saved option if it exists
              const savedOption = Array.from(dropdown.options).find(
                (option) => option.value === savedTideName
              );
              if (savedOption) {
                dropdown.value = savedTideName;

                // Trigger change event to load tide data
                const changeEvent = new Event("change");
                dropdown.dispatchEvent(changeEvent);
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error loading tides for Run tab:", error);
      });
  }

  function settingsTabPanelFunction() { }
  if (runTabPanel) {
    const runObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          const isVisible =
            window.getComputedStyle(runTabPanel).display !== "none" &&
            !runTabPanel.hasAttribute("hidden");

          if (isVisible) {
            runTabPanelFunction();
            // initAdminAuth(); // Initialize admin authentication if needed
          }
        }
      });
    });
    runObserver.observe(runTabPanel, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });
  } else {
    console.warn("Run tab panel element not found");
  }
  if (settingsTabPanel) {
    const settingsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          const isVisible =
            window.getComputedStyle(settingsTabPanel).display !== "none" &&
            !settingsTabPanel.hasAttribute("hidden");

          if (isVisible) {
            settingsTabPanelFunction();
            // initAdminAuth(); // Initialize admin authentication if needed
          }
        }
      });
    });

    // Start observing
    settingsObserver.observe(settingsTabPanel, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });
  } else {
    console.warn("Settings tab panel element not found");
  }
  if (tideManipulationTabPanel) {
    function tideManipulationTabPanelFunction() {
      fetch("/api/getAllTides")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
          }
        })
        .catch((error) => {
          console.error("Error loading tides for manipulation:", error);
        });
      // initAdminAuth();
    }

    const tideManipulationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class" ||
          mutation.attributeName === "hidden"
        ) {
          const isVisible =
            window.getComputedStyle(tideManipulationTabPanel).display !==
            "none" && !tideManipulationTabPanel.hasAttribute("hidden");
          if (isVisible) {
            tideManipulationTabPanelFunction();
          }
        }
      });
    });
    tideManipulationObserver.observe(tideManipulationTabPanel, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });
  } else {
    console.warn("Tide Manipulation tab panel element not found");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  setupTabPanelObservers();
});

// setupTabPanelObservers();

// Add event listener to stop CSV recording when the window is closed
window.addEventListener("beforeunload", () => {
  stopRecording()
    .then(() => {
      // Recording stopped successfully
    })
    .catch(() => {
      // Silent handling of errors
    });
});
