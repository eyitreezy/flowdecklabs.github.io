// Testimonials Filtering Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // TAB FILTERING FUNCTIONALITY
    // ============================================
    const tabButtons = document.querySelectorAll('.testimonial-tab-btn');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active state
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter testimonials
            testimonialCards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    // Trigger animation
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'fadeInUp 0.6s ease-out both';
                    }, 10);
                } else if (filter === cardType) {
                    card.classList.remove('hidden');
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'fadeInUp 0.6s ease-out both';
                    }, 10);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ============================================
    // MODAL FUNCTIONALITY
    // ============================================
    const reviewModal = document.getElementById('reviewModal');
    const openModalBtn = document.getElementById('openReviewModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modalOverlay');

    // Open modal
    openModalBtn.addEventListener('click', function() {
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal function
    function closeModal() {
        reviewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Reset form
        document.getElementById('reviewForm').reset();
        // Reset file label
        document.querySelector('.file-name').textContent = 'Choose video file or drag here';
    }

    // Close modal on close button click
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal on overlay click
    modalOverlay.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reviewModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ============================================
    // REVIEW TYPE TOGGLE (Text vs Video)
    // ============================================
    const reviewTypeBtns = document.querySelectorAll('.review-type-btn');
    const textReviewFields = document.getElementById('textReviewFields');
    const videoReviewFields = document.getElementById('videoReviewFields');
    const reviewTextArea = document.getElementById('reviewText');
    const videoFileInput = document.getElementById('videoFile');

    reviewTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewType = this.getAttribute('data-review-type');
            
            // Update active state
            reviewTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle fields
            if (reviewType === 'text') {
                textReviewFields.style.display = 'block';
                videoReviewFields.style.display = 'none';
                reviewTextArea.required = true;
                videoFileInput.required = false;
            } else {
                textReviewFields.style.display = 'none';
                videoReviewFields.style.display = 'block';
                reviewTextArea.required = false;
                videoFileInput.required = true;
            }
        });
    });

    // ============================================
    // FILE UPLOAD HANDLING
    // ============================================
    const fileInput = document.getElementById('videoFile');
    const fileLabel = document.querySelector('.file-name');

    fileInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || 'Choose video file or drag here';
        fileLabel.textContent = fileName;
    });

    // Drag and drop functionality
    const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
    const fileLabelElement = document.querySelector('.file-label');

    fileLabelElement.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#1e3a8a';
        this.style.background = '#f3f4f6';
    });

    fileLabelElement.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#cbd5e1';
        this.style.background = '#f8f9fa';
    });

    fileLabelElement.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#cbd5e1';
        this.style.background = '#f8f9fa';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileLabel.textContent = files[0].name;
        }
    });

    // ============================================
    // FORM SUBMISSION
    // ============================================
    const reviewForm = document.getElementById('reviewForm');
    const submitBtn = reviewForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const reviewType = document.querySelector('.review-type-btn.active').getAttribute('data-review-type');
        
        // Get form values
        const clientName = formData.get('clientName');
        const clientLocation = formData.get('clientLocation');
        const clientEmail = formData.get('clientEmail');
        const projectType = formData.get('projectType');
        const reviewText = formData.get('reviewText');
        const videoDescription = formData.get('videoDescription');
        const videoFile = formData.get('videoFile');

        // Validate consent
        if (!formData.get('consent')) {
            alert('Please consent to the terms before submitting.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        // Prepare email content
        let emailBody = `
NEW TESTIMONIAL SUBMISSION
==========================

Client Information:
- Name: ${clientName}
- Location: ${clientLocation}
- Email: ${clientEmail}
- Project Type: ${projectType || 'Not specified'}

Review Type: ${reviewType.toUpperCase()}

`;

        if (reviewType === 'text') {
            emailBody += `Review Text:\n${reviewText}\n`;
        } else {
            emailBody += `Video Review Submitted\n`;
            emailBody += `Video File: ${videoFile ? videoFile.name : 'No file'}\n`;
            emailBody += `Description: ${videoDescription || 'No description provided'}\n`;
        }

        emailBody += `\nSubmitted on: ${new Date().toLocaleString()}\n`;

        // Create mailto link (Note: This is a simple solution. For production, use a backend service)
        const mailtoLink = `mailto:eyitreezy@gmail.com?subject=New Testimonial from ${encodeURIComponent(clientName)}&body=${encodeURIComponent(emailBody)}`;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For actual email sending, you would use a backend service like:
            // - EmailJS (https://www.emailjs.com/)
            // - FormSubmit (https://formsubmit.co/)
            // - Your own backend API

            // Using FormSubmit.co (free service)
            const response = await fetch('https://formsubmit.co/ajax/eyitreezy@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: clientName,
                    email: clientEmail,
                    location: clientLocation,
                    projectType: projectType,
                    reviewType: reviewType,
                    reviewText: reviewText || videoDescription,
                    message: emailBody
                })
            });

            if (response.ok) {
                // Success message
                alert('Thank you for your review! Your submission has been received.');
                closeModal();
                
                // Optional: Add the new testimonial to the page (for demo purposes)
                // addNewTestimonialToPage(clientName, clientLocation, reviewText, reviewType);
            } else {
                throw new Error('Submission failed');
            }

        } catch (error) {
            console.error('Error:', error);
            
            // Fallback to mailto
            window.location.href = mailtoLink;
            
            alert('Opening your email client to send the review. Please send the email to complete submission.');
            
            // Close modal after short delay
            setTimeout(() => {
                closeModal();
            }, 1000);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });

    // ============================================
    // VIDEO PLAY FUNCTIONALITY
    // ============================================
    const videoCards = document.querySelectorAll('.video-card');

    videoCards.forEach(card => {
        const video = card.querySelector('video');
        const playOverlay = card.querySelector('.play-overlay');
        const videoWrapper = card.querySelector('.video-wrapper');

        if (video && playOverlay && videoWrapper) {
            videoWrapper.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                    playOverlay.style.opacity = '0';
                    playOverlay.style.pointerEvents = 'none';
                } else {
                    video.pause();
                    playOverlay.style.opacity = '1';
                    playOverlay.style.pointerEvents = 'auto';
                }
            });

            video.addEventListener('ended', function() {
                playOverlay.style.opacity = '1';
                playOverlay.style.pointerEvents = 'auto';
            });
        }
    });

    // ============================================
    // OPTIONAL: ADD NEW TESTIMONIAL TO PAGE (Demo)
    // ============================================
    function addNewTestimonialToPage(name, location, text, type) {
        const grid = document.querySelector('.testimonials-grid');
        const newCard = document.createElement('div');
        newCard.className = `testimonial-card ${type === 'video' ? 'video-card' : ''}`;
        newCard.setAttribute('data-type', type);

        const avatar = "image/About-Us.avif";
        const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

        newCard.innerHTML = `
            <div class="testimonial-content">
                <div class="client-profile">
                    <img src="${avatar}" alt="${name}" class="client-avatar">
                    <div class="client-info">
                        <h3 class="client-name">${name}</h3>
                        <p class="client-location">${location}</p>
                    </div>
                </div>
                <p class="testimonial-text">${text}</p>
                <span class="testimonial-date">${date}</span>
            </div>
        `;

        grid.insertBefore(newCard, grid.firstChild);

        // Animate new card
        newCard.style.animation = 'fadeInUp 0.6s ease-out both';
    }

    // ============================================
    // FORM VALIDATION HELPERS
    // ============================================
    const emailInput = document.getElementById('clientEmail');
    
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value) && this.value !== '') {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });

    // File size validation
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                alert('File size exceeds 50MB. Please choose a smaller file.');
                this.value = '';
                fileLabel.textContent = 'Choose video file or drag here';
            }
        }
    });

    console.log('Testimonials JavaScript loaded successfully!');
});

// ============================================
// ALTERNATIVE: EmailJS Integration (Recommended)
// ============================================
// To use EmailJS instead:
// 1. Sign up at https://www.emailjs.com/
// 2. Add this script to your HTML: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
// 3. Replace the fetch code above with:

/*
emailjs.init('YOUR_PUBLIC_KEY'); // Get from EmailJS dashboard

emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    from_name: clientName,
    from_email: clientEmail,
    location: clientLocation,
    project_type: projectType,
    review_type: reviewType,
    review_text: reviewText || videoDescription,
    message: emailBody
}).then(
    function(response) {
        alert('Thank you for your review!');
        closeModal();
    },
    function(error) {
        alert('Failed to send review. Please try again.');
        console.error('EmailJS error:', error);
    }
);
*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Testimonials script loaded');

    // ============================================
    // TAB FILTERING FUNCTIONALITY
    // ============================================
    const tabButtons = document.querySelectorAll('.testimonial-tab-btn');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                console.log('Filter clicked:', filter);
                
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Filter testimonials
                testimonialCards.forEach((card, index) => {
                    const cardType = card.getAttribute('data-type');
                    
                    if (filter === 'all') {
                        card.style.display = 'block';
                        card.classList.remove('hidden');
                    } else if (filter === cardType) {
                        card.style.display = 'block';
                        card.classList.remove('hidden');
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ============================================
    // MODAL FUNCTIONALITY
    // ============================================
    const reviewModal = document.getElementById('reviewModal');
    const openModalBtn = document.getElementById('openReviewModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modalOverlay');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            console.log('Opening modal');
            reviewModal.classList.add('active');
            reviewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    function closeModal() {
        console.log('Closing modal');
        reviewModal.classList.remove('active');
        reviewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('reviewForm');
        if (form) {
            form.reset();
        }
        
        // Reset file label
        const fileLabel = document.querySelector('.file-name');
        if (fileLabel) {
            fileLabel.textContent = 'Choose video file or drag here';
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reviewModal && reviewModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ============================================
    // REVIEW TYPE TOGGLE
    // ============================================
    const reviewTypeBtns = document.querySelectorAll('.review-type-btn');
    const textReviewFields = document.getElementById('textReviewFields');
    const videoReviewFields = document.getElementById('videoReviewFields');
    const reviewTextArea = document.getElementById('reviewText');
    const videoFileInput = document.getElementById('videoFile');

    if (reviewTypeBtns.length > 0) {
        reviewTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reviewType = this.getAttribute('data-review-type');
                console.log('Review type selected:', reviewType);
                
                // Remove active from all
                reviewTypeBtns.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked
                this.classList.add('active');
                
                // Toggle fields
                if (reviewType === 'text') {
                    if (textReviewFields) textReviewFields.style.display = 'block';
                    if (videoReviewFields) videoReviewFields.style.display = 'none';
                    if (reviewTextArea) reviewTextArea.required = true;
                    if (videoFileInput) videoFileInput.required = false;
                } else if (reviewType === 'video') {
                    if (textReviewFields) textReviewFields.style.display = 'none';
                    if (videoReviewFields) videoReviewFields.style.display = 'block';
                    if (reviewTextArea) reviewTextArea.required = false;
                    if (videoFileInput) videoFileInput.required = true;
                }
            });
        });
    }

    // ============================================
    // FILE UPLOAD HANDLING
    // ============================================
    const fileInput = document.getElementById('videoFile');
    const fileLabel = document.querySelector('.file-name');

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files.length > 0) {
                const fileName = e.target.files[0].name;
                fileLabel.textContent = fileName;
                console.log('File selected:', fileName);
                
                // Check file size (50MB limit)
                const fileSize = e.target.files[0].size;
                const maxSize = 50 * 1024 * 1024; // 50MB
                
                if (fileSize > maxSize) {
                    alert('File size exceeds 50MB. Please choose a smaller file.');
                    fileInput.value = '';
                    fileLabel.textContent = 'Choose video file or drag here';
                }
            }
        });
    }

    // Drag and drop
    const fileLabelElement = document.querySelector('.file-label');
    if (fileLabelElement) {
        fileLabelElement.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#1e3a8a';
            this.style.background = '#f3f4f6';
        });

        fileLabelElement.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#cbd5e1';
            this.style.background = '#f8f9fa';
        });

        fileLabelElement.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#cbd5e1';
            this.style.background = '#f8f9fa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && fileInput) {
                fileInput.files = files;
                if (fileLabel) {
                    fileLabel.textContent = files[0].name;
                }
                console.log('File dropped:', files[0].name);
            }
        });
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');

            const submitBtn = this.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Get active review type
            const activeReviewTypeBtn = document.querySelector('.review-type-btn.active');
            const reviewType = activeReviewTypeBtn ? activeReviewTypeBtn.getAttribute('data-review-type') : 'text';
            
            // Get form values
            const clientName = document.getElementById('clientName').value;
            const clientLocation = document.getElementById('clientLocation').value;
            const clientEmail = document.getElementById('clientEmail').value;
            const projectType = document.getElementById('projectType').value;
            const reviewText = document.getElementById('reviewText').value;
            const videoDescription = document.getElementById('videoDescription') ? document.getElementById('videoDescription').value : '';
            const consent = document.getElementById('consent').checked;
            
            // Validate consent
            if (!consent) {
                alert('Please consent to the terms before submitting.');
                return;
            }
            
            // Show loading
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
            
            // Prepare email content
            const emailSubject = `New Testimonial from ${clientName}`;
            const emailBody = `
NEW TESTIMONIAL SUBMISSION
==========================

Client Information:
- Name: ${clientName}
- Location: ${clientLocation}
- Email: ${clientEmail}
- Project Type: ${projectType || 'Not specified'}

Review Type: ${reviewType.toUpperCase()}

${reviewType === 'text' ? `Review Text:\n${reviewText}` : `Video Review Submitted\nDescription: ${videoDescription || 'No description'}`}

Submitted on: ${new Date().toLocaleString()}
            `;

            try {
                // Method 1: Using FormSubmit.co (Free, no registration needed)
                const response = await fetch('https://formsubmit.co/ajax/eyitreezy@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        _subject: emailSubject,
                        name: clientName,
                        email: clientEmail,
                        location: clientLocation,
                        projectType: projectType,
                        reviewType: reviewType,
                        reviewText: reviewText || videoDescription,
                        message: emailBody,
                        _captcha: 'false'
                    })
                });

                const result = await response.json();
                console.log('Response:', result);

                if (response.ok && result.success) {
                    alert('✅ Thank you for your review! Your submission has been sent successfully.');
                    closeModal();
                } else {
                    throw new Error('Submission failed');
                }

            } catch (error) {
                console.error('Submission error:', error);
                
                // Fallback: Open email client
                const mailtoLink = `mailto:eyitreezy@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                window.location.href = mailtoLink;
                
                alert('Opening your email client. Please send the email to complete your submission.');
                
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } finally {
                // Reset button
                submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        });
    }

    // ============================================
    // VIDEO CONTROLS
    // ============================================
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const playOverlay = wrapper.querySelector('.play-overlay');
        
        if (video && playOverlay) {
            // Click to play/pause
            wrapper.addEventListener('click', function(e) {
                if (e.target.tagName !== 'VIDEO') {
                    if (video.paused) {
                        video.play();
                        playOverlay.style.opacity = '0';
                        playOverlay.style.visibility = 'hidden';
                    } else {
                        video.pause();
                        playOverlay.style.opacity = '1';
                        playOverlay.style.visibility = 'visible';
                    }
                }
            });
            
            // Also handle video click
            video.addEventListener('click', function() {
                if (this.paused) {
                    this.play();
                    playOverlay.style.opacity = '0';
                    playOverlay.style.visibility = 'hidden';
                } else {
                    this.pause();
                    playOverlay.style.opacity = '1';
                    playOverlay.style.visibility = 'visible';
                }
            });
            
            // Show overlay when video ends
            video.addEventListener('ended', function() {
                playOverlay.style.opacity = '1';
                playOverlay.style.visibility = 'visible';
            });
            
            // Hide overlay when playing
            video.addEventListener('play', function() {
                playOverlay.style.opacity = '0';
                playOverlay.style.visibility = 'hidden';
            });
            
            // Show overlay when paused
            video.addEventListener('pause', function() {
                playOverlay.style.opacity = '1';
                playOverlay.style.visibility = 'visible';
            });
        }
    });

    // ============================================
    // EMAIL VALIDATION
    // ============================================
    const emailInput = document.getElementById('clientEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = '#ef4444';
                this.style.borderWidth = '2px';
            } else {
                this.style.borderColor = '#e5e7eb';
            }
        });
        
        emailInput.addEventListener('focus', function() {
            this.style.borderColor = '#1e3a8a';
        });
    }

    console.log('✅ All event listeners initialized successfully');
});