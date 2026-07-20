/* ==========================================================================
   ALGORITMUX INTERACTION ENGINE - JAVASCRIPT
   Scroll animations, diagnostic modal flow, statistics counter
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ---------------------------------------------------------
    // 1. Header scroll effect
    // ---------------------------------------------------------
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }

    // ---------------------------------------------------------
    // 2. Mobile Menu Toggle
    // ---------------------------------------------------------
    const mobileNavToggle = document.getElementById("mobileNavToggle");
    const navMenu = document.getElementById("navMenu");
    
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener("click", () => {
            mobileNavToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Close menu when clicking link
        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                mobileNavToggle.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // ---------------------------------------------------------
    // 3. Scroll Reveal Animations (Intersection Observer)
    // ---------------------------------------------------------
    const revealElements = document.querySelectorAll(".scroll-reveal");
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(elem => revealObserver.observe(elem));

    // ---------------------------------------------------------
    // 4. Statistics Auto-Counter Animation
    // ---------------------------------------------------------
    const counterElements = document.querySelectorAll(".metric-number");
    
    const countNumber = (element) => {
        const target = parseFloat(element.getAttribute("data-target"));
        const isROAS = element.innerText.includes("x") || element.getAttribute("data-target").includes(".");
        const duration = 1600; // ms
        const frameRate = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;

        const animate = () => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentValue = target * easeProgress;

            if (isROAS) {
                element.innerText = `${currentValue.toFixed(1)}x`;
            } else {
                element.innerText = `+${Math.round(currentValue)}%`;
            }

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                // Ensure precise target value reached
                element.innerText = isROAS ? `${target.toFixed(1)}x` : `+${target}%`;
            }
        };

        requestAnimationFrame(animate);
    };

    // Observer to trigger counter when cases become visible
    const casesSection = document.querySelector(".cases-section");
    if (casesSection) {
        const casesObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counterElements.forEach(countNumber);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        casesObserver.observe(casesSection);
    }

    // ---------------------------------------------------------
    // 5. Diagnostic Modal - Step-by-Step Flow
    // ---------------------------------------------------------
    const diagnosticModal = document.getElementById("diagnosticModal");
    const openModalButtons = document.querySelectorAll(".open-modal-btn");
    const closeModalButton = document.querySelector(".modal-close-btn");
    const stepPanes = document.querySelectorAll(".modal-step-pane");
    const stepDots = document.querySelectorAll(".step-dot");
    
    const step1Form = document.getElementById("step1Form");
    const step2Form = document.getElementById("step2Form");
    
    const analysisProcessing = document.getElementById("analysisProcessing");
    const analysisResult = document.getElementById("analysisResult");
    const closeFinalBtn = document.querySelector(".close-modal-final-btn");

    // Form data store
    let diagnosticData = {
        company: "",
        website: "",
        bottleneck: "",
        name: "",
        email: "",
        phone: ""
    };

    // Open Modal
    openModalButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            resetModalFlow();
            diagnosticModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Prevent body scroll
        });
    });

    // Close Modal
    const closeModal = () => {
        diagnosticModal.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable body scroll
    };

    if (closeModalButton) closeModalButton.addEventListener("click", closeModal);
    if (closeFinalBtn) {
        closeFinalBtn.addEventListener("click", () => {
            let bottleneckText = "gargalo de funil indefinido";
            switch(diagnosticData.bottleneck) {
                case "lead-qual":
                    bottleneckText = "Leads Desqualificados no Comercial (Silos operacionais)";
                    break;
                case "traffic-conv":
                    bottleneckText = "Baixa Conversão de Tráfego (Fricção crítica de UX/CRO)";
                    break;
                case "predict":
                    bottleneckText = "Ausência de Métricas Previsíveis (Silos de dados)";
                    break;
                case "alignment":
                    bottleneckText = "Desalinhamento crítico entre Marketing e Vendas";
                    break;
            }
            const message = `Olá! Acabei de gerar meu diagnóstico de performance para a empresa ${diagnosticData.company}. Meu principal gargalo é: ${bottleneckText}. Gostaria de agendar a análise técnica de 15 minutos.`;
            window.open(`https://wa.me/5512992474969?text=${encodeURIComponent(message)}`, "_blank");
            closeModal();
        });
    }
    
    // Close modal by clicking overlay background
    diagnosticModal.addEventListener("click", (e) => {
        if (e.target === diagnosticModal) {
            closeModal();
        }
    });

    // Handle back button on step 2
    const prevStepButton = document.querySelector(".prev-step-btn");
    if (prevStepButton) {
        prevStepButton.addEventListener("click", () => {
            goToStep(1);
        });
    }

    // Step navigation helper
    function goToStep(stepNum) {
        stepPanes.forEach(pane => {
            pane.classList.remove("active");
            if (parseInt(pane.getAttribute("data-step")) === stepNum) {
                pane.classList.add("active");
            }
        });

        stepDots.forEach(dot => {
            dot.classList.remove("active");
            if (parseInt(dot.getAttribute("data-step")) === stepNum) {
                dot.classList.add("active");
            }
        });
    }

    // Reset Modal Form
    function resetModalFlow() {
        goToStep(1);
        step1Form.reset();
        step2Form.reset();
        analysisProcessing.classList.remove("hidden");
        analysisResult.classList.add("hidden");
    }

    // Submit Step 1
    if (step1Form) {
        step1Form.addEventListener("submit", (e) => {
            e.preventDefault();
            diagnosticData.company = document.getElementById("companyName").value;
            diagnosticData.website = document.getElementById("website").value;
            diagnosticData.bottleneck = document.getElementById("bottleneck").value;
            goToStep(2);
        });
    }

    // Submit Step 2 & Trigger Sim Processing
    if (step2Form) {
        step2Form.addEventListener("submit", (e) => {
            e.preventDefault();
            diagnosticData.name = document.getElementById("contactName").value;
            diagnosticData.email = document.getElementById("contactEmail").value;
            diagnosticData.phone = document.getElementById("contactPhone").value;
            
            goToStep(3);
            
            // Simulating analytical data loading
            setTimeout(() => {
                if (analysisProcessing) analysisProcessing.classList.add("hidden");
                
                // Format bottleneck text translation
                let bottleneckText = "gargalo de funil indefinido";
                switch(diagnosticData.bottleneck) {
                    case "lead-qual":
                        bottleneckText = "Leads Desqualificados no Comercial (Silos operacionais)";
                        break;
                    case "traffic-conv":
                        bottleneckText = "Baixa Conversão de Tráfego (Fricção crítica de UX/CRO)";
                        break;
                    case "predict":
                        bottleneckText = "Ausência de Métricas Previsíveis (Silos de dados)";
                        break;
                    case "alignment":
                        bottleneckText = "Desalinhamento crítico entre Marketing e Vendas";
                        break;
                }

                // Inject user info into result screen
                const resCompanyName = document.getElementById("resCompanyName");
                const resBottleneck = document.getElementById("resBottleneck");
                if (resCompanyName) resCompanyName.innerText = diagnosticData.company;
                if (resBottleneck) resBottleneck.innerText = bottleneckText;
                
                if (analysisResult) analysisResult.classList.remove("hidden");
            }, 1800);
        });
    }
});
