// Doctor Dashboard Script
import { supabase } from './supabaseBrowser.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in as doctor
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'doctor' && !userRole) {
        // In production, backend will handle authentication
        console.log('Doctor dashboard loaded');
    }
    // Fetch and store DoctorID if not already in sessionStorage
    await fetchAndStoreDoctorID();
   
    // Initialize dashboard
    await loadPatients();
    await loadAppointments();
   
    // Setup forms
    setupLabOrderForm();
    setupTreatmentForm();

    // 🔹 modal close handler – KEEP THIS, no extra DOMContentLoaded
    const closeBtn = document.getElementById('modalClose');
    const modal = document.getElementById('patientModal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
});


// Fetch DoctorID from Supabase based on email
async function fetchAndStoreDoctorID() {
    // Check if DoctorID is already stored
    const existingDoctorID = sessionStorage.getItem('doctorID');
    if (existingDoctorID) {
        console.log('DoctorID already in sessionStorage:', existingDoctorID);
        return;
    }
   
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
        console.warn('User email not found in sessionStorage');
        // For testing: allow manual DoctorID entry
        const testDoctorID = prompt('DoctorID not found. Enter DoctorID for testing (or cancel):');
        if (testDoctorID) {
            sessionStorage.setItem('doctorID', testDoctorID);
            console.log('DoctorID set manually for testing:', testDoctorID);
        }
        return;
    }
   
    try {
        // Query staff table to get StaffID by email
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('StaffID')
            .eq('Email', userEmail)
            .single();
       
        if (staffError || !staffData) {
            console.error('Error fetching staff:', staffError);
            // For testing: allow manual DoctorID entry
            const testDoctorID = prompt('Could not find doctor by email. Enter DoctorID for testing (or cancel):');
            if (testDoctorID) {
                sessionStorage.setItem('doctorID', testDoctorID);
                console.log('DoctorID set manually for testing:', testDoctorID);
            }
            return;
        }
       
        // Verify the StaffID exists in doctor table (DoctorID references StaffID)
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctor')
            .select('DoctorID')
            .eq('DoctorID', staffData.StaffID)
            .single();
       
        if (doctorError || !doctorData) {
            console.error('Staff member is not a doctor:', doctorError);
            // Still store the StaffID as DoctorID for testing
            sessionStorage.setItem('doctorID', staffData.StaffID.toString());
            console.log('Using StaffID as DoctorID:', staffData.StaffID);
            return;
        }
       
        // Store the DoctorID (which equals StaffID)
        sessionStorage.setItem('doctorID', staffData.StaffID.toString());
        console.log('DoctorID stored:', staffData.StaffID);
    } catch (error) {
        console.error('Error fetching DoctorID:', error);
        // For testing: allow manual DoctorID entry
        const testDoctorID = prompt('Error fetching DoctorID. Enter DoctorID for testing (or cancel):');
        if (testDoctorID) {
            sessionStorage.setItem('doctorID', testDoctorID);
            console.log('DoctorID set manually for testing:', testDoctorID);
        }
    }
}

// Load all patients assigned to this doctor
async function loadPatients() {
    const patientsTable = document.getElementById('patientsTable');
    const tbody = patientsTable.querySelector('tbody');
   
    try {
        const doctorID = sessionStorage.getItem('doctorID');
        if (!doctorID) {
            console.warn('DoctorID not found in sessionStorage');
            tbody.innerHTML = '<tr><td colspan="7">Please log in to view patients</td></tr>';
            return;
        }


        const { data, error } = await supabase
            .from('patient')
            .select('PatientID, Fname, Minit, Lname, Email, PhoneNo, DOB, Insurance')
            .eq('PrimaryDocID', doctorID)
            .order('PatientID');
       
        if (error) {
            throw error;
        }
       
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No patients assigned to you</td></tr>';
            return;
        }
       
        tbody.innerHTML = data.map(patient => `
            <tr>
                <td>${patient.PatientID}</td>
                <td>${patient.Fname} ${patient.Minit || ''} ${patient.Lname}</td>
                <td>${patient.Email || 'N/A'}</td>
                <td>${patient.PhoneNo || 'N/A'}</td>
                <td>${patient.DOB ? new Date(patient.DOB).toLocaleDateString() : 'N/A'}</td>
                <td>${patient.Insurance || 'N/A'}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewPatientDetails(${patient.PatientID})">
                        View Details
                    </button>
                </td>
            </tr>
        `).join('');
       
        // Populate patient dropdowns
        populatePatientDropdowns(data);
    } catch (error) {
        console.error('Error loading patients:', error);
        showMessage('Error loading patients. Please try again.', 'error');
        tbody.innerHTML = '<tr><td colspan="7">Error loading patients</td></tr>';
    }
}

// Populate patient dropdowns in forms
function populatePatientDropdowns(patients) {
    const labOrderSelect = document.getElementById('PatientID');
    const treatmentSelect = document.getElementById('PatientID_Treatment');
   
    const options = patients.map(patient =>
        `<option value="${patient.PatientID}">${patient.Fname} ${patient.Lname} (ID: ${patient.PatientID})</option>`
    ).join('');
   
    if (labOrderSelect) {
        labOrderSelect.innerHTML = '<option value="">-- Select Patient --</option>' + options;
    }
   
    if (treatmentSelect) {
        treatmentSelect.innerHTML = '<option value="">-- Select Patient --</option>' + options;
    }
}

// Load assigned appointments
async function loadAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    const tbody = appointmentsTable.querySelector('tbody');
   
    try {
        const doctorID = sessionStorage.getItem('doctorID');
        if (!doctorID) {
            console.warn('DoctorID not found in sessionStorage');
            tbody.innerHTML = '<tr><td colspan="6">Please log in to view appointments</td></tr>';
            return;
        }


        const { data, error } = await supabase
            .from('appointment')
            .select(`
                AppointmentID,
                ApptDateTime,
                ApptReason,
                ApptNotes,
                IsCompleted,
                PatientID
            `)
            .eq('DoctorID', doctorID)
            .order('ApptDateTime', { ascending: true });


        if (error) {
            throw error;
        }


        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No appointments found</td></tr>';
            return;
        }


        // Fetch patient names separately
        const patientIDs = [...new Set(data.map(appt => appt.PatientID).filter(id => id))];
        let patientsMap = {};
       
        if (patientIDs.length > 0) {
            const { data: patients, error: patientsError } = await supabase
                .from('patient')
                .select('PatientID, Fname, Lname')
                .in('PatientID', patientIDs);
           
            if (!patientsError && patients) {
                patientsMap = patients.reduce((acc, p) => {
                    acc[p.PatientID] = `${p.Fname} ${p.Lname}`;
                    return acc;
                }, {});
            }
        }


        tbody.innerHTML = data.map(appt => {
            const patientName = patientsMap[appt.PatientID] || `Patient ID: ${appt.PatientID}`;
           
            return `
                <tr>
                    <td>${appt.ApptDateTime ? new Date(appt.ApptDateTime).toLocaleString() : 'N/A'}</td>
                    <td>${patientName}</td>
                    <td>${appt.ApptReason || '-'}</td>
                    <td>${appt.IsCompleted ? 'Completed' : 'Pending'}</td>
                    <td>${appt.ApptNotes || '-'}</td>
                    <td>
                        ${!appt.IsCompleted ? `
                            <button class="btn btn-success" onclick="completeAppointment(${appt.AppointmentID})">
                                Complete
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
        showMessage('Error loading appointments. Please try again.', 'error');
        tbody.innerHTML = '<tr><td colspan="6">Error loading appointments</td></tr>';
    }
}

// Setup lab order form
function setupLabOrderForm() {
    const labOrderForm = document.getElementById('labOrderForm');
   
    if (labOrderForm) {
        labOrderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
           
            if (!validateForm('labOrderForm')) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
           
            // Collect form data
            const formData = {
                PatientID: document.getElementById('PatientID').value,
                TestType: document.getElementById('TestType').value,
                TestDate: document.getElementById('TestDate').value,
                ResultNotes: document.getElementById('ResultNotes').value,
                DoctorID: sessionStorage.getItem('doctorID') // Will be set by backend
            };
           
            try {
                const doctorID = sessionStorage.getItem('doctorID');
                if (!doctorID) {
                    showMessage('Doctor ID not found. Please log in again.', 'error');
                    return;
                }

                // Prepare data for Supabase insert
                // Note: LabResID is auto-generated, NurseID can be null initially
                const labOrderData = {
                    PatientID: parseInt(formData.PatientID),
                    DoctorID: parseInt(doctorID),
                    TestType: formData.TestType,
                    TestDate: formData.TestDate,
                    ResultNotes: formData.ResultNotes || null,
                    NurseID: null // Will be assigned when nurse conducts the test
                };

                const { data, error } = await supabase
                    .from('lab_results')
                    .insert([labOrderData])
                    .select();

                if (error) {
                    throw error;
                }

                showMessage('Lab test ordered successfully!', 'success');
                labOrderForm.reset();
            } catch (error) {
                console.error('Error ordering lab test:', error);
                showMessage('Error ordering lab test. Please try again.', 'error');
            }
        });
    }
}

// Setup treatment form
function setupTreatmentForm() {
    const treatmentForm = document.getElementById('treatmentForm');
   
    if (treatmentForm) {
        treatmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
           
            if (!validateForm('treatmentForm')) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
           
            // Validate dates
            const startDate = new Date(document.getElementById('StartDate').value);
            const endDate = document.getElementById('EndDate').value ?
                new Date(document.getElementById('EndDate').value) : null;
           
            if (endDate && endDate < startDate) {
                showMessage('End date must be after start date', 'error');
                return;
            }
           
            // Collect form data
            const formData = {
                PatientID: document.getElementById('PatientID_Treatment').value,
                TreatmentType: document.getElementById('TreatmentType').value,
                StartDate: document.getElementById('StartDate').value,
                EndDate: document.getElementById('EndDate').value || null,
                DoctorID: sessionStorage.getItem('doctorID') // Will be set by backend
            };
           
            try {
                const doctorID = sessionStorage.getItem('doctorID');
                if (!doctorID) {
                    showMessage('Doctor ID not found. Please log in again.', 'error');
                    return;
                }


                // Prepare data for Supabase insert
                const treatmentData = {
                    PatientID: parseInt(formData.PatientID),
                    DoctorID: parseInt(doctorID),
                    TreatmentType: formData.TreatmentType,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate || null
                };

                const { data, error } = await supabase
                    .from('treatment')
                    .insert([treatmentData])
                    .select();

                if (error) {
                    throw error;
                }

                showMessage('Treatment added successfully!', 'success');
                treatmentForm.reset();
            } catch (error) {
                console.error('Error adding treatment:', error);
                showMessage('Error adding treatment. Please try again.', 'error');
            }
        });
    }
}

// Complete appointment
async function completeAppointment(appointmentID) {
    try {
        const { data, error } = await supabase
            .from('appointment')
            .update({ IsCompleted: true })
            .eq('AppointmentID', appointmentID)
            .select();

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            showMessage('Appointment marked as completed!', 'success');
            await loadAppointments();
        } else {
            showMessage('Appointment not found.', 'error');
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        showMessage('Error completing appointment. Please try again.', 'error');
    }
}

// Make completeAppointment available globally for onclick handlers
window.completeAppointment = completeAppointment;

// View patient details
async function viewPatientDetails(patientID) {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('PatientID, Fname, Lname, Email, PhoneNo, DOB, Insurance')
      .eq('PatientID', patientID)
      .single();

    if (error) throw error;

    // fill modal fields
    document.getElementById('modalName').textContent = data.Fname + " " + data.Lname;
    document.getElementById('modalEmail').textContent = data.Email || "N/A";
    document.getElementById('modalPhone').textContent = data.PhoneNo || "N/A";
    document.getElementById('modalDOB').textContent = data.DOB ? new Date(data.DOB).toLocaleDateString() : "N/A";
    document.getElementById('modalInsurance').textContent = data.Insurance || "N/A";

    // show modal
    document.getElementById('patientModal').classList.remove('hidden');
   
  } catch (err) {
    console.error("modal error:", err);
    showMessage("could not load patient details", "error");
  }
}

window.viewPatientDetails = viewPatientDetails;

const closeBtn = document.getElementById('modalClose');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    document.getElementById('patientModal').classList.add('hidden');
  });
}





// Helper functions
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
   
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
       
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
   
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
   
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });
   
    return isValid;
}