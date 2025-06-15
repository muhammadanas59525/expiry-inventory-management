import React, { useState, useRef } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiHelpCircle } from 'react-icons/fi';
import emailjs from '@emailjs/browser';
import './Help.css';

const Help = () => {
    const [activeTab, setActiveTab] = useState('contact');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const formRef = useRef();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        
        // EmailJS service configuration for Vite
        // Using environment variables for security
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_gx4u4zt';
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_kvo9rso';
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '4lD7XSu88ViRSHstH';
        
        // Check if EmailJS keys are properly configured
        // if (serviceId === 'service_gx4u4zt' || 
        //     templateId === 'template_kvo9rso' || 
        //     publicKey === '4lD7XSu88ViRSHstH') {
        //     console.warn('EmailJS is not properly configured. Please set your environment variables.');
        //     setSubmitError('Email service not configured properly. Please contact site administrator.');
        //     setIsSubmitting(false);
        //     return;
        // }
        
        // Prepare template parameters
        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            to_email: 'exims2025@gmail.com'
        };
        
        // Send email using EmailJS
        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then((response) => {
                console.log('Email sent successfully:', response);
                setFormSubmitted(true);
                
                // Reset form after submission
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                
                // Reset submission status after 5 seconds
                setTimeout(() => {
                    setFormSubmitted(false);
                }, 5000);
            })
            .catch((error) => {
                console.error('Failed to send email:', error);
                setSubmitError('Failed to send your message. Please try again later.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const faqList = [
        {
            question: "What are your store hours?",
            answer: "Our online store is available 24/7. Our physical stores are open Monday to Saturday from 9:00 AM to 9:00 PM, and Sunday from 10:00 AM to 6:00 PM."
        },
        {
            question: "How do I track my order?",
            answer: "You can track your order by logging into your account and visiting the 'My Orders' section. There you'll find real-time updates on your order status."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns within 3 days of purchase. Products must be unopened and in original packaging. For perishable goods, please contact our customer service within 24 hours of delivery if there are any issues."
        },
        {
            question: "Do you offer same-day delivery?",
            answer: "Yes, we offer same-day delivery for orders placed before 2:00 PM in select areas. You can check if your location qualifies during checkout."
        },
        {
            question: "How do I use promotional codes?",
            answer: "You can enter promotional codes at checkout in the designated promo code field. The discount will be applied automatically if the code is valid."
        },
        {
            question: "Are there any membership benefits?",
            answer: "Yes! Our premium membership offers benefits like free delivery, exclusive discounts, early access to sales, and points on every purchase that can be redeemed for discounts."
        }
    ];

    return (
        <div className="help-container">
            <div className="help-header">
                <h1>Customer Support</h1>
                <p>We're here to help with any questions or concerns</p>
            </div>

            <div className="help-tabs">
                <button 
                    className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contact')}
                >
                    Contact Us
                </button>
                <button 
                    className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faq')}
                >
                    FAQs
                </button>
                <button 
                    className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                    onClick={() => setActiveTab('form')}
                >
                    Send a Message
                </button>
            </div>

            <div className="help-content">
                {activeTab === 'contact' && (
                    <div className="contact-info">
                        <div className="contact-card">
                            <div className="contact-icon">
                                <FiPhone />
                            </div>
                            <h3>Call Us</h3>
                            <p>Toll-Free: 1-800-123-4567</p>
                            <p>Customer Support: +1 (555) 987-6543</p>
                            <p className="contact-note">Available 24/7 for emergency support</p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <FiMail />
                            </div>
                            <h3>Email Us</h3>
                            <p>Customer Support: <a href="mailto:exims2025@gmail.com">exims2025@gmail.com</a></p>
                            <p>Order Inquiries: <a href="mailto:exims2025@gmail.com">exims2025@gmail.com</a></p>
                            <p>Business Relations: <a href="mailto:exims2025@gmail.com">exims2025@gmail.com</a></p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <FiMapPin />
                            </div>
                            <h3>Address Us</h3>
                            <p>EXIMS</p>
                            <p>College Of Engineering Vadakara</p>
                            <p>Kerala</p>
                            <p><a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">View on Map</a></p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <FiClock />
                            </div>
                            <h3>Business Hours</h3>
                            <p>Monday - Friday: 8:00 AM - 10:00 PM</p>
                            <p>Saturday: 9:00 AM - 8:00 PM</p>
                            <p>Sunday: 10:00 AM - 6:00 PM</p>
                            <p className="contact-note">Holiday hours may vary</p>
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="faq-section">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            {faqList.map((faq, index) => (
                                <div key={index} className="faq-item">
                                    <div className="faq-question">
                                        <FiHelpCircle />
                                        <h3>{faq.question}</h3>
                                    </div>
                                    <p className="faq-answer">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'form' && (
                    <div className="contact-form-container">
                        <h2>Send Us a Message</h2>
                        {formSubmitted ? (
                            <div className="form-success-message">
                                <FiSend />
                                <h3>Message Sent Successfully!</h3>
                                <p>We'll get back to you as soon as possible.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                                
                                <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Sending Message...</>
                                ) : (
                                    <><FiSend /> Send Message</>
                                )}
                            </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            <div className="help-footer">
                <p>Need urgent assistance? Call our priority support line at 1-888-456-7890</p>
            </div>
        </div>
    );
};

export default Help;