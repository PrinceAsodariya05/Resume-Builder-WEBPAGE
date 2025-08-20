// Resume Builder - Core JavaScript Functionality

class ResumeBuilder {
    constructor() {
        this.resumeData = {
            personal: {
                fullName: '',
                jobTitle: '',
                email: '',
                phone: '',
                location: '',
                website: ''
            },
            summary: '',
            skills: [],
            experience: [],
            education: [],
            projects: [],
            certifications: []
        };
        
        this.zoomLevel = 1;
        this.autoSaveTimeout = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
    }

    setupEventListeners() {
        // Personal information inputs
        document.getElementById('fullName').addEventListener('input', (e) => this.updatePersonal('fullName', e.target.value));
        document.getElementById('jobTitle').addEventListener('input', (e) => this.updatePersonal('jobTitle', e.target.value));
        document.getElementById('email').addEventListener('input', (e) => this.updatePersonal('email', e.target.value));
        document.getElementById('phone').addEventListener('input', (e) => this.updatePersonal('phone', e.target.value));
        document.getElementById('location').addEventListener('input', (e) => this.updatePersonal('location', e.target.value));
        document.getElementById('website').addEventListener('input', (e) => this.updatePersonal('website', e.target.value));

        // Summary
        document.getElementById('summary').addEventListener('input', (e) => this.updateSummary(e.target.value));

        // Skills
        document.getElementById('addSkillBtn').addEventListener('click', () => this.addSkill());
        document.getElementById('skillInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });

        // Dynamic sections
        document.getElementById('addExperienceBtn').addEventListener('click', () => this.addExperience());
        document.getElementById('addEducationBtn').addEventListener('click', () => this.addEducation());
        document.getElementById('addProjectBtn').addEventListener('click', () => this.addProject());
        document.getElementById('addCertificationBtn').addEventListener('click', () => this.addCertification());

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.adjustZoom(0.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.adjustZoom(-0.1));

        // Header actions
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportPDF();
        });
    }

    updatePersonal(field, value) {
        this.resumeData.personal[field] = value;
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    updateSummary(value) {
        this.resumeData.summary = value;
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    addSkill() {
        const input = document.getElementById('skillInput');
        const skill = input.value.trim();
        
        if (skill && !this.resumeData.skills.includes(skill)) {
            this.resumeData.skills.push(skill);
            this.renderSkills();
            this.updatePreview();
            this.showAutoSaveIndicator();
            input.value = '';
        }
    }

    removeSkill(skill) {
        this.resumeData.skills = this.resumeData.skills.filter(s => s !== skill);
        this.renderSkills();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    renderSkills() {
        const container = document.getElementById('skillsList');
        container.innerHTML = '';

        this.resumeData.skills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-tag';
            skillElement.innerHTML = `
                ${skill}
                <button type="button" class="skill-remove" onclick="resumeBuilder.removeSkill('${skill}')">×</button>
            `;
            container.appendChild(skillElement);
        });
    }

    addExperience() {
        const newExperience = {
            id: Date.now(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        
        this.resumeData.experience.push(newExperience);
        this.renderExperience();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    removeExperience(id) {
        this.resumeData.experience = this.resumeData.experience.filter(exp => exp.id !== id);
        this.renderExperience();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    renderExperience() {
        const container = document.getElementById('experienceList');
        container.innerHTML = '';

        this.resumeData.experience.forEach(exp => {
            const expElement = document.createElement('div');
            expElement.className = 'dynamic-item';
            expElement.innerHTML = `
                <div class="item-header">
                    <span class="item-title">Experience Entry</span>
                    <button type="button" class="remove-item" onclick="resumeBuilder.removeExperience(${exp.id})">×</button>
                </div>
                <div class="item-grid">
                    <div class="form-group">
                        <label class="form-label">Company</label>
                        <input type="text" class="form-control" value="${exp.company}" 
                               oninput="resumeBuilder.updateExperience(${exp.id}, 'company', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Position</label>
                        <input type="text" class="form-control" value="${exp.position}"
                               oninput="resumeBuilder.updateExperience(${exp.id}, 'position', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="month" class="form-control" value="${exp.startDate}"
                               onchange="resumeBuilder.updateExperience(${exp.id}, 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="month" class="form-control" value="${exp.endDate}" ${exp.current ? 'disabled' : ''}
                               onchange="resumeBuilder.updateExperience(${exp.id}, 'endDate', this.value)">
                        <label style="margin-top: 8px;">
                            <input type="checkbox" ${exp.current ? 'checked' : ''} 
                                   onchange="resumeBuilder.updateExperience(${exp.id}, 'current', this.checked)"> Current Position
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" 
                              oninput="resumeBuilder.updateExperience(${exp.id}, 'description', this.value)">${exp.description}</textarea>
                </div>
            `;
            container.appendChild(expElement);
        });
    }

    updateExperience(id, field, value) {
        const experience = this.resumeData.experience.find(exp => exp.id === id);
        if (experience) {
            if (field === 'current') {
                experience.current = value;
                if (value) {
                    experience.endDate = '';
                }
                this.renderExperience();
            } else {
                experience[field] = value;
            }
            this.updatePreview();
            this.showAutoSaveIndicator();
        }
    }

    addEducation() {
        const newEducation = {
            id: Date.now(),
            school: '',
            degree: '',
            field: '',
            year: ''
        };
        
        this.resumeData.education.push(newEducation);
        this.renderEducation();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    removeEducation(id) {
        this.resumeData.education = this.resumeData.education.filter(edu => edu.id !== id);
        this.renderEducation();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    renderEducation() {
        const container = document.getElementById('educationList');
        container.innerHTML = '';

        this.resumeData.education.forEach(edu => {
            const eduElement = document.createElement('div');
            eduElement.className = 'dynamic-item';
            eduElement.innerHTML = `
                <div class="item-header">
                    <span class="item-title">Education Entry</span>
                    <button type="button" class="remove-item" onclick="resumeBuilder.removeEducation(${edu.id})">×</button>
                </div>
                <div class="item-grid">
                    <div class="form-group">
                        <label class="form-label">School/University</label>
                        <input type="text" class="form-control" value="${edu.school}"
                               oninput="resumeBuilder.updateEducation(${edu.id}, 'school', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Degree</label>
                        <input type="text" class="form-control" value="${edu.degree}"
                               oninput="resumeBuilder.updateEducation(${edu.id}, 'degree', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Field of Study</label>
                        <input type="text" class="form-control" value="${edu.field}"
                               oninput="resumeBuilder.updateEducation(${edu.id}, 'field', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Graduation Year</label>
                        <input type="number" class="form-control" min="1950" max="2030" value="${edu.year}"
                               onchange="resumeBuilder.updateEducation(${edu.id}, 'year', this.value)">
                    </div>
                </div>
            `;
            container.appendChild(eduElement);
        });
    }

    updateEducation(id, field, value) {
        const education = this.resumeData.education.find(edu => edu.id === id);
        if (education) {
            education[field] = value;
            this.updatePreview();
            this.showAutoSaveIndicator();
        }
    }

    addProject() {
        const newProject = {
            id: Date.now(),
            name: '',
            description: '',
            technologies: '',
            link: ''
        };
        
        this.resumeData.projects.push(newProject);
        this.renderProjects();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    removeProject(id) {
        this.resumeData.projects = this.resumeData.projects.filter(proj => proj.id !== id);
        this.renderProjects();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    renderProjects() {
        const container = document.getElementById('projectsList');
        container.innerHTML = '';

        this.resumeData.projects.forEach(proj => {
            const projElement = document.createElement('div');
            projElement.className = 'dynamic-item';
            projElement.innerHTML = `
                <div class="item-header">
                    <span class="item-title">Project Entry</span>
                    <button type="button" class="remove-item" onclick="resumeBuilder.removeProject(${proj.id})">×</button>
                </div>
                <div class="item-grid">
                    <div class="form-group">
                        <label class="form-label">Project Name</label>
                        <input type="text" class="form-control" value="${proj.name}"
                               oninput="resumeBuilder.updateProject(${proj.id}, 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Technologies</label>
                        <input type="text" class="form-control" value="${proj.technologies}" 
                               placeholder="React, Node.js, MongoDB"
                               oninput="resumeBuilder.updateProject(${proj.id}, 'technologies', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Project Link</label>
                        <input type="url" class="form-control" value="${proj.link}"
                               oninput="resumeBuilder.updateProject(${proj.id}, 'link', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" 
                              oninput="resumeBuilder.updateProject(${proj.id}, 'description', this.value)">${proj.description}</textarea>
                </div>
            `;
            container.appendChild(projElement);
        });
    }

    updateProject(id, field, value) {
        const project = this.resumeData.projects.find(proj => proj.id === id);
        if (project) {
            project[field] = value;
            this.updatePreview();
            this.showAutoSaveIndicator();
        }
    }

    addCertification() {
        const newCertification = {
            id: Date.now(),
            name: '',
            organization: '',
            dateObtained: '',
            expiryDate: ''
        };
        
        this.resumeData.certifications.push(newCertification);
        this.renderCertifications();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    removeCertification(id) {
        this.resumeData.certifications = this.resumeData.certifications.filter(cert => cert.id !== id);
        this.renderCertifications();
        this.updatePreview();
        this.showAutoSaveIndicator();
    }

    renderCertifications() {
        const container = document.getElementById('certificationsList');
        container.innerHTML = '';

        this.resumeData.certifications.forEach(cert => {
            const certElement = document.createElement('div');
            certElement.className = 'dynamic-item';
            certElement.innerHTML = `
                <div class="item-header">
                    <span class="item-title">Certification Entry</span>
                    <button type="button" class="remove-item" onclick="resumeBuilder.removeCertification(${cert.id})">×</button>
                </div>
                <div class="item-grid">
                    <div class="form-group">
                        <label class="form-label">Certification Name</label>
                        <input type="text" class="form-control" value="${cert.name}"
                               oninput="resumeBuilder.updateCertification(${cert.id}, 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Issuing Organization</label>
                        <input type="text" class="form-control" value="${cert.organization}"
                               oninput="resumeBuilder.updateCertification(${cert.id}, 'organization', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date Obtained</label>
                        <input type="month" class="form-control" value="${cert.dateObtained}"
                               onchange="resumeBuilder.updateCertification(${cert.id}, 'dateObtained', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Expiry Date (Optional)</label>
                        <input type="month" class="form-control" value="${cert.expiryDate}"
                               onchange="resumeBuilder.updateCertification(${cert.id}, 'expiryDate', this.value)">
                    </div>
                </div>
            `;
            container.appendChild(certElement);
        });
    }

    updateCertification(id, field, value) {
        const certification = this.resumeData.certifications.find(cert => cert.id === id);
        if (certification) {
            certification[field] = value;
            this.updatePreview();
            this.showAutoSaveIndicator();
        }
    }

    updatePreview() {
        const data = this.resumeData;
        
        // Update header
        document.getElementById('previewName').textContent = data.personal.fullName || 'Your Name';
        document.getElementById('previewTitle').textContent = data.personal.jobTitle || 'Your Title';
        
        // Update contact info
        document.getElementById('previewEmail').textContent = data.personal.email;
        document.getElementById('previewPhone').textContent = data.personal.phone;
        document.getElementById('previewLocation').textContent = data.personal.location;
        document.getElementById('previewWebsite').textContent = data.personal.website;

        // Update summary
        const summarySection = document.getElementById('summarySection');
        const previewSummary = document.getElementById('previewSummary');
        if (data.summary.trim()) {
            previewSummary.textContent = data.summary;
            summarySection.style.display = 'block';
        } else {
            summarySection.style.display = 'none';
        }

        // Update skills
        const skillsSection = document.getElementById('skillsSection');
        const previewSkills = document.getElementById('previewSkills');
        if (data.skills.length > 0) {
            previewSkills.innerHTML = data.skills.map(skill => 
                `<span class="skill-item">${skill}</span>`
            ).join('');
            skillsSection.style.display = 'block';
        } else {
            skillsSection.style.display = 'none';
        }

        // Update experience
        this.updateExperiencePreview();
        
        // Update education
        this.updateEducationPreview();
        
        // Update projects
        this.updateProjectsPreview();

        // Update certifications
        this.updateCertificationsPreview();
    }

    updateExperiencePreview() {
        const experienceSection = document.getElementById('experienceSection');
        const previewExperience = document.getElementById('previewExperience');
        
        if (this.resumeData.experience.length > 0) {
            previewExperience.innerHTML = this.resumeData.experience.map(exp => {
                const startDate = exp.startDate ? new Date(exp.startDate + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
                const endDate = exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '');
                const dateRange = startDate || endDate ? `${startDate} - ${endDate}` : '';
                
                return `
                    <div class="experience-item">
                        <div class="item-header-preview">
                            <h4>${exp.position || 'Position'}</h4>
                            ${dateRange ? `<span class="item-date">${dateRange}</span>` : ''}
                        </div>
                        <div class="item-company">${exp.company || 'Company'}</div>
                        ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                    </div>
                `;
            }).join('');
            experienceSection.style.display = 'block';
        } else {
            experienceSection.style.display = 'none';
        }
    }

    updateEducationPreview() {
        const educationSection = document.getElementById('educationSection');
        const previewEducation = document.getElementById('previewEducation');
        
        if (this.resumeData.education.length > 0) {
            previewEducation.innerHTML = this.resumeData.education.map(edu => `
                <div class="education-item">
                    <div class="item-header-preview">
                        <h4>${edu.degree || 'Degree'} ${edu.field ? `in ${edu.field}` : ''}</h4>
                        ${edu.year ? `<span class="item-date">${edu.year}</span>` : ''}
                    </div>
                    <div class="item-company">${edu.school || 'School'}</div>
                </div>
            `).join('');
            educationSection.style.display = 'block';
        } else {
            educationSection.style.display = 'none';
        }
    }

    updateProjectsPreview() {
        const projectsSection = document.getElementById('projectsSection');
        const previewProjects = document.getElementById('previewProjects');
        
        if (this.resumeData.projects.length > 0) {
            previewProjects.innerHTML = this.resumeData.projects.map(proj => `
                <div class="project-item">
                    <div class="item-header-preview">
                        <h4>${proj.name || 'Project Name'}</h4>
                        ${proj.link ? `<a href="${proj.link}" target="_blank" style="color: var(--color-primary); font-size: 13px;">View Project</a>` : ''}
                    </div>
                    ${proj.technologies ? `<div style="color: #666; font-size: 13px; margin-bottom: 8px;"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
                    ${proj.description ? `<div class="item-description">${proj.description}</div>` : ''}
                </div>
            `).join('');
            projectsSection.style.display = 'block';
        } else {
            projectsSection.style.display = 'none';
        }
    }

    updateCertificationsPreview() {
        const certificationsSection = document.getElementById('certificationsSection');
        const previewCertifications = document.getElementById('previewCertifications');
        
        if (this.resumeData.certifications.length > 0) {
            previewCertifications.innerHTML = this.resumeData.certifications.map(cert => {
                let statusHtml = '';
                let datesHtml = '';
                
                if (cert.dateObtained) {
                    const obtained = new Date(cert.dateObtained + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    datesHtml = `<span><strong>Obtained:</strong> ${obtained}</span>`;
                }
                
                if (cert.expiryDate) {
                    const expiry = new Date(cert.expiryDate + '-01');
                    const expiryFormatted = expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    const now = new Date();
                    const monthsUntilExpiry = (expiry.getFullYear() - now.getFullYear()) * 12 + expiry.getMonth() - now.getMonth();
                    
                    datesHtml += `<span><strong>Expires:</strong> ${expiryFormatted}</span>`;
                    
                    if (monthsUntilExpiry < 0) {
                        statusHtml = '<span class="certification-status expired">Expired</span>';
                    } else if (monthsUntilExpiry <= 6) {
                        statusHtml = '<span class="certification-status expiring">Expiring Soon</span>';
                    } else {
                        statusHtml = '<span class="certification-status valid">Valid</span>';
                    }
                }
                
                return `
                    <div class="certification-item">
                        <div class="item-header-preview">
                            <h4>${cert.name || 'Certification Name'}${statusHtml}</h4>
                        </div>
                        <div class="item-company">${cert.organization || 'Organization'}</div>
                        ${datesHtml ? `<div class="certification-dates">${datesHtml}</div>` : ''}
                    </div>
                `;
            }).join('');
            certificationsSection.style.display = 'block';
        } else {
            certificationsSection.style.display = 'none';
        }
    }

    adjustZoom(delta) {
        this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
        const preview = document.getElementById('resumePreview');
        preview.style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoomLevel').textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    showAutoSaveIndicator() {
        const indicator = document.getElementById('autosaveIndicator');
        indicator.classList.add('show');
        
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.resumeData = {
                personal: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '' },
                summary: '',
                skills: [],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            };
            
            // Clear form inputs
            document.querySelectorAll('.form-control').forEach(input => input.value = '');
            
            // Clear dynamic sections
            document.getElementById('skillsList').innerHTML = '';
            document.getElementById('experienceList').innerHTML = '';
            document.getElementById('educationList').innerHTML = '';
            document.getElementById('projectsList').innerHTML = '';
            document.getElementById('certificationsList').innerHTML = '';
            
            this.updatePreview();
        }
    }

    exportPDF() {
        try {
            // Set page title for PDF
            const originalTitle = document.title;
            const name = this.resumeData.personal.fullName || 'Resume';
            document.title = `${name} - Resume`;
            
            // Add print-specific styles
            document.body.classList.add('printing');
            
            // Show user feedback with better messaging
            const exportMsg = 'Your resume is ready for export!\n\n' +
                            '1. A print dialog will open\n' +
                            '2. Choose "Save as PDF" as destination\n' +
                            '3. Click "Save" to download your resume\n\n' +
                            'Click OK to continue...';
            
            if (confirm(exportMsg)) {
                // Trigger print dialog
                setTimeout(() => {
                    window.print();
                    
                    // Clean up after print
                    setTimeout(() => {
                        document.title = originalTitle;
                        document.body.classList.remove('printing');
                    }, 1000);
                }, 100);
            } else {
                // User cancelled
                document.title = originalTitle;
                document.body.classList.remove('printing');
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again or use your browser\'s print function (Ctrl+P or Cmd+P).');
        }
    }
}

// Initialize the resume builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Resume Builder...');
    window.resumeBuilder = new ResumeBuilder();
});

// Add additional print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        body.printing .form-panel,
        body.printing .preview-header,
        body.printing .autosave-indicator,
        body.printing .header {
            display: none !important;
        }
        
        body.printing .resume-layout {
            grid-template-columns: 1fr !important;
        }
        
        body.printing .preview-panel {
            position: static !important;
            max-height: none !important;
            border: none !important;
            box-shadow: none !important;
        }
        
        body.printing .preview-container {
            padding: 0 !important;
            background: white !important;
        }
        
        body.printing .resume-preview {
            transform: none !important;
            box-shadow: none !important;
            max-width: none !important;
            margin: 0 !important;
        }
        
        body.printing .main-content {
            padding: 0 !important;
        }
        
        body.printing .container {
            max-width: none !important;
            padding: 0 !important;
        }
    }
    
    .btn {
        cursor: pointer;
        user-select: none;
    }
    
    .btn:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
`;
document.head.appendChild(printStyles);