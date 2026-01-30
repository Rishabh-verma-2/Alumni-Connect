// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Role Selection
const roleButtons = document.querySelectorAll('.role-btn');
const roleSpecificFields = document.getElementById('roleSpecificFields');
let selectedRole = '';

roleButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        roleButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        selectedRole = button.dataset.role;
        
        // Show role-specific fields
        showRoleSpecificFields(selectedRole);
    });
});

function showRoleSpecificFields(role) {
    let fieldsHTML = '';
    
    switch(role) {
        case 'alumni':
            fieldsHTML = `
                <div class="role-fields">
                    <h3>Alumni Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="enrollmentNumber">Enrollment Number *</label>
                            <input type="text" id="enrollmentNumber" name="enrollmentNumber" required>
                        </div>
                        <div class="form-group">
                            <label for="department">Department / Course *</label>
                            <input type="text" id="department" name="department" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="admissionYear">Year of Admission *</label>
                            <input type="number" id="admissionYear" name="admissionYear" min="1990" max="2030" required>
                        </div>
                        <div class="form-group">
                            <label for="passingYear">Year of Passing *</label>
                            <input type="number" id="passingYear" name="passingYear" min="1990" max="2030" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profession">Current Profession / Company</label>
                            <input type="text" id="profession" name="profession">
                        </div>
                        <div class="form-group">
                            <label for="linkedin">LinkedIn Profile</label>
                            <input type="url" id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/yourprofile">
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'student':
            fieldsHTML = `
                <div class="role-fields">
                    <h3>Student Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="enrollmentNumber">Enrollment Number *</label>
                            <input type="text" id="enrollmentNumber" name="enrollmentNumber" required>
                        </div>
                        <div class="form-group">
                            <label for="collegeEmail">College Email *</label>
                            <input type="email" id="collegeEmail" name="collegeEmail" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="course">Course & Year *</label>
                            <input type="text" id="course" name="course" placeholder="e.g., B.Tech CSE, 2nd Year" required>
                        </div>
                        <div class="form-group">
                            <label for="department">Department *</label>
                            <input type="text" id="department" name="department" required>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'faculty':
            fieldsHTML = `
                <div class="role-fields">
                    <h3>Faculty Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="facultyId">Faculty ID / Employee ID *</label>
                            <input type="text" id="facultyId" name="facultyId" required>
                        </div>
                        <div class="form-group">
                            <label for="collegeEmail">College Email *</label>
                            <input type="email" id="collegeEmail" name="collegeEmail" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="department">Department *</label>
                            <input type="text" id="department" name="department" required>
                        </div>
                        <div class="form-group">
                            <label for="designation">Designation *</label>
                            <input type="text" id="designation" name="designation" placeholder="e.g., Professor, Associate Professor" required>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'aspirant':
            fieldsHTML = `
                <div class="role-fields">
                    <h3>Aspirant Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="interestArea">Interest Area *</label>
                            <select id="interestArea" name="interestArea" required>
                                <option value="">Select Interest Area</option>
                                <option value="engineering">Engineering</option>
                                <option value="management">Management</option>
                                <option value="arts">Arts</option>
                                <option value="science">Science</option>
                                <option value="commerce">Commerce</option>
                                <option value="medical">Medical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="preferredCourse">Preferred Course *</label>
                            <input type="text" id="preferredCourse" name="preferredCourse" placeholder="e.g., B.Tech Computer Science" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City *</label>
                            <input type="text" id="city" name="city" required>
                        </div>
                        <div class="form-group">
                            <label for="state">State *</label>
                            <input type="text" id="state" name="state" required>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    roleSpecificFields.innerHTML = fieldsHTML;
}

// Captcha Generation
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const question = `${num1} + ${num2} = ?`;
    document.getElementById('captchaQuestion').textContent = question;
    return num1 + num2;
}

let captchaAnswer = generateCaptcha();

// Form Submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate role selection
    if (!selectedRole) {
        alert('Please select your role first.');
        return;
    }
    
    // Validate password match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    // Validate captcha
    const userCaptchaAnswer = parseInt(document.getElementById('captchaAnswer').value);
    if (userCaptchaAnswer !== captchaAnswer) {
        alert('Incorrect captcha answer. Please try again.');
        captchaAnswer = generateCaptcha();
        document.getElementById('captchaAnswer').value = '';
        return;
    }
    
    // Validate terms checkbox
    if (!document.getElementById('terms').checked) {
        alert('Please agree to the Terms & Conditions and Privacy Policy.');
        return;
    }
    
    // Simulate account creation
    const submitBtn = document.querySelector('.btn-create-account');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert(`Account created successfully as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}!`);
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
        // Reset form
        document.getElementById('signupForm').reset();
        roleSpecificFields.innerHTML = '';
        roleButtons.forEach(btn => btn.classList.remove('active'));
        selectedRole = '';
        captchaAnswer = generateCaptcha();
    }, 2000);
});

// Auth Buttons
document.querySelector('.btn-login').addEventListener('click', () => {
    alert('Login functionality - Feature coming soon!');
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

console.log('Signup page loaded successfully!');