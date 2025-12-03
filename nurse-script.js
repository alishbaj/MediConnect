// Nurse Dashboard Script
console.log('nurse-script.js loading...');

import { supabase } from './supabaseBrowser.js';

console.log('Supabase imported successfully');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== NURSE DASHBOARD INITIALIZING ===');
   
    // Fetch and store NurseID
    await fetchAndStoreNurseID();
   
    // Load all dashboard data
    await loadNurseInfo();
    await loadPendingLabResults();
    await loadCompletedLabResults();
   
    // Setup form handler
    setupLabResultForm();
   
    console.log('=== NURSE DASHBOARD READY ===');
});

// Fetch NurseID from Supabase based on logged-in email
async function fetchAndStoreNurseID() {
    console.log('>>> Fetching NurseID...');
   
    const existingNurseID = sessionStorage.getItem('nurseID');
    if (existingNurseID) {
        console.log('NurseID already in sessionStorage:', existingNurseID);
        return;
    }

    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
        console.warn('User email missing in sessionStorage');
        const testID = prompt('Enter NurseID for testing (or cancel):');
        if (testID) sessionStorage.setItem('nurseID', testID);
        return;
    }

    const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('StaffID')
        .eq('Email', userEmail)
        .single();

    if (staffError || !staffData) {
        console.error('Could not fetch staff record:', staffError);
        const testID = prompt('Enter NurseID for testing:');
        if (testID) sessionStorage.setItem('nurseID', testID);
        return;
    }


    const staffID = staffData.StaffID.toString();


    const { data: nurseData } = await supabase
        .from('nurse')
        .select('NurseID')
        .eq('NurseID', staffID)
        .single();


    sessionStorage.setItem('nurseID', nurseData ? staffID : staffID);
    console.log('✓ NurseID stored:', staffID);
}


// Load nurse information into dashboard DOM
async function loadNurseInfo() {
    console.log('>>> Loading nurse info...');
   
    try {
        const nurseID = sessionStorage.getItem('nurseID');


        if (!nurseID) {
            console.warn('No nurseID found');
            document.getElementById('ShiftType').textContent = "Not logged in";
            document.getElementById('Ward').textContent = "Not logged in";
            return;
        }


        const { data: nurseData, error } = await supabase
            .from('nurse')
            .select('ShiftType, Ward')
            .eq('NurseID', nurseID)
            .single();


        console.log('Nurse data:', nurseData);


        if (error || !nurseData) {
            console.error('Error loading nurse info:', error);
            document.getElementById('ShiftType').textContent = "Error";
            document.getElementById('Ward').textContent = "Error";
            return;
        }


        document.getElementById('ShiftType').textContent = nurseData.ShiftType || "N/A";
        document.getElementById('Ward').textContent = nurseData.Ward || "N/A";
       
        console.log('✓ Nurse info loaded');


    } catch (err) {
        console.error('Exception in loadNurseInfo:', err);
        document.getElementById('ShiftType').textContent = "Error";
        document.getElementById('Ward').textContent = "Error";
    }
}


// Load pending lab results (ResultNotes is null)
async function loadPendingLabResults() {
    console.log('>>> Loading pending lab results...');
   
    const table = document.getElementById("pendingLabResultsTable");
    if (!table) {
        console.error("Pending lab table not found in DOM");
        return;
    }


    const tbody = table.querySelector("tbody");


    const { data, error } = await supabase
        .from("lab_results")
        .select("LabResID, TestDate, TestType, PatientID, DoctorID")
        .is("ResultNotes", null)
        .order("TestDate", { ascending: false });


    console.log('Pending lab results:', data?.length || 0, 'records');


    if (error || !data?.length) {
        tbody.innerHTML = '<tr><td colspan="5">No pending lab results found</td></tr>';
        return;
    }


    const patientIDs = [...new Set(data.map(r => r.PatientID).filter(Boolean))];
    const doctorIDs = [...new Set(data.map(r => r.DoctorID).filter(Boolean))];


    let patientsMap = {};
    let doctorsMap = {};


    if (patientIDs.length) {
        const { data: patients } = await supabase
            .from("patient")
            .select("PatientID, Fname, Lname")
            .in("PatientID", patientIDs);


        patientsMap = patients?.reduce((acc, p) => {
            acc[p.PatientID] = `${p.Fname} ${p.Lname}`;
            return acc;
        }, {}) || {};
    }


    if (doctorIDs.length) {
        const { data: staff } = await supabase
            .from("staff")
            .select("StaffID, Fname, Lname")
            .in("StaffID", doctorIDs);


        doctorsMap = staff?.reduce((acc, s) => {
            acc[s.StaffID] = `${s.Fname} ${s.Lname}`;
            return acc;
        }, {}) || {};
    }


    tbody.innerHTML = data.map(r => {
        const patientName = patientsMap[r.PatientID] || `Patient ID: ${r.PatientID}`;
        const doctorName = doctorsMap[r.DoctorID] || `Doctor ID: ${r.DoctorID}`;


        return `
        <tr>
            <td>${r.TestDate ? new Date(r.TestDate).toLocaleDateString() : "N/A"}</td>
            <td>${r.TestType || "-"}</td>
            <td>${patientName}</td>
            <td>${doctorName}</td>
            <td>
                <button class="btn btn-primary" onclick="selectLabOrder(${r.LabResID}, ${r.PatientID}, ${r.DoctorID}, '${r.TestType}')">
                    Conduct Test
                </button>
            </td>
        </tr>`;
    }).join("");


    populateLabOrderDropdown(data);
    console.log('✓ Pending lab results loaded');
}


// Load completed lab results (ResultNotes is NOT null) - only by this nurse
async function loadCompletedLabResults() {
    console.log('>>> Loading completed lab results...');
   
    const table = document.getElementById("completedLabResultsTable");
    if (!table) {
        console.error("Completed lab table not found in DOM");
        return;
    }


    const tbody = table.querySelector("tbody");
   
    const nurseID = sessionStorage.getItem('nurseID');
    if (!nurseID) {
        console.warn('No nurseID found - cannot filter completed results');
        tbody.innerHTML = '<tr><td colspan="5">Please log in to view completed lab results</td></tr>';
        return;
    }


    const { data, error } = await supabase
        .from("lab_results")
        .select("LabResID, TestDate, TestType, ResultNotes, PatientID, DoctorID")
        .eq("NurseID", parseInt(nurseID))  // Filter by logged-in nurse
        .not("ResultNotes", "is", null)
        .order("TestDate", { ascending: false });


    console.log('Completed lab results:', data?.length || 0, 'records');


    if (error || !data?.length) {
        tbody.innerHTML = '<tr><td colspan="5">No completed lab results found</td></tr>';
        return;
    }


    const patientIDs = [...new Set(data.map(r => r.PatientID).filter(Boolean))];
    const doctorIDs = [...new Set(data.map(r => r.DoctorID).filter(Boolean))];


    let patientsMap = {};
    let doctorsMap = {};


    if (patientIDs.length) {
        const { data: patients } = await supabase
            .from("patient")
            .select("PatientID, Fname, Lname")
            .in("PatientID", patientIDs);


        patientsMap = patients?.reduce((acc, p) => {
            acc[p.PatientID] = `${p.Fname} ${p.Lname}`;
            return acc;
        }, {}) || {};
    }


    if (doctorIDs.length) {
        const { data: staff } = await supabase
            .from("staff")
            .select("StaffID, Fname, Lname")
            .in("StaffID", doctorIDs);


        doctorsMap = staff?.reduce((acc, s) => {
            acc[s.StaffID] = `${s.Fname} ${s.Lname}`;
            return acc;
        }, {}) || {};
    }


    tbody.innerHTML = data.map(r => {
        const patientName = patientsMap[r.PatientID] || `Patient ID: ${r.PatientID}`;
        const doctorName = doctorsMap[r.DoctorID] || `Doctor ID: ${r.DoctorID}`;


        return `
        <tr>
            <td>${r.TestDate ? new Date(r.TestDate).toLocaleDateString() : "N/A"}</td>
            <td>${r.TestType || "-"}</td>
            <td>${patientName}</td>
            <td>${r.ResultNotes}</td>
            <td>${doctorName}</td>
        </tr>`;
    }).join("");
   
    console.log('✓ Completed lab results loaded');
}


// Setup form submission handler
function setupLabResultForm() {
    console.log('>>> Setting up form handler...');
   
    const form = document.getElementById("labResultForm");
    if (!form) {
        console.error("Lab result form not found");
        return;
    }


    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log('Form submitted');


        const LabResID = document.getElementById("LabResID").value;
        const TestDate = document.getElementById("TestDate_Conduct").value;
        const ResultNotes = document.getElementById("ResultNotes_Conduct").value;
        const nurseID = sessionStorage.getItem("nurseID");


        if (!LabResID || !TestDate || !ResultNotes || !nurseID) {
            alert("Missing required fields");
            return;
        }


        console.log('Updating lab result:', LabResID);


        const { error } = await supabase
            .from("lab_results")
            .update({
                TestDate,
                ResultNotes,
                NurseID: parseInt(nurseID)
            })
            .eq("LabResID", parseInt(LabResID));


        if (error) {
            console.error('Submit error:', error);
            alert("Submit failed");
        } else {
            console.log('✓ Lab result submitted');
            alert("Lab results submitted successfully!");
            form.reset();
            await loadPendingLabResults();
            await loadCompletedLabResults();
        }
    });
   
    console.log('✓ Form handler ready');
}


// Populate dropdown for lab orders
function populateLabOrderDropdown(labOrders) {
    const select = document.getElementById("LabResID");
    if (!select) {
        console.error('LabResID select not found');
        return;
    }


    const options = labOrders.map(r => `
        <option value="${r.LabResID}" data-patient="${r.PatientID}" data-doctor="${r.DoctorID}" data-testtype="${r.TestType}">
            ${r.TestType} - Patient ID: ${r.PatientID} (${new Date(r.TestDate).toLocaleDateString()})
        </option>`).join("");


    select.innerHTML = '<option value="">-- Select Lab Order --</option>' + options;
   
    // Add change event listener
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('PatientID_Lab').value = selectedOption.dataset.patient;
            document.getElementById('DoctorID_Lab').value = selectedOption.dataset.doctor;
            document.getElementById('TestType_Conduct').value = selectedOption.dataset.testtype;
        }
    });
}


// Allow inline onclick handler to work properly
function selectLabOrder(labResID, patientID, doctorID, testType) {
    console.log('Lab order selected:', labResID);
   
    document.getElementById("LabResID").value = labResID;
    document.getElementById("PatientID_Lab").value = patientID;
    document.getElementById("DoctorID_Lab").value = doctorID;
    document.getElementById("TestType_Conduct").value = testType;
   
    // Scroll to form
    document.getElementById('labResultForm').scrollIntoView({ behavior: 'smooth' });
}
window.selectLabOrder = selectLabOrder;
console.log('=== nurse-script.js loaded ===');