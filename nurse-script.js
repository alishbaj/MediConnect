// Nurse Dashboard Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as nurse
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'nurse' && !userRole) {
        // In production, backend will handle authentication
        console.log('Nurse dashboard loaded');
    }
    
    // Initialize dashboard
    loadNurseInfo();
    loadPendingLabResults();
    loadCompletedLabResults();
    
    // Setup lab result form
    setupLabResultForm();
});

// Load nurse information
function loadNurseInfo() {
    // TODO: Replace with actual API call
    // fetch('/api/nurse/info')
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById('ShiftType').textContent = data.ShiftType || 'N/A';
    //         document.getElementById('Ward').textContent = data.Ward || 'N/A';
    //     })
    //     .catch(error => {
    //         console.error('Error loading nurse info:', error);
    //     });
    
    // Simulated display
    document.getElementById('ShiftType').textContent = 'Loading...';
    document.getElementById('Ward').textContent = 'Loading...';
}

// Load pending lab results
function loadPendingLabResults() {
    const pendingLabResultsTable = document.getElementById('pendingLabResultsTable');
    const tbody = pendingLabResultsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/nurse/pending-lab-results')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="5">No pending lab results found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(result => `
    //             <tr>
    //                 <td>${new Date(result.TestDate).toLocaleDateString()}</td>
    //                 <td>${result.TestType}</td>
    //                 <td>${result.PatientName || `Patient ID: ${result.PatientID}`}</td>
    //                 <td>${result.DoctorName || `Doctor ID: ${result.DoctorID}`}</td>
    //                 <td>
    //                     <button class="btn btn-primary" onclick="selectLabOrder(${result.LabResID}, ${result.PatientID}, ${result.DoctorID}, '${result.TestType}')">
    //                         Conduct Test
    //                     </button>
    //                 </td>
    //             </tr>
    //         `).join('');
    //         
    //         // Populate lab order dropdown
    //         populateLabOrderDropdown(data);
    //     })
    //     .catch(error => {
    //         console.error('Error loading pending lab results:', error);
    //     });
}

// Populate lab order dropdown
function populateLabOrderDropdown(labOrders) {
    const labOrderSelect = document.getElementById('LabResID');
    
    if (labOrderSelect) {
        const options = labOrders.map(order => 
            `<option value="${order.LabResID}" data-patient="${order.PatientID}" data-doctor="${order.DoctorID}" data-testtype="${order.TestType}">
                ${order.TestType} - Patient ID: ${order.PatientID} (${new Date(order.TestDate).toLocaleDateString()})
            </option>`
        ).join('');
        
        labOrderSelect.innerHTML = '<option value="">-- Select Lab Order --</option>' + options;
        
        // Add change event listener to populate form fields
        labOrderSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                document.getElementById('PatientID_Lab').value = selectedOption.dataset.patient;
                document.getElementById('DoctorID_Lab').value = selectedOption.dataset.doctor;
                document.getElementById('TestType_Conduct').value = selectedOption.dataset.testtype;
            }
        });
    }
}

// Select lab order for conducting
function selectLabOrder(labResID, patientID, doctorID, testType) {
    document.getElementById('LabResID').value = labResID;
    document.getElementById('PatientID_Lab').value = patientID;
    document.getElementById('DoctorID_Lab').value = doctorID;
    document.getElementById('TestType_Conduct').value = testType;
    
    // Scroll to form
    document.getElementById('labResultForm').scrollIntoView({ behavior: 'smooth' });
}

// Load completed lab results
function loadCompletedLabResults() {
    const completedLabResultsTable = document.getElementById('completedLabResultsTable');
    const tbody = completedLabResultsTable.querySelector('tbody');
    
    // TODO: Replace with actual API call
    // fetch('/api/nurse/completed-lab-results')
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.length === 0) {
    //             tbody.innerHTML = '<tr><td colspan="5">No completed lab results found</td></tr>';
    //             return;
    //         }
    //         
    //         tbody.innerHTML = data.map(result => `
    //             <tr>
    //                 <td>${new Date(result.TestDate).toLocaleDateString()}</td>
    //                 <td>${result.TestType}</td>
    //                 <td>${result.PatientName || `Patient ID: ${result.PatientID}`}</td>
    //                 <td>${result.ResultNotes || '-'}</td>
    //                 <td>${result.DoctorName || `Doctor ID: ${result.DoctorID}`}</td>
    //             </tr>
    //         `).join('');
    //     })
    //     .catch(error => {
    //         console.error('Error loading completed lab results:', error);
    //     });
}

// Setup lab result form
function setupLabResultForm() {
    const labResultForm = document.getElementById('labResultForm');
    
    if (labResultForm) {
        labResultForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm('labResultForm')) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            // Collect form data
            const formData = {
                LabResID: document.getElementById('LabResID').value,
                TestDate: document.getElementById('TestDate_Conduct').value,
                TestType: document.getElementById('TestType_Conduct').value,
                ResultNotes: document.getElementById('ResultNotes_Conduct').value,
                PatientID: document.getElementById('PatientID_Lab').value,
                DoctorID: document.getElementById('DoctorID_Lab').value,
                NurseID: sessionStorage.getItem('nurseID') // Will be set by backend
            };
            
            // TODO: Replace with actual API call
            // fetch('/api/nurse/lab-results', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showMessage('Lab results submitted successfully!', 'success');
            //     labResultForm.reset();
            //     loadPendingLabResults();
            //     loadCompletedLabResults();
            // })
            // .catch(error => {
            //     showMessage('Error submitting lab results. Please try again.', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulated success for now
            console.log('Lab result data to be sent:', formData);
            showMessage('Lab results will be processed by backend', 'success');
            labResultForm.reset();
        });
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

