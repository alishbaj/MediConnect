// Doctor Dashboard Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as doctor
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'doctor' && !userRole) {
        // In production, backend will handle authentication
        console.log('Doctor dashboard loaded');
    }
    
    // Initialize dashboard
    loadPatients();
    loadAppointments();
    
    // Setup forms
    setupLabOrderForm();
    setupTreatmentForm();
});

// Load all patients
function loadPatients() {
    const patientsTable = document.getElementById('patientsTable');
    const tbody = patientsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/doctor/patients')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="7">No patients found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(patient => `
    //             <tr>
    //                 <td>${patient.PatientID}</td>
    //                 <td>${patient.Fname} ${patient.Minit || ''} ${patient.Lname}</td>
    //                 <td>${patient.Email}</td>
    //                 <td>${patient.PhoneNo}</td>
    //                 <td>${new Date(patient.DOB).toLocaleDateString()}</td>
    //                 <td>${patient.Insurance || 'N/A'}</td>
    //                 <td>
    //                     <button class="btn btn-primary" onclick="viewPatientDetails(${patient.PatientID})">
    //                         View Details
    //                     </button>
    //                 </td>
    //             </tr>
    //         `).join('');
    //         
    //         // Populate patient dropdowns
    //         populatePatientDropdowns(data);
    //     })
    //     .catch(error => {
    //         console.error('Error loading patients:', error);
    //     });
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
function loadAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    const tbody = appointmentsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/doctor/appointments')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="6">No appointments found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(appt => `
    //             <tr>
    //                 <td>${new Date(appt.ApptDateTime).toLocaleString()}</td>
    //                 <td>${appt.PatientName || 'N/A'}</td>
    //                 <td>${appt.ApptReason}</td>
    //                 <td>${appt.IsCompleted ? 'Completed' : 'Pending'}</td>
    //                 <td>${appt.ApptNotes || '-'}</td>
    //                 <td>
    //                     ${!appt.IsCompleted ? `
    //                         <button class="btn btn-success" onclick="completeAppointment(${appt.AppointmentID})">
    //                             Complete
    //                         </button>
    //                     ` : ''}
    //                 </td>
    //             </tr>
    //         `).join('');
    //     })
    //     .catch(error => {
    //         console.error('Error loading appointments:', error);
    //     });
}

// Setup lab order form
function setupLabOrderForm() {
    const labOrderForm = document.getElementById('labOrderForm');
    
    if (labOrderForm) {
        labOrderForm.addEventListener('submit', function(e) {
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
            
            // TODO: Replace with actual API call
            // fetch('/api/doctor/lab-orders', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showMessage('Lab test ordered successfully!', 'success');
            //     labOrderForm.reset();
            // })
            // .catch(error => {
            //     showMessage('Error ordering lab test. Please try again.', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulated success for now
            console.log('Lab order data to be sent:', formData);
            showMessage('Lab order will be processed by backend', 'success');
            labOrderForm.reset();
        });
    }
}

// Setup treatment form
function setupTreatmentForm() {
    const treatmentForm = document.getElementById('treatmentForm');
    
    if (treatmentForm) {
        treatmentForm.addEventListener('submit', function(e) {
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
            
            // TODO: Replace with actual API call
            // fetch('/api/doctor/treatments', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showMessage('Treatment added successfully!', 'success');
            //     treatmentForm.reset();
            // })
            // .catch(error => {
            //     showMessage('Error adding treatment. Please try again.', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulated success for now
            console.log('Treatment data to be sent:', formData);
            showMessage('Treatment will be processed by backend', 'success');
            treatmentForm.reset();
        });
    }
}

// Complete appointment
function completeAppointment(appointmentID) {
    // TODO: Replace with actual API call
    // fetch(`/api/doctor/appointments/${appointmentID}/complete`, {
    //     method: 'PUT',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     showMessage('Appointment marked as completed!', 'success');
    //     loadAppointments();
    // })
    // .catch(error => {
    //     showMessage('Error completing appointment. Please try again.', 'error');
    //     console.error('Error:', error);
    // });
    
    console.log('Completing appointment:', appointmentID);
    showMessage('Appointment completion will be processed by backend', 'success');
}

// View patient details
function viewPatientDetails(patientID) {
    // TODO: Implement patient details modal or navigation
    console.log('Viewing patient details:', patientID);
    alert(`Patient details for ID ${patientID} will be displayed here`);
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

