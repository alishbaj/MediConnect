// Patient Dashboard Script
import { supabase } from './supabaseBrowser.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in as patient
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'patient' && !userRole) {
        console.log('Patient dashboard loaded');
    }
    
    // Fetch and store PatientID if not already in sessionStorage
    await fetchAndStorePatientID();
    
    // Initialize dashboard
    await loadPrimaryDoctor();
    await loadAppointments();
    await loadLabResults();
    await loadTreatmentHistory();
    
    // Setup appointment form
    setupAppointmentForm();
});

// Fetch PatientID from Supabase based on email
async function fetchAndStorePatientID() {
    // Check if PatientID is already stored
    const existingPatientID = sessionStorage.getItem('patientID');
    if (existingPatientID) {
        console.log('PatientID already in sessionStorage:', existingPatientID);
        return;
    }
    
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
        console.warn('User email not found in sessionStorage');
        // For testing: allow manual PatientID entry
        const testPatientID = prompt('PatientID not found. Enter PatientID for testing (or cancel):');
        if (testPatientID) {
            sessionStorage.setItem('patientID', testPatientID);
            console.log('PatientID set manually for testing:', testPatientID);
        }
        return;
    }
    
    try {
        // Query patient table to get PatientID by email
        const { data: patientData, error: patientError } = await supabase
            .from('patient')
            .select('PatientID')
            .eq('Email', userEmail)
            .single();
        
        if (patientError || !patientData) {
            console.error('Error fetching patient:', patientError);
            // For testing: allow manual PatientID entry
            const testPatientID = prompt('Could not find patient by email. Enter PatientID for testing (or cancel):');
            if (testPatientID) {
                sessionStorage.setItem('patientID', testPatientID);
                console.log('PatientID set manually for testing:', testPatientID);
            }
            return;
        }
        
        // Store the PatientID
        sessionStorage.setItem('patientID', patientData.PatientID.toString());
        console.log('PatientID stored:', patientData.PatientID);
    } catch (error) {
        console.error('Error fetching PatientID:', error);
        // For testing: allow manual PatientID entry
        const testPatientID = prompt('Error fetching PatientID. Enter PatientID for testing (or cancel):');
        if (testPatientID) {
            sessionStorage.setItem('patientID', testPatientID);
            console.log('PatientID set manually for testing:', testPatientID);
        }
    }
}

// Load primary doctor information
async function loadPrimaryDoctor() {
    const primaryDoctorInfo = document.getElementById('primaryDoctorInfo');
    
    try {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
            console.warn('PatientID not found in sessionStorage');
            primaryDoctorInfo.innerHTML = '<p>Please log in to view doctor information</p>';
            return;
        }

        // Get patient's PrimaryDocID
        const { data: patientData, error: patientError } = await supabase
            .from('patient')
            .select('PrimaryDocID')
            .eq('PatientID', patientID)
            .single();

        if (patientError || !patientData || !patientData.PrimaryDocID) {
            primaryDoctorInfo.innerHTML = `
                <div class="info-item">
                    <strong>Primary Doctor:</strong> Not assigned
                </div>
            `;
            return;
        }

        // Get doctor information from staff table
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('Fname, Minit, Lname, Email, PhoneNo')
            .eq('StaffID', patientData.PrimaryDocID)
            .single();

        if (staffError || !staffData) {
            console.error('Error fetching doctor info:', staffError);
            primaryDoctorInfo.innerHTML = `
                <div class="info-item">
                    <strong>Primary Doctor:</strong> Information unavailable
                </div>
            `;
            return;
        }

        // Get doctor specialization
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctor')
            .select('Specialization')
            .eq('DoctorID', patientData.PrimaryDocID)
            .single();

        const specialization = (doctorData && doctorData.Specialization) ? doctorData.Specialization : 'N/A';

        primaryDoctorInfo.innerHTML = `
            <div class="info-item">
                <strong>Doctor Name:</strong> ${staffData.Fname} ${staffData.Minit || ''} ${staffData.Lname}
            </div>
            <div class="info-item">
                <strong>Specialization:</strong> ${specialization}
            </div>
            <div class="info-item">
                <strong>Contact:</strong> ${staffData.Email} | ${staffData.PhoneNo}
            </div>
        `;

        // Store primary doctor ID for appointment form
        sessionStorage.setItem('primaryDoctorID', patientData.PrimaryDocID.toString());

    } catch (error) {
        console.error('Error loading primary doctor:', error);
        primaryDoctorInfo.innerHTML = `
            <div class="info-item">
                <strong>Primary Doctor:</strong> Error loading information
            </div>
        `;
    }
}

// Load appointments
async function loadAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    const tbody = appointmentsTable.querySelector('tbody');
    
    try {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
            console.warn('PatientID not found in sessionStorage');
            tbody.innerHTML = '<tr><td colspan="6">Please log in to view appointments</td></tr>';
            return;
        }

        const { data, error } = await supabase
            .from('appointment')
            .select('AppointmentID, ApptDateTime, ApptReason, ApptNotes, IsCompleted, DoctorID')
            .eq('PatientID', patientID)
            .order('ApptDateTime', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No appointments found</td></tr>';
            return;
        }

        // Fetch doctor names separately
        const doctorIDs = [...new Set(data.map(appt => appt.DoctorID).filter(id => id))];
        let doctorsMap = {};
        
        if (doctorIDs.length > 0) {
            const { data: doctors, error: doctorsError } = await supabase
                .from('staff')
                .select('StaffID, Fname, Lname')
                .in('StaffID', doctorIDs);
            
            if (!doctorsError && doctors) {
                doctorsMap = doctors.reduce((acc, d) => {
                    acc[d.StaffID] = `Dr. ${d.Fname} ${d.Lname}`;
                    return acc;
                }, {});
            }
        }

        tbody.innerHTML = data.map(appt => {
            const doctorName = doctorsMap[appt.DoctorID] || 'N/A';
            
            return `
                <tr>
                    <td>${appt.ApptDateTime ? new Date(appt.ApptDateTime).toLocaleString() : 'N/A'}</td>
                    <td>${appt.ApptReason || '-'}</td>
                    <td>${doctorName}</td>
                    <td>${appt.IsCompleted ? 'Completed' : 'Pending'}</td>
                    <td>${appt.ApptNotes || '-'}</td>
                    <td>
                        ${!appt.IsCompleted ? `
                            <button class="btn btn-danger" onclick="cancelAppointment(${appt.AppointmentID})">
                                Cancel
                            </button>
                        ` : '-'}
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

// Cancel appointment
async function cancelAppointment(appointmentID) {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to cancel this appointment? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User clicked "Cancel" - do nothing
    }
    
    try {
        // Delete the appointment from the database
        const { error } = await supabase
            .from('appointment')
            .delete()
            .eq('AppointmentID', appointmentID);

        if (error) {
            throw error;
        }

        showMessage('Appointment cancelled successfully', 'success');
        
        // Reload appointments to reflect the change
        await loadAppointments();

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showMessage('Error cancelling appointment. Please try again.', 'error');
    }
}

// Make cancelAppointment available globally for onclick handlers
window.cancelAppointment = cancelAppointment;

// Load lab results
async function loadLabResults() {
    const labResultsTable = document.getElementById('labResultsTable');
    const tbody = labResultsTable.querySelector('tbody');
    
    try {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
            console.warn('PatientID not found in sessionStorage');
            tbody.innerHTML = '<tr><td colspan="4">Please log in to view lab results</td></tr>';
            return;
        }

        const { data, error } = await supabase
            .from('lab_results')
            .select('LabResID, TestDate, TestType, ResultNotes, DoctorID')
            .eq('PatientID', patientID)
            .order('TestDate', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No lab results found</td></tr>';
            return;
        }

        // Fetch doctor names separately
        const doctorIDs = [...new Set(data.map(result => result.DoctorID).filter(id => id))];
        let doctorsMap = {};
        
        if (doctorIDs.length > 0) {
            const { data: doctors, error: doctorsError } = await supabase
                .from('staff')
                .select('StaffID, Fname, Lname')
                .in('StaffID', doctorIDs);
            
            if (!doctorsError && doctors) {
                doctorsMap = doctors.reduce((acc, d) => {
                    acc[d.StaffID] = `Dr. ${d.Fname} ${d.Lname}`;
                    return acc;
                }, {});
            }
        }

        tbody.innerHTML = data.map(result => {
            const doctorName = doctorsMap[result.DoctorID] || 'N/A';
            
            return `
                <tr>
                    <td>${result.TestDate ? new Date(result.TestDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${result.TestType || '-'}</td>
                    <td>${result.ResultNotes || '-'}</td>
                    <td>${doctorName}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading lab results:', error);
        showMessage('Error loading lab results. Please try again.', 'error');
        tbody.innerHTML = '<tr><td colspan="4">Error loading lab results</td></tr>';
    }
}

// Load treatment history
async function loadTreatmentHistory() {
    const treatmentTable = document.getElementById('treatmentTable');
    const tbody = treatmentTable.querySelector('tbody');
    
    try {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
            console.warn('PatientID not found in sessionStorage');
            tbody.innerHTML = '<tr><td colspan="4">Please log in to view treatment history</td></tr>';
            return;
        }

        const { data, error } = await supabase
            .from('treatment')
            .select('TreatmentID, TreatmentType, StartDate, EndDate, DoctorID')
            .eq('PatientID', patientID)
            .order('StartDate', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No treatment history found</td></tr>';
            return;
        }

        // Fetch doctor names separately
        const doctorIDs = [...new Set(data.map(treatment => treatment.DoctorID).filter(id => id))];
        let doctorsMap = {};
        
        if (doctorIDs.length > 0) {
            const { data: doctors, error: doctorsError } = await supabase
                .from('staff')
                .select('StaffID, Fname, Lname')
                .in('StaffID', doctorIDs);
            
            if (!doctorsError && doctors) {
                doctorsMap = doctors.reduce((acc, d) => {
                    acc[d.StaffID] = `Dr. ${d.Fname} ${d.Lname}`;
                    return acc;
                }, {});
            }
        }

        tbody.innerHTML = data.map(treatment => {
            const doctorName = doctorsMap[treatment.DoctorID] || 'N/A';
            
            return `
                <tr>
                    <td>${treatment.TreatmentType || '-'}</td>
                    <td>${treatment.StartDate ? new Date(treatment.StartDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${treatment.EndDate ? new Date(treatment.EndDate).toLocaleDateString() : 'Ongoing'}</td>
                    <td>${doctorName}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading treatment history:', error);
        showMessage('Error loading treatment history. Please try again.', 'error');
        tbody.innerHTML = '<tr><td colspan="4">Error loading treatment history</td></tr>';
    }
}

// Setup appointment booking form
function setupAppointmentForm() {
    const appointmentForm = document.getElementById('appointmentForm');
    
    if (appointmentForm) {
        // Load available doctors for the dropdown
        loadDoctorsDropdown();
        
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm('appointmentForm')) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            const patientID = sessionStorage.getItem('patientID');
            if (!patientID) {
                showMessage('Patient ID not found. Please log in again.', 'error');
                return;
            }
            
            // Collect form data
            const formData = {
                ApptReason: document.getElementById('ApptReason').value,
                ApptDateTime: document.getElementById('ApptDateTime').value,
                ApptNotes: document.getElementById('ApptNotes').value || null,
                DoctorID: parseInt(document.getElementById('DoctorID').value),
                PatientID: parseInt(patientID),
                IsCompleted: false
            };
            
            try {
                const { data, error } = await supabase
                    .from('appointment')
                    .insert([formData])
                    .select();

                if (error) {
                    throw error;
                }

                // Get doctor name for confirmation
                const doctorID = formData.DoctorID;
                const { data: staffData } = await supabase
                    .from('staff')
                    .select('Fname, Lname')
                    .eq('StaffID', doctorID)
                    .single();

                const doctorName = staffData ? `Dr. ${staffData.Fname} ${staffData.Lname}` : 'your selected doctor';
                const appointmentDate = new Date(formData.ApptDateTime).toLocaleString();

                showMessage(`✓ Appointment booked successfully with ${doctorName} on ${appointmentDate}!`, 'success');
                appointmentForm.reset();
                await loadAppointments();

            } catch (error) {
                console.error('Error booking appointment:', error);
                showMessage('Error booking appointment. Please try again.', 'error');
            }
        });
    }
}

// Load doctors for appointment dropdown
async function loadDoctorsDropdown() {
    const doctorSelect = document.getElementById('DoctorID');
    if (!doctorSelect) return;

    try {
        // Get all doctor IDs
        const { data: doctors, error: doctorsError } = await supabase
            .from('doctor')
            .select('DoctorID, Specialization');

        if (doctorsError) {
            throw doctorsError;
        }

        if (!doctors || doctors.length === 0) {
            doctorSelect.innerHTML = '<option value="">-- No doctors available --</option>';
            return;
        }

        // Get staff info for these doctors
        const doctorIDs = doctors.map(d => d.DoctorID);
        const { data: staff, error: staffError } = await supabase
            .from('staff')
            .select('StaffID, Fname, Lname')
            .in('StaffID', doctorIDs);

        if (staffError) {
            throw staffError;
        }

        // Create a map of doctor info
        const doctorsMap = doctors.reduce((acc, d) => {
            const staffInfo = staff.find(s => s.StaffID === d.DoctorID);
            if (staffInfo) {
                acc[d.DoctorID] = {
                    name: `Dr. ${staffInfo.Fname} ${staffInfo.Lname}`,
                    specialization: d.Specialization || 'General'
                };
            }
            return acc;
        }, {});

        // Populate dropdown
        const options = Object.entries(doctorsMap).map(([id, info]) =>
            `<option value="${id}">${info.name} - ${info.specialization}</option>`
        ).join('');

        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + options;

        // Pre-select primary doctor if available
        const primaryDoctorID = sessionStorage.getItem('primaryDoctorID');
        if (primaryDoctorID && doctorsMap[primaryDoctorID]) {
            doctorSelect.value = primaryDoctorID;
        }

    } catch (error) {
        console.error('Error loading doctors:', error);
        doctorSelect.innerHTML = '<option value="">-- Error loading doctors --</option>';
    }
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