import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaStore, FaMapMarkerAlt, FaEdit, FaSave, FaCamera } from "react-icons/fa";
import "./ProfileShop.css";
import axiosInstance from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
        imageUrl: "https://www.gravatar.com/avatar/"
    });

    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/user/profile');
            
            if (response.data) {
                const userData = response.data;
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
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile data");
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
            
            const response = await axiosInstance.put('/user/profile', tempProfile);
            
            if (response.data) {
                setProfile(response.data);
                setEditing(false);
                setSuccess(true);
                toast.success('Profile updated successfully!');
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.message || "Failed to update profile");
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axiosInstance.post('/user/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.imageUrl) {
                setProfile(prev => ({
                    ...prev,
                    imageUrl: response.data.imageUrl
                }));
                toast.success('Profile image updated successfully!');
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            toast.error("Failed to upload profile image");
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
                            <label className="image-upload-overlay">
                                <FaCamera className="camera-icon" />
                                <span>Change Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
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