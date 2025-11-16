// Patient Dashboard Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as patient
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'patient' && !userRole) {
        // In production, backend will handle authentication
        console.log('Patient dashboard loaded');
    }
    
    // Initialize dashboard
    loadPrimaryDoctor();
    loadAppointments();
    loadLabResults();
    loadTreatmentHistory();
    
    // Setup appointment form
    setupAppointmentForm();
});

// Load primary doctor information
function loadPrimaryDoctor() {
    // This will be replaced with API call to backend
    const primaryDoctorInfo = document.getElementById('primaryDoctorInfo');
    
    // Simulated data structure (will come from backend)
    const doctorData = {
        DoctorID: null,
        FName: '',
        LName: '',
        Specialization: '',
        Email: '',
        PhoneNo: ''
    };
    
    // Display structure (backend will populate)
    primaryDoctorInfo.innerHTML = `
        <div class="info-item">
            <strong>Doctor Name:</strong> <span id="PrimaryDocName">Not assigned</span>
        </div>
        <div class="info-item">
            <strong>Specialization:</strong> <span id="PrimaryDocSpecialization">-</span>
        </div>
        <div class="info-item">
            <strong>Contact:</strong> <span id="PrimaryDocContact">-</span>
        </div>
    `;
    
    // TODO: Replace with actual API call
    // fetch('/api/patient/primary-doctor')
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById('PrimaryDocName').textContent = 
    //             `${data.FName} ${data.LName}`;
    //         document.getElementById('PrimaryDocSpecialization').textContent = 
    //             data.Specialization || 'N/A';
    //         document.getElementById('PrimaryDocContact').textContent = 
    //             `${data.Email} | ${data.PhoneNo}`;
    //     })
    //     .catch(error => {
    //         console.error('Error loading primary doctor:', error);
    //     });
}

// Load appointments
function loadAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    const tbody = appointmentsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/patient/appointments')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="5">No appointments found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(appt => `
    //             <tr>
    //                 <td>${new Date(appt.ApptDateTime).toLocaleString()}</td>
    //                 <td>${appt.ApptReason}</td>
    //                 <td>${appt.DoctorName || 'N/A'}</td>
    //                 <td>${appt.IsCompleted ? 'Completed' : 'Pending'}</td>
    //                 <td>${appt.ApptNotes || '-'}</td>
    //             </tr>
    //         `).join('');
    //     })
    //     .catch(error => {
    //         console.error('Error loading appointments:', error);
    //     });
}

// Load lab results
function loadLabResults() {
    const labResultsTable = document.getElementById('labResultsTable');
    const tbody = labResultsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/patient/lab-results')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="4">No lab results found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(result => `
    //             <tr>
    //                 <td>${new Date(result.TestDate).toLocaleDateString()}</td>
    //                 <td>${result.TestType}</td>
    //                 <td>${result.ResultNotes || '-'}</td>
    //                 <td>${result.DoctorName || 'N/A'}</td>
    //             </tr>
    //         `).join('');
    //     })
    //     .catch(error => {
    //         console.error('Error loading lab results:', error);
    //     });
}

// Load treatment history
function loadTreatmentHistory() {
    const treatmentTable = document.getElementById('treatmentTable');
    const tbody = treatmentTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/patient/treatments')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="4">No treatment history found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(treatment => `
    //             <tr>
    //                 <td>${treatment.TreatmentType}</td>
    //                 <td>${new Date(treatment.StartDate).toLocaleDateString()}</td>
    //                 <td>${treatment.EndDate ? new Date(treatment.EndDate).toLocaleDateString() : 'Ongoing'}</td>
    //                 <td>${treatment.DoctorName || 'N/A'}</td>
    //             </tr>
    //         `).join('');
    //     })
    //     .catch(error => {
    //         console.error('Error loading treatment history:', error);
    //     });
}

// Setup appointment booking form
function setupAppointmentForm() {
    const appointmentForm = document.getElementById('appointmentForm');
    
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm('appointmentForm')) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            // Collect form data
            const formData = {
                ApptReason: document.getElementById('ApptReason').value,
                ApptDateTime: document.getElementById('ApptDateTime').value,
                ApptNotes: document.getElementById('ApptNotes').value,
                DoctorID: document.getElementById('DoctorID').value,
                PatientID: sessionStorage.getItem('patientID') // Will be set by backend
            };
            
            // TODO: Replace with actual API call
            // fetch('/api/patient/appointments', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showMessage('Appointment booked successfully!', 'success');
            //     appointmentForm.reset();
            //     loadAppointments();
            // })
            // .catch(error => {
            //     showMessage('Error booking appointment. Please try again.', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulated success for now
            console.log('Appointment data to be sent:', formData);
            showMessage('Appointment booking will be processed by backend', 'success');
            appointmentForm.reset();
        });
    }
}

// Helper function from main script
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

