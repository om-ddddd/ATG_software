export function quickstart() {
    console.info("Quick start function initialized - setting up convergence monitoring");
    
    // Global interval ID for cleanup
    let convergenceIntervalId = null;
    
    // ===============================================
    // CONVERGENCE MONITORING - Automatic hold release
    // ===============================================
    function startConvergenceMonitoring() {
        // Clear any existing interval
        if (convergenceIntervalId) {
            clearInterval(convergenceIntervalId);
        }
        
        // Start monitoring for convergence every 100ms (more responsive)
        convergenceIntervalId = setInterval(() => {
            if (window.pmVars) {
                // Calculate absolute difference between actual and required values
                const difference = Math.abs(window.pmVars.mainoutput - window.pmVars.cum_sineinput);
                
                // Check if values have converged (within 0.01 tolerance)
                if (difference < 0.5) {
                    console.info(`Values converged! Difference: ${difference.toFixed(6)} - Releasing hold state`);
                    
                    // ===============================================
                    // AUTOMATIC RESUME - Release hold state
                    // ===============================================
                    window.pmVars.hold_status = 0;  // Release main hold
                    window.pmVars.quick_hold = 0;   // Release quick hold
                    
                    // Resume timer operations
                    if (window.TimerController) {
                        window.TimerController.resume();
                        console.info('Timer automatically resumed due to convergence');
                    }
                    
                    // Stop monitoring once convergence is achieved
                    clearInterval(convergenceIntervalId);
                    convergenceIntervalId = null;
                    console.info("Convergence monitoring stopped - hold state released");
                }
            }
        }, 100); // Check every 100ms for responsive convergence detection
        
        console.info("Convergence monitoring started - checking every 100ms");
    }
    
    // ===============================================
    // AUTO-START MONITORING - Begin immediately
    // ===============================================
    const quickStartCheckbox = document.getElementById("quick_start");
    if (quickStartCheckbox && quickStartCheckbox.checked) {
        console.info("Quick start enabled - auto-starting convergence monitoring");
        startConvergenceMonitoring();
    }
    
    // ===============================================
    // CHECKBOX EVENT HANDLER - Manual control
    // ===============================================
    if (quickStartCheckbox) {
        quickStartCheckbox.addEventListener("change", function () {
            if (quickStartCheckbox.checked) {
                console.info("Quick start checkbox enabled - starting convergence monitoring");
                startConvergenceMonitoring();
            } else {
                console.info("Quick start checkbox disabled - stopping convergence monitoring");
                if (convergenceIntervalId) {
                    clearInterval(convergenceIntervalId);
                    convergenceIntervalId = null;
                }
            }
        });
    }
    
    // ===============================================
    // CLEANUP ON WINDOW UNLOAD - Prevent memory leaks
    // ===============================================
    window.addEventListener("beforeunload", () => {
        if (convergenceIntervalId) {
            clearInterval(convergenceIntervalId);
            console.info("Quick start monitoring cleaned up on window close");
        }
    });
}

// ===============================================
// MAKE FUNCTION GLOBALLY AVAILABLE
// ===============================================
window.quickstart = quickstart;