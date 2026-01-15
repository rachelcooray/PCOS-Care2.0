// Use relative path so it works on both Localhost AND Render automatically
const API_BASE_URL = "";

// --- Navigation Logic (With Smooth Transitions) ---
function navigateTo(sectionId) {
    // 1. Fade Out Current Active
    const currentActive = document.querySelector('.page-section.active');

    if (currentActive) {
        currentActive.classList.remove('fade-in'); // Trigger fade out transition

        // Wait for transition to finish before switching display
        setTimeout(() => {
            currentActive.classList.remove('active');
            showNewSection(sectionId);
        }, 300); // Match CSS transition time roughly
    } else {
        showNewSection(sectionId);
    }
}

function showNewSection(sectionId) {
    const nextSection = document.getElementById(sectionId);
    if (!nextSection) return;

    nextSection.classList.add('active');

    // Slight delay to allow display:block to apply before adding opacity
    setTimeout(() => {
        nextSection.classList.add('fade-in');
    }, 50);

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const navItems = document.querySelectorAll('.nav-item');
    if (sectionId === 'home') navItems[0].classList.add('active');
    if (sectionId === 'info') navItems[1].classList.add('active');
    if (sectionId === 'dashboard') navItems[2].classList.add('active');
    if (sectionId === 'simple-assessment') navItems[3].classList.add('active');
    if (sectionId === 'enhanced-assessment') navItems[4].classList.add('active');
    if (sectionId === 'results') navItems[5].classList.add('active');
    if (sectionId === 'contact') navItems[6].classList.add('active');

    window.scrollTo(0, 0);

    // Close mobile nav if open
    document.getElementById('sidebar').classList.remove('open');
}

// --- Mobile Nav Toggle ---
function toggleMobileNav() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function toggleFaq(element) {
    const answer = element.querySelector('.faq-answer');
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        element.classList.remove('active');
    } else {
        answer.style.display = 'block';
        element.classList.add('active');
    }
}

// ... utility functions ...

// --- Conversion Helpers ---
function convertYesNo(val) { return val ? 1 : 0; }
function convertCycle(val) { return val === "Regular" ? 2 : 4; }
function convertBloodGroup(val) {
    const map = { "A+": 11, "A-": 12, "B+": 13, "B-": 14, "O+": 15, "O-": 16, "AB+": 17, "AB-": 18 };
    return map[val] || 11;
}

// --- Simple Assessment Handling ---
async function submitSimpleForm() {
    const alertId = 'simple-alert';
    document.getElementById(alertId).style.display = 'none';

    // 1. Gather Data
    const age = document.getElementById('simple-age').value;
    const weight = document.getElementById('simple-weight').value;
    const height = document.getElementById('simple-height').value;
    const waist = document.getElementById('simple-waist').value;
    const hip = document.getElementById('simple-hip').value;
    const pulse = document.getElementById('simple-pulse').value;
    const rr = document.getElementById('simple-rr').value;
    const bpSys = document.getElementById('simple-bp-sys').value;
    const bpDia = document.getElementById('simple-bp-dia').value;
    const cycle = document.getElementById('simple-cycle').value;
    const cycleLength = document.getElementById('simple-cycle-length').value;
    const abortions = document.getElementById('simple-abortions').value;
    const pregnant = document.getElementById('simple-pregnant').value;
    const bloodGroup = document.getElementById('simple-blood-group').value;

    const symptoms = {
        weightGain: document.getElementById('simple-weight-gain').checked,
        hairGrowth: document.getElementById('simple-hair-growth').checked,
        skinDarkening: document.getElementById('simple-skin-darkening').checked,
        hairLoss: document.getElementById('simple-hair-loss').checked,
        pimples: document.getElementById('simple-pimples').checked,
        fastFood: document.getElementById('simple-fast-food').checked,
        exercise: document.getElementById('simple-exercise').checked,
    };

    // 2. Calculations
    const bmi = calculateBMI(weight, height);
    const whr = calculateWHR(waist, hip);

    // 3. Validation
    let errors = [];
    if (!Validators.age(age)) errors.push("Age must be between 18 and 55.");
    if (!Validators.weight(weight)) errors.push("Weight must be between 30 and 200 kg.");
    if (!Validators.height(height)) errors.push("Height must be between 90 and 250 cm.");
    if (bmi && !Validators.bmi(bmi)) errors.push("Calculated BMI is out of valid range (10-50). Check weight/height.");
    if (!Validators.bpSys(bpSys)) errors.push("Systolic BP must be between 80 and 200.");
    if (!Validators.bpDia(bpDia)) errors.push("Diastolic BP must be between 50 and 120.");
    if (!Validators.pulse(pulse)) errors.push("Pulse rate must be between 15 and 120.");
    if (!Validators.rr(rr)) errors.push("Respiratory rate must be between 12 and 30.");
    if (!Validators.waist(waist)) errors.push("Waist must be between 25 and 55 inches.");
    if (!Validators.hip(hip)) errors.push("Hip must be between 20 and 60 inches.");
    if (whr && !Validators.whr(whr)) errors.push("Calculated Waist:Hip Ratio must be between 0.5 and 1.0.");
    if (!Validators.cycleLength(cycleLength)) errors.push("Cycle Length must be between 0 and 14 days.");
    if (!Validators.abortions(abortions)) errors.push("Abortions must be between 0 and 55.");

    if (errors.length > 0) {
        showAlert(alertId, errors.join('<br>'), 'error');
        return;
    }

    // 4. API Payload
    const payload = {
        " Age (yrs)": parseFloat(age),
        "Weight (Kg)": parseFloat(weight),
        "Height(Cm) ": parseFloat(height),
        "BMI": bmi,
        "Blood Group": convertBloodGroup(bloodGroup),
        "Pulse rate(bpm) ": parseFloat(pulse),
        "RR (breaths/min)": parseFloat(rr),
        "Cycle(R/I)": convertCycle(cycle),
        "Cycle length(days)": parseFloat(cycleLength),
        "Pregnant(Y/N)": convertYesNo(pregnant === "Yes"),
        "No. of aborptions": parseFloat(abortions),
        "Hip(inch)": parseFloat(hip),
        "Waist(inch)": parseFloat(waist),
        "Waist:Hip Ratio": whr,
        "Weight gain(Y/N)": convertYesNo(symptoms.weightGain),
        "hair growth(Y/N)": convertYesNo(symptoms.hairGrowth),
        "Skin darkening (Y/N)": convertYesNo(symptoms.skinDarkening),
        "Hair loss(Y/N)": convertYesNo(symptoms.hairLoss),
        "Pimples(Y/N)": convertYesNo(symptoms.pimples),
        "Fast food (Y/N)": convertYesNo(symptoms.fastFood),
        "Reg.Exercise(Y/N)": convertYesNo(symptoms.exercise),
        "BP _Systolic (mmHg)": parseFloat(bpSys),
        "BP _Diastolic (mmHg)": parseFloat(bpDia)
    };

    const displayData = { ...payload, ...symptoms, "Cycle": cycle }; // For results display logic

    await sendPredictionRequest(payload, displayData, 'predict-simple', alertId);
}


// --- Enhanced Assessment Handling ---
async function submitEnhancedForm() {
    const alertId = 'enhanced-alert';
    document.getElementById(alertId).style.display = 'none';

    // 1. Gather Data
    const inputs = {
        age: document.getElementById('enhanced-age').value,
        weight: document.getElementById('enhanced-weight').value,
        height: document.getElementById('enhanced-height').value,
        waist: document.getElementById('enhanced-waist').value,
        hip: document.getElementById('enhanced-hip').value,
        pulse: document.getElementById('enhanced-pulse').value,
        hb: document.getElementById('enhanced-hb').value,
        cycle: document.getElementById('enhanced-cycle').value,
        cycleLength: document.getElementById('enhanced-cycle-length').value,
        abortions: document.getElementById('enhanced-abortions').value,
        pregnant: document.getElementById('enhanced-pregnant').value,
        fsh: document.getElementById('enhanced-fsh').value,
        lh: document.getElementById('enhanced-lh').value,
        amh: document.getElementById('enhanced-amh').value,
        tsh: document.getElementById('enhanced-tsh').value,
        vitD3: document.getElementById('enhanced-vit-d3').value,
        rbs: document.getElementById('enhanced-rbs').value,
        follicleL: document.getElementById('enhanced-follicle-l').value,
        follicleR: document.getElementById('enhanced-follicle-r').value,
        sizeL: document.getElementById('enhanced-size-l').value,
        sizeR: document.getElementById('enhanced-size-r').value,
        endometrium: document.getElementById('enhanced-endometrium').value
    };

    const symptoms = {
        weightGain: document.getElementById('enhanced-weight-gain').checked,
        hairGrowth: document.getElementById('enhanced-hair-growth').checked,
        skinDarkening: document.getElementById('enhanced-skin-darkening').checked,
        hairLoss: document.getElementById('enhanced-hair-loss').checked,
        pimples: document.getElementById('enhanced-pimples').checked,
        fastFood: document.getElementById('enhanced-fast-food').checked
    };

    // 2. Calculations
    const bmi = calculateBMI(inputs.weight, inputs.height);
    const whr = calculateWHR(inputs.waist, inputs.hip);
    const fshLhRatio = calculateFshLhRatio(inputs.fsh, inputs.lh);

    // 3. Validation
    let errors = [];
    if (!Validators.age(inputs.age, 75)) errors.push("Age must be between 18 and 75.");
    if (!Validators.weight(inputs.weight)) errors.push("Weight must be between 30 and 200 kg.");
    if (!Validators.height(inputs.height)) errors.push("Height must be between 100 and 250 cm.");
    if (!Validators.pulse(inputs.pulse, 40, 200)) errors.push("Pulse rate must be between 40 and 200.");
    if (!Validators.hemoglobin(inputs.hb)) errors.push("Hemoglobin must be between 5 and 20.");
    if (!Validators.waist(inputs.waist, 60)) errors.push("Waist must be between 20 and 60 inches.");
    if (!Validators.hip(inputs.hip, 70)) errors.push("Hip must be between 20 and 70 inches.");
    if (whr && !Validators.whr(whr)) errors.push("Waist:Hip Ratio must be between 0.4 and 1.0.");
    if (!Validators.cycleLength(inputs.cycleLength, 0, 14)) errors.push("Cycle Length must be between 0 and 14 days (code logic).");
    if (!Validators.abortions(inputs.abortions)) errors.push("Abortions must be between 0 and 55.");

    // Hormonal
    if (!Validators.fsh(inputs.fsh)) errors.push("FSH must be between 0 and 5000.");
    if (!Validators.lh(inputs.lh)) errors.push("LH must be between 0 and 2500.");
    if (!Validators.tsh(inputs.tsh)) errors.push("TSH must be between 0 and 70.");
    if (!Validators.amh(inputs.amh)) errors.push("AMH must be between 0 and 70.");
    if (!Validators.vitD3(inputs.vitD3)) errors.push("Vit D3 must be between 1 and 6500.");
    if (!Validators.rbs(inputs.rbs)) errors.push("RBS must be between 50 and 400.");
    if (!Validators.follicleCount(inputs.follicleL)) errors.push("Follicle L count must be 1-50.");
    if (!Validators.follicleCount(inputs.follicleR)) errors.push("Follicle R count must be 1-50.");
    if (!Validators.follicleSize(inputs.sizeL)) errors.push("Follicle Size L must be 1-50.");
    if (!Validators.follicleSize(inputs.sizeR)) errors.push("Follicle Size R must be 1-50.");
    if (!Validators.endometrium(inputs.endometrium)) errors.push("Endometrium must be 1-20.");

    if (errors.length > 0) {
        showAlert(alertId, errors.join('<br>'), 'error');
        return;
    }

    // 4. API Payload
    const payload = {
        ' Age (yrs)': parseFloat(inputs.age),
        'Weight (Kg)': parseFloat(inputs.weight),
        'Height(Cm) ': parseFloat(inputs.height),
        'BMI': bmi,
        'Pulse rate(bpm) ': parseFloat(inputs.pulse),
        'Hb(g/dl)': parseFloat(inputs.hb),
        'Cycle(R/I)': convertCycle(inputs.cycle),
        'Cycle length(days)': parseFloat(inputs.cycleLength),
        'Pregnant(Y/N)': convertYesNo(inputs.pregnant === "Yes"),
        'No. of aborptions': parseFloat(inputs.abortions),
        'FSH(mIU/mL)': parseFloat(inputs.fsh),
        'LH(mIU/mL)': parseFloat(inputs.lh),
        'FSH/LH': fshLhRatio,
        'Hip(inch)': parseFloat(inputs.hip),
        'Waist(inch)': parseFloat(inputs.waist),
        'Waist:Hip Ratio': whr,
        'AMH(ng/mL)': parseFloat(inputs.amh),
        'Vit D3 (ng/mL)': parseFloat(inputs.vitD3),
        'RBS(mg/dl)': parseFloat(inputs.rbs),
        'Weight gain(Y/N)': convertYesNo(symptoms.weightGain),
        'hair growth(Y/N)': convertYesNo(symptoms.hairGrowth),
        'Skin darkening (Y/N)': convertYesNo(symptoms.skinDarkening),
        'Hair loss(Y/N)': convertYesNo(symptoms.hairLoss),
        'Pimples(Y/N)': convertYesNo(symptoms.pimples),
        'Fast food (Y/N)': convertYesNo(symptoms.fastFood),
        'Follicle No. (L)': parseFloat(inputs.follicleL),
        'Follicle No. (R)': parseFloat(inputs.follicleR),
        'Avg. F size (L) (mm)': parseFloat(inputs.sizeL),
        'Avg. F size (R) (mm)': parseFloat(inputs.sizeR),
        'Endometrium (mm)': parseFloat(inputs.endometrium),
        'TSH (mIU/L)': parseFloat(inputs.tsh)
    };

    const displayData = { ...payload, ...symptoms, "Cycle": inputs.cycle };

    await sendPredictionRequest(payload, displayData, 'predict-enhanced', alertId);
}

// --- API Interaction & Result Storage (With Loading) ---
async function sendPredictionRequest(payload, displayData, endpoint, alertId) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok) {
            showAlert(alertId, "Assessment Complete! Redirecting to results...", 'success');

            // Store Results in Session
            sessionStorage.setItem('pcos_result', JSON.stringify({
                prediction: data.prediction,
                data: displayData
            }));

            // Populate table logic is handled in displayResults now

            // Navigate after short delay
            setTimeout(() => {
                navigateTo('results');
                displayResults();
            }, 500);

        } else {
            showAlert(alertId, data.error || "Server Error", 'error');
        }
    } catch (e) {
        console.error(e);
        showAlert(alertId, "Network Error: Is the backend running?", 'error');
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// --- Utility Functions ---
function showAlert(elementId, message, type) {
    const alertBox = document.getElementById(elementId);
    alertBox.style.display = 'block';
    alertBox.innerHTML = message;
    alertBox.className = `alert-box ${type}`; // 'success' or 'error'

    // Auto-scroll to alert
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function isValidNumber(value, min, max) {
    if (value === "" || value === null || isNaN(value)) return false;
    const num = parseFloat(value);
    return num >= min && num <= max;
}

function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    return weight / ((height / 100) ** 2);
}

function calculateWHR(waist, hip) {
    if (!waist || !hip) return null;
    return waist / hip;
}

function calculateFshLhRatio(fsh, lh) {
    if (!fsh || !lh) return null;
    return fsh / lh;
}

// --- Validation Logic (Matches Python Rules) ---
const Validators = {
    age: (val, max = 55) => isValidNumber(val, 18, max), // Enhanced has max 75, Simple 55
    weight: (val) => isValidNumber(val, 30, 200),
    height: (val) => isValidNumber(val, 90, 250), // Enhanced min 100
    bmi: (val) => isValidNumber(val, 10, 50),
    bpSys: (val) => isValidNumber(val, 80, 200),
    bpDia: (val) => isValidNumber(val, 50, 120),
    pulse: (val, min = 15, max = 120) => isValidNumber(val, min, max), // Enhanced 40-200
    rr: (val) => isValidNumber(val, 12, 30),
    cycleLength: (val, min = 0, max = 14) => isValidNumber(val, min, max), // Enhanced 21-35 logic different in description but rule says 0-14 in simple code
    abortions: (val) => isValidNumber(val, 0, 55),
    hip: (val, max = 60) => isValidNumber(val, 20, max), // Enhanced max 70
    waist: (val, max = 55) => isValidNumber(val, 20, max), // Enhanced max 60
    whr: (val) => isValidNumber(val, 0.4, 1.0), // Simple 0.5-1.0
    // Enhanced Specific
    hemoglobin: (val) => isValidNumber(val, 5, 20),
    fsh: (val) => isValidNumber(val, 0, 5000),
    lh: (val) => isValidNumber(val, 0, 2500),
    tsh: (val) => isValidNumber(val, 0, 70),
    amh: (val) => isValidNumber(val, 0, 70),
    vitD3: (val) => isValidNumber(val, 1, 6500),
    rbs: (val) => isValidNumber(val, 50, 400),
    follicleCount: (val) => isValidNumber(val, 1, 50),
    follicleSize: (val) => isValidNumber(val, 1, 50),
    endometrium: (val) => isValidNumber(val, 1, 20)
};

// --- Conversion Helpers ---
function convertYesNo(val) { return val ? 1 : 0; }
function convertCycle(val) { return val === "Regular" ? 2 : 4; }
function convertBloodGroup(val) {
    const map = { "A+": 11, "A-": 12, "B+": 13, "B-": 14, "O+": 15, "O-": 16, "AB+": 17, "AB-": 18 };
    return map[val] || 11;
}

// --- Simple Assessment Handling ---
async function submitSimpleForm() {
    const alertId = 'simple-alert';
    document.getElementById(alertId).style.display = 'none';

    // 1. Gather Data
    const age = document.getElementById('simple-age').value;
    const weight = document.getElementById('simple-weight').value;
    const height = document.getElementById('simple-height').value;
    const waist = document.getElementById('simple-waist').value;
    const hip = document.getElementById('simple-hip').value;
    const pulse = document.getElementById('simple-pulse').value;
    const rr = document.getElementById('simple-rr').value;
    const bpSys = document.getElementById('simple-bp-sys').value;
    const bpDia = document.getElementById('simple-bp-dia').value;
    const cycle = document.getElementById('simple-cycle').value;
    const cycleLength = document.getElementById('simple-cycle-length').value;
    const abortions = document.getElementById('simple-abortions').value;
    const pregnant = document.getElementById('simple-pregnant').value;
    const bloodGroup = document.getElementById('simple-blood-group').value;

    const symptoms = {
        weightGain: document.getElementById('simple-weight-gain').checked,
        hairGrowth: document.getElementById('simple-hair-growth').checked,
        skinDarkening: document.getElementById('simple-skin-darkening').checked,
        hairLoss: document.getElementById('simple-hair-loss').checked,
        pimples: document.getElementById('simple-pimples').checked,
        fastFood: document.getElementById('simple-fast-food').checked,
        exercise: document.getElementById('simple-exercise').checked,
    };

    // 2. Calculations
    const bmi = calculateBMI(weight, height);
    const whr = calculateWHR(waist, hip);

    // 3. Validation
    let errors = [];
    if (!Validators.age(age)) errors.push("Age must be between 18 and 55.");
    if (!Validators.weight(weight)) errors.push("Weight must be between 30 and 200 kg.");
    if (!Validators.height(height)) errors.push("Height must be between 90 and 250 cm.");
    if (bmi && !Validators.bmi(bmi)) errors.push("Calculated BMI is out of valid range (10-50). Check weight/height.");
    if (!Validators.bpSys(bpSys)) errors.push("Systolic BP must be between 80 and 200.");
    if (!Validators.bpDia(bpDia)) errors.push("Diastolic BP must be between 50 and 120.");
    if (!Validators.pulse(pulse)) errors.push("Pulse rate must be between 15 and 120.");
    if (!Validators.rr(rr)) errors.push("Respiratory rate must be between 12 and 30.");
    if (!Validators.waist(waist)) errors.push("Waist must be between 25 and 55 inches.");
    if (!Validators.hip(hip)) errors.push("Hip must be between 20 and 60 inches.");
    if (whr && !Validators.whr(whr)) errors.push("Calculated Waist:Hip Ratio must be between 0.5 and 1.0.");
    if (!Validators.cycleLength(cycleLength)) errors.push("Cycle Length must be between 0 and 14 days.");
    if (!Validators.abortions(abortions)) errors.push("Abortions must be between 0 and 55.");

    if (errors.length > 0) {
        showAlert(alertId, errors.join('<br>'), 'error');
        return;
    }

    // 4. API Payload
    const payload = {
        " Age (yrs)": parseFloat(age),
        "Weight (Kg)": parseFloat(weight),
        "Height(Cm) ": parseFloat(height),
        "BMI": bmi,
        "Blood Group": convertBloodGroup(bloodGroup),
        "Pulse rate(bpm) ": parseFloat(pulse),
        "RR (breaths/min)": parseFloat(rr),
        "Cycle(R/I)": convertCycle(cycle),
        "Cycle length(days)": parseFloat(cycleLength),
        "Pregnant(Y/N)": convertYesNo(pregnant === "Yes"),
        "No. of aborptions": parseFloat(abortions),
        "Hip(inch)": parseFloat(hip),
        "Waist(inch)": parseFloat(waist),
        "Waist:Hip Ratio": whr,
        "Weight gain(Y/N)": convertYesNo(symptoms.weightGain),
        "hair growth(Y/N)": convertYesNo(symptoms.hairGrowth),
        "Skin darkening (Y/N)": convertYesNo(symptoms.skinDarkening),
        "Hair loss(Y/N)": convertYesNo(symptoms.hairLoss),
        "Pimples(Y/N)": convertYesNo(symptoms.pimples),
        "Fast food (Y/N)": convertYesNo(symptoms.fastFood),
        "Reg.Exercise(Y/N)": convertYesNo(symptoms.exercise),
        "BP _Systolic (mmHg)": parseFloat(bpSys),
        "BP _Diastolic (mmHg)": parseFloat(bpDia)
    };

    const displayData = { ...payload, ...symptoms, "Cycle": cycle }; // For results display logic

    await sendPredictionRequest(payload, displayData, 'predict-simple', alertId);
}


// --- Enhanced Assessment Handling ---
async function submitEnhancedForm() {
    const alertId = 'enhanced-alert';
    document.getElementById(alertId).style.display = 'none';

    // 1. Gather Data
    const inputs = {
        age: document.getElementById('enhanced-age').value,
        weight: document.getElementById('enhanced-weight').value,
        height: document.getElementById('enhanced-height').value,
        waist: document.getElementById('enhanced-waist').value,
        hip: document.getElementById('enhanced-hip').value,
        pulse: document.getElementById('enhanced-pulse').value,
        hb: document.getElementById('enhanced-hb').value,
        cycle: document.getElementById('enhanced-cycle').value,
        cycleLength: document.getElementById('enhanced-cycle-length').value,
        abortions: document.getElementById('enhanced-abortions').value,
        pregnant: document.getElementById('enhanced-pregnant').value,
        fsh: document.getElementById('enhanced-fsh').value,
        lh: document.getElementById('enhanced-lh').value,
        amh: document.getElementById('enhanced-amh').value,
        tsh: document.getElementById('enhanced-tsh').value,
        vitD3: document.getElementById('enhanced-vit-d3').value,
        rbs: document.getElementById('enhanced-rbs').value,
        follicleL: document.getElementById('enhanced-follicle-l').value,
        follicleR: document.getElementById('enhanced-follicle-r').value,
        sizeL: document.getElementById('enhanced-size-l').value,
        sizeR: document.getElementById('enhanced-size-r').value,
        endometrium: document.getElementById('enhanced-endometrium').value
    };

    const symptoms = {
        weightGain: document.getElementById('enhanced-weight-gain').checked,
        hairGrowth: document.getElementById('enhanced-hair-growth').checked,
        skinDarkening: document.getElementById('enhanced-skin-darkening').checked,
        hairLoss: document.getElementById('enhanced-hair-loss').checked,
        pimples: document.getElementById('enhanced-pimples').checked,
        fastFood: document.getElementById('enhanced-fast-food').checked
    };

    // 2. Calculations
    const bmi = calculateBMI(inputs.weight, inputs.height);
    const whr = calculateWHR(inputs.waist, inputs.hip);
    const fshLhRatio = calculateFshLhRatio(inputs.fsh, inputs.lh);

    // 3. Validation
    let errors = [];
    if (!Validators.age(inputs.age, 75)) errors.push("Age must be between 18 and 75.");
    if (!Validators.weight(inputs.weight)) errors.push("Weight must be between 30 and 200 kg.");
    if (!Validators.height(inputs.height)) errors.push("Height must be between 100 and 250 cm.");
    if (!Validators.pulse(inputs.pulse, 40, 200)) errors.push("Pulse rate must be between 40 and 200.");
    if (!Validators.hemoglobin(inputs.hb)) errors.push("Hemoglobin must be between 5 and 20.");
    if (!Validators.waist(inputs.waist, 60)) errors.push("Waist must be between 20 and 60 inches.");
    if (!Validators.hip(inputs.hip, 70)) errors.push("Hip must be between 20 and 70 inches.");
    if (whr && !Validators.whr(whr)) errors.push("Waist:Hip Ratio must be between 0.4 and 1.0.");
    if (!Validators.cycleLength(inputs.cycleLength, 0, 14)) errors.push("Cycle Length must be between 0 and 14 days (code logic).");
    if (!Validators.abortions(inputs.abortions)) errors.push("Abortions must be between 0 and 55.");

    // Hormonal
    if (!Validators.fsh(inputs.fsh)) errors.push("FSH must be between 0 and 5000.");
    if (!Validators.lh(inputs.lh)) errors.push("LH must be between 0 and 2500.");
    if (!Validators.tsh(inputs.tsh)) errors.push("TSH must be between 0 and 70.");
    if (!Validators.amh(inputs.amh)) errors.push("AMH must be between 0 and 70.");
    if (!Validators.vitD3(inputs.vitD3)) errors.push("Vit D3 must be between 1 and 6500.");
    if (!Validators.rbs(inputs.rbs)) errors.push("RBS must be between 50 and 400.");
    if (!Validators.follicleCount(inputs.follicleL)) errors.push("Follicle L count must be 1-50.");
    if (!Validators.follicleCount(inputs.follicleR)) errors.push("Follicle R count must be 1-50.");
    if (!Validators.follicleSize(inputs.sizeL)) errors.push("Follicle Size L must be 1-50.");
    if (!Validators.follicleSize(inputs.sizeR)) errors.push("Follicle Size R must be 1-50.");
    if (!Validators.endometrium(inputs.endometrium)) errors.push("Endometrium must be 1-20.");

    if (errors.length > 0) {
        showAlert(alertId, errors.join('<br>'), 'error');
        return;
    }

    // 4. API Payload
    const payload = {
        ' Age (yrs)': parseFloat(inputs.age),
        'Weight (Kg)': parseFloat(inputs.weight),
        'Height(Cm) ': parseFloat(inputs.height),
        'BMI': bmi,
        'Pulse rate(bpm) ': parseFloat(inputs.pulse),
        'Hb(g/dl)': parseFloat(inputs.hb),
        'Cycle(R/I)': convertCycle(inputs.cycle),
        'Cycle length(days)': parseFloat(inputs.cycleLength),
        'Pregnant(Y/N)': convertYesNo(inputs.pregnant === "Yes"),
        'No. of aborptions': parseFloat(inputs.abortions),
        'FSH(mIU/mL)': parseFloat(inputs.fsh),
        'LH(mIU/mL)': parseFloat(inputs.lh),
        'FSH/LH': fshLhRatio,
        'Hip(inch)': parseFloat(inputs.hip),
        'Waist(inch)': parseFloat(inputs.waist),
        'Waist:Hip Ratio': whr,
        'AMH(ng/mL)': parseFloat(inputs.amh),
        'Vit D3 (ng/mL)': parseFloat(inputs.vitD3),
        'RBS(mg/dl)': parseFloat(inputs.rbs),
        'Weight gain(Y/N)': convertYesNo(symptoms.weightGain),
        'hair growth(Y/N)': convertYesNo(symptoms.hairGrowth),
        'Skin darkening (Y/N)': convertYesNo(symptoms.skinDarkening),
        'Hair loss(Y/N)': convertYesNo(symptoms.hairLoss),
        'Pimples(Y/N)': convertYesNo(symptoms.pimples),
        'Fast food (Y/N)': convertYesNo(symptoms.fastFood),
        'Follicle No. (L)': parseFloat(inputs.follicleL),
        'Follicle No. (R)': parseFloat(inputs.follicleR),
        'Avg. F size (L) (mm)': parseFloat(inputs.sizeL),
        'Avg. F size (R) (mm)': parseFloat(inputs.sizeR),
        'Endometrium (mm)': parseFloat(inputs.endometrium),
        'TSH (mIU/L)': parseFloat(inputs.tsh)
    };

    const displayData = { ...payload, ...symptoms, "Cycle": inputs.cycle };

    await sendPredictionRequest(payload, displayData, 'predict-enhanced', alertId);
}


// --- API Interaction & Result Storage ---
async function sendPredictionRequest(payload, displayData, endpoint, alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok) {
            showAlert(alertId, "Assessment Complete! Redirecting to results...", 'success');

            // Store Results in Session
            sessionStorage.setItem('pcos_result', JSON.stringify({
                prediction: data.prediction,
                data: displayData
            }));

            // --- POPULATE PRINT DATA TABLE ---
            const tableBody = document.getElementById('report-table-body');
            if (tableBody) {
                tableBody.innerHTML = ''; // Clear previous

                // Helper to format key names nicely if needed, though payload keys are already descriptive
                // We will filter out any potentially huge or irrelevant keys if necessary
                const entries = Object.entries(displayData); // Use displayData for the table

                // Sort for consistent order, or keep as is. Alphabetical might be cleaner.
                entries.sort((a, b) => a[0].localeCompare(b[0]));

                entries.forEach(([key, value]) => {
                    // specific tweaks
                    let displayVal = value;
                    if (displayVal === true) displayVal = "Yes";
                    if (displayVal === false) displayVal = "No";

                    // Avoid printing boolean conversion artifacts if they persist as 0/1 in some logic
                    if (key.includes('(Y/N)') && (displayVal === 1 || displayVal === 0)) {
                        displayVal = displayVal === 1 ? "Yes" : "No";
                    }

                    // Filter out internal/empty keys if any
                    if (value !== null && value !== undefined && value !== "") {
                        let row = `<tr>
                            <td><strong>${key}</strong></td>
                            <td>${displayVal}</td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    }
                });
            }

            // Navigate after short delay
            setTimeout(() => {
                navigateTo('results');
                displayResults();
            }, 1000);

        } else {
            showAlert(alertId, data.error || "Server Error", 'error');
        }
    } catch (e) {
        console.error(e);
        showAlert(alertId, "Network Error: Is the backend running?", 'error');
    }
}


// --- Result Rendering ---
function displayResults() {
    const sessionData = sessionStorage.getItem('pcos_result');
    if (!sessionData) {
        const predEl = document.getElementById('result-prediction');
        if (predEl) predEl.innerHTML = "No Data Available";
        return;
    }

    const { prediction, data } = JSON.parse(sessionData);
    const isLikely = prediction.includes("likely");

    // 1. Prediction Header
    const headerEl = document.getElementById('result-header');
    if (headerEl) {
        headerEl.innerHTML = `<h3 style="color: #6E39A7;">Prediction: ${prediction}</h3>`;
    }

    const alertEl = document.getElementById('result-alert');
    if (alertEl) {
        alertEl.innerText = isLikely
            ? "This suggests a high probability of PCOS. Please consult a doctor."
            : "You are unlikely to have PCOS. Maintain a healthy lifestyle.";
        alertEl.className = `alert-box-large ${isLikely ? 'warning' : 'success'}`;
    }

    // 2. Next Steps
    const nextStepsEl = document.getElementById('next-steps-alert');
    if (nextStepsEl) {
        nextStepsEl.innerText = isLikely
            ? "We strongly recommend seeking medical advice. Download this report."
            : "Continue monitoring your health and maintain good habits.";
        nextStepsEl.className = `alert-box-large ${isLikely ? 'warning' : 'success'}`;
    }

    // 3. Gauges (BMI, WHR, FSH/LH)
    updateGauge('gauge-bmi', data['BMI'], 10, 50, 25, "BMI");
    updateGauge('gauge-whr', data['Waist:Hip Ratio'], 0.4, 1.0, 0.85, "Ratio");

    // BMI Msg
    const bmi = data['BMI'];
    const bmiMsg = document.getElementById('msg-bmi');
    if (bmiMsg && bmi) {
        bmiMsg.innerText = (bmi > 25) ? "BMI > 25 indicates a risk factor." : "BMI is within healthy range.";
    }

    // WHR Msg
    const whr = data['Waist:Hip Ratio'];
    const whrMsg = document.getElementById('msg-whr');
    if (whrMsg && whr) {
        whrMsg.innerText = (whr > 0.85) ? "Ratio > 0.85 indicates risk." : "Ratio is normal.";
    }

    // FSH/LH (only if available)
    if (data['FSH/LH']) {
        const box = document.getElementById('chart-box-fsh-lh');
        if (box) box.style.display = 'block';
        updateGauge('gauge-fsh-lh', data['FSH/LH'], 0, 3, 1, "Ratio");
        const msg = document.getElementById('msg-fsh-lh');
        if (msg) {
            console.log("Setting FSH/LH msg");
            msg.innerText = (data['FSH/LH'] < 1) ? "Lower FSH/LH ratio can indicate imbalance." : "Ratio appears typical.";
        }
    }

    // 4. Cycle Bar Chart
    const cycleSection = document.getElementById('cycle-section');
    if (cycleSection && data['Cycle'] === 'Irregular' && data['FSH(mIU/mL)'] && data['LH(mIU/mL)']) {
        cycleSection.style.display = 'block';
        const fsh = data['FSH(mIU/mL)'];
        const lh = data['LH(mIU/mL)'];

        // Normalize for visual bar (max 100%)
        const maxVal = Math.max(fsh, lh, 10);
        document.getElementById('bar-fsh').style.width = `${(fsh / maxVal) * 100}%`;
        document.getElementById('bar-lh').style.width = `${(lh / maxVal) * 100}%`;

        document.getElementById('val-fsh').innerText = fsh;
        document.getElementById('val-lh').innerText = lh;

        const msgCycle = document.getElementById('msg-cycle');
        if (msgCycle) {
            if (lh > fsh) msgCycle.innerText = "LH > FSH: Common indicator of PCOS anovulation.";
            else if (Math.abs(lh - fsh) < 1) msgCycle.innerText = "LH ≈ FSH: Needs evaluation.";
            else msgCycle.innerText = "FSH > LH: Generally typical, but monitor.";
        }
    } else if (cycleSection) {
        cycleSection.style.display = 'none';
    }


    // 5. Lifestyle Recommendations
    const lifestyleList = document.getElementById('lifestyle-list');
    const lifestyleSection = document.getElementById('lifestyle-section');
    if (lifestyleList && lifestyleSection) {
        lifestyleList.innerHTML = "";
        let hasIssues = false;

        if (data['Weight gain(Y/N)']) {
            lifestyleList.innerHTML += "<li><strong>Weight Gain:</strong> Excess weight worsens insulin resistance.</li>";
            hasIssues = true;
        }
        if (data['Fast food (Y/N)']) {
            lifestyleList.innerHTML += "<li><strong>Fast Food:</strong> Processed foods disrupt hormones.</li>";
            hasIssues = true;
        }
        if (!data['Reg.Exercise(Y/N)']) {
            lifestyleList.innerHTML += "<li><strong>Lack of Exercise:</strong> Physical activity regulates hormones.</li>";
            hasIssues = true;
        }

        lifestyleSection.style.display = hasIssues ? 'block' : 'none';
    }

    // 6. Populate Print Report Table
    populateReportTable(data);
}

function populateReportTable(data) {
    const tableBody = document.getElementById('report-table-body');
    if (!tableBody || !data) return;

    tableBody.innerHTML = ''; // Clear previous

    const entries = Object.entries(data);
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([key, value]) => {
        let displayVal = value;
        if (displayVal === true) displayVal = "Yes";
        if (displayVal === false) displayVal = "No";

        if (key.includes('(Y/N)') && (displayVal === 1 || displayVal === 0)) {
            displayVal = displayVal === 1 ? "Yes" : "No";
        }

        if (value !== null && value !== undefined && value !== "" && key !== 'Cycle') {
            let row = `<tr>
                <td><strong>${key}</strong></td>
                <td>${displayVal}</td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    });
}

function updateGauge(elementId, value, min, max, threshold, label) {
    if (value === null || isNaN(value)) return;
    const container = document.getElementById(elementId);
    if (!container) return;

    const range = max - min;
    let pct = ((value - min) / range) * 100;
    pct = Math.min(Math.max(pct, 0), 100);

    let color = '#51A199'; // Green
    let isBad = false;

    if (label === 'BMI' && value > 25) isBad = true;
    if (label === 'Ratio' && elementId.includes('whr') && value > 0.85) isBad = true;
    if (label === 'Ratio' && elementId.includes('fsh') && value < 1) isBad = true;

    if (isBad) color = '#F0A693'; // Red

    requestAnimationFrame(() => {
        container.style.setProperty('--percentage', `${pct}%`);
        container.style.setProperty('--gauge-color', color);
    });

    const valEl = container.querySelector('.gauge-value');
    if (valEl) valEl.innerText = value.toFixed(1);
}

// Ensure results are loaded if user refreshes on results page
if (document.getElementById('results') && document.getElementById('results').classList.contains('active')) {
    displayResults();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    attachRealTimeValidation();
    initializeCharts();
});

// --- Dashboard Charts (Chart.js) ---
function initializeCharts() {
    // Only init if canvas exists (dashboard page)
    if (!document.getElementById('prevalenceChart')) return;

    // Common Aesthetic
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.color = '#555';

    // 1. Prevalence (Doughnut)
    new Chart(document.getElementById('prevalenceChart'), {
        type: 'doughnut',
        data: {
            labels: ['PCOS Cases (India)', 'Healthy Population'],
            datasets: [{
                data: [20, 80], // 1 in 5
                backgroundColor: ['#8B5CF6', '#E5E7EB'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Estimated Prevalence' }
            }
        }
    });

    // 2. Undiagnosed (Pie)
    new Chart(document.getElementById('undiagnosedChart'), {
        type: 'pie',
        data: {
            labels: ['Undiagnosed', 'Diagnosed'],
            datasets: [{
                data: [70, 30],
                backgroundColor: ['#F87171', '#34D399'], // Red/Green
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 3. Symptoms (Bar)
    new Chart(document.getElementById('symptomsChart'), {
        type: 'bar',
        data: {
            labels: ['Irregular Periods', 'Weight Gain', 'Hirsutism', 'Acne', 'Hair Loss', 'Skin Darkening'],
            datasets: [{
                label: 'Reported Frequency (%)',
                data: [85, 75, 60, 45, 40, 30], // Illustrative data matching text
                backgroundColor: '#A78BFA',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: {
                legend: { display: false } // Single color bar doesn't need legend
            }
        }
    });

    // 4. Diet Impact (Doughnut - Fast Food)
    new Chart(document.getElementById('dietChart'), {
        type: 'doughnut',
        data: {
            labels: ['Frequent Fast Food', 'Balanced Diet'],
            datasets: [{
                data: [65, 35], // Illustrative correlation
                backgroundColor: ['#FBBF24', '#6EE7B7'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Impact on PCOS Severity' }
            }
        }
    });
}
