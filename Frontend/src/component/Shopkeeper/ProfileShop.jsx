import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaStore, FaMapMarkerAlt, FaEdit, FaSave, FaCamera } from "react-icons/fa";
import "./ProfileShop.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileShop = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        storeName: "",
        address: "",
        bio: "",
        imageUrl: "https://www.gravatar.com/avatar/"  // More reliable default
    });

    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch profile data
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }
            
            // Check token validity
            console.log("Token being used:", token);
            
            const response = await axios.get('http://localhost:3000/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const userData = response.data;
            console.log("Fetched user data:", userData);
            
            setProfile({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
                phone: userData.phone || "",
                storeName: userData.storeName || "",
                address: userData.address || "",
                bio: userData.bio || "No bio available",
                username: userData.username || "",
                imageUrl: userData.imageUrl || "https://www.gravatar.com/avatar/"
            });
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching profile:", err);
            console.error("Error details:", err.response?.data || "No response data");
            setError("Failed to load profile data. " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setTempProfile({...profile});
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempProfile({
            ...tempProfile,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError("Authentication required. Please log in again.");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }
            
            console.log("Sending profile update with data:", tempProfile);
            
            const response = await axios.put(
                'http://localhost:3000/api/user/profile', // Changed from api/users/profile to match GET endpoint
                tempProfile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            console.log("Update response:", response.data);
            setProfile(response.data);
            setEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
            }
            setError("Failed to update profile: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading profile data...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Profile updated successfully!</div>}
            
            <div className="profile-header">
                <h1>My Profile</h1>
                {!editing ? (
                    <button className="edit-button" onClick={handleEdit}>
                        <FaEdit /> Edit Profile
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="save-button" onClick={handleSubmit}>
                            <FaSave /> Save Changes
                        </button>
                        <button className="cancel-button" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            
            <div className="profile-content">
                <div className="profile-image-section">
                    <div className="profile-image-container">
                        <img 
                            src={profile.imageUrl} 
                            alt="Profile" 
                            className="profile-image" 
                        />
                        {editing && (
                            <div className="image-upload-overlay">
                                <FaCamera className="camera-icon" />
                                <span>Change Photo</span>
                            </div>
                        )}
                    </div>
                    <h2>{profile.firstName} {profile.lastName}</h2>
                    <p className="username">@{profile.username}</p>
                </div>
                
                <div className="profile-details-section">
                    <h3>Personal Information</h3>
                    
                    <div className="profile-fields">
                        <div className="profile-field">
                            <FaUser className="field-icon" />
                            <div className="field-content">
                                <label>Full Name</label>
                                {!editing ? (
                                    <span>{profile.firstName} {profile.lastName}</span>
                                ) : (
                                    <div className="edit-field-row">
                                        <input 
                                            type="text" 
                                            name="firstName" 
                                            value={tempProfile.firstName} 
                                            onChange={handleChange} 
                                            placeholder="First name"
                                        />
                                        <input 
                                            type="text" 
                                            name="lastName" 
                                            value={tempProfile.lastName} 
                                            onChange={handleChange}
                                            placeholder="Last name"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="profile-field">
                            <FaEnvelope className="field-icon" />
                            <div className="field-content">
                                <label>Email</label>
                                {!editing ? (
                                    <span>{profile.email}</span>
                                ) : (
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={tempProfile.email} 
                                        onChange={handleChange}
                                        placeholder="Email address"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="profile-field">
                            <FaPhone className="field-icon" />
                            <div className="field-content">
                                <label>Phone</label>
                                {!editing ? (
                                    <span>{profile.phone || "Not provided"}</span>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        value={tempProfile.phone} 
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="profile-field">
                            <FaStore className="field-icon" />
                            <div className="field-content">
                                <label>Store Name</label>
                                {!editing ? (
                                    <span>{profile.storeName || "Not provided"}</span>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="storeName" 
                                        value={tempProfile.storeName} 
                                        onChange={handleChange}
                                        placeholder="Store name"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="profile-field">
                            <FaMapMarkerAlt className="field-icon" />
                            <div className="field-content">
                                <label>Address</label>
                                {!editing ? (
                                    <span>{profile.address || "Not provided"}</span>
                                ) : (
                                    <textarea 
                                        name="address" 
                                        value={tempProfile.address} 
                                        onChange={handleChange}
                                        placeholder="Address"
                                        rows="2"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="profile-bio">
                        <h3>About Me</h3>
                        {!editing ? (
                            <p>{profile.bio}</p>
                        ) : (
                            <textarea 
                                name="bio" 
                                value={tempProfile.bio} 
                                onChange={handleChange}
                                placeholder="Tell us about yourself and your store"
                                rows="4"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileShop;