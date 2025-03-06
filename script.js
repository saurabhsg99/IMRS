






document.addEventListener("DOMContentLoaded", () => {




    const applyButtons = document.querySelectorAll(".apply-btn");
    const popupOverlay = document.getElementById("popupOverlay");
    const closeBtn = document.getElementById("closeBtn");
    const applicationForm = document.getElementById("applicationForm");

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const submitBtn = document.getElementById('submitBtn');
    // Open Popup
    applyButtons.forEach(button => {
        button.addEventListener("click", () => popupOverlay.style.display = "flex");
    });

    // Close Popup
    closeBtn.addEventListener("click", () => popupOverlay.style.display = "none");
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") popupOverlay.style.display = "none";
    });

    // Move to Step 2
    nextBtn.addEventListener("click", () => {
        if (validateInputs(step1)) {
            toggleSteps(step1, step2);
        } else {
            showError("❌ Please fill in all required fields.");
        }
    });

    // Move Back to Step 1
    prevBtn.addEventListener("click", () => toggleSteps(step2, step1));

    // Handle Form Submission
    applicationForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (submitBtn.disabled) return; // Prevent multiple submissions
    
        submitBtn.disabled = true; // Disable button immediately
        submitBtn.style.opacity = "0.6"; // Optional: Indicate it's disabled
    
        const formData = new FormData(this);
        const proofUpload = document.querySelector("input[name='proofUpload']");

        if (!proofUpload.files.length) {
            showError("❌ Please upload a payment proof.");
            submitBtn.disabled = false; // Re-enable the submit button if validation fails
            submitBtn.style.opacity = "1";
            return;
        }

        try {
            const response = await fetch("http://localhost:5500/submit-form", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Submission failed");

            alert("✅ " + data.message);
            applicationForm.reset();
            popupOverlay.style.display = "none";
        } catch (error) {
            console.error("❌ Submission Error:", error);
            alert("❌ Error submitting application. Please try again.");
        }finally {
            submitBtn.disabled = false; // Re-enable the button after submission completes
            submitBtn.style.opacity = "1";
        }
    });

    // PDF Viewer
    document.querySelectorAll(".view-pdf-btn").forEach(button => {
        button.addEventListener("click", () => {
            window.open(button.getAttribute("data-pdf"), "_blank");
        });
    });
    
    // Helper Functions
    function validateInputs(container) {
        let isValid = true;
        container.querySelectorAll("input").forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = "red";
                isValid = false;
            } else {
                input.style.borderColor = "#00b4d8";
            }
        });
        return isValid;
    }

    function toggleSteps(hideStep, showStep) {
        hideStep.style.display = "none";
        showStep.style.display = "block";
    }

    function showError(message) {
        alert(message);
    }














    // cursor
    const cursor = document.getElementById("cursor");

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        cursor.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
        cursor.style.opacity = "0";
    });

    // function animateCursor() {
    //     cursorX += (targetX - cursorX) * 0.1;
    //     cursorY += (targetY - cursorY) * 0.1;
    //     cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    //     requestAnimationFrame(animateCursor);
    // }

    // animateCursor();
});
