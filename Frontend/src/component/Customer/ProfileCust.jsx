import React, { useState } from 'react';
import './ProfileCust.css';

const ProfileCust = () => {
    const [profileDetails, setProfileDetails] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "(123) 456-7890",
        address: "123 Main St, Apt 4B, Springfield"
    });

    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);

    const handleUpdateDetails = (e) => {
        e.preventDefault();
        setIsUpdatePopupOpen(false);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setIsChangePasswordPopupOpen(false);
    };

    return (
        <div className="profile-cust">
            <h1>Profile</h1>
            <p><strong>Name:</strong> {profileDetails.name}</p>
            <p><strong>Email:</strong> {profileDetails.email}</p>
            <p><strong>Phone Number:</strong> {profileDetails.phone}</p>
            <p><strong>Address:</strong> {profileDetails.address}</p>
            <button onClick={() => setIsUpdatePopupOpen(true)}>Update Details</button>

            {isUpdatePopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Update Profile Details</h2>
                        <form onSubmit={handleUpdateDetails}>
                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={profileDetails.name}
                                    onChange={(e) => setProfileDetails({ ...profileDetails, name: e.target.value })}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={profileDetails.email}
                                    onChange={(e) => setProfileDetails({ ...profileDetails, email: e.target.value })}
                                />
                            </label>
                            <label>
                                Phone Number:
                                <input
                                    type="text"
                                    value={profileDetails.phone}
                                    onChange={(e) => setProfileDetails({ ...profileDetails, phone: e.target.value })}
                                />
                            </label>
                            <label>
                                Address:
                                <input
                                    type="text"
                                    value={profileDetails.address}
                                    onChange={(e) => setProfileDetails({ ...profileDetails, address: e.target.value })}
                                />
                            </label>
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsUpdatePopupOpen(false)}>Cancel</button>
                        </form>
                        <button onClick={() => setIsChangePasswordPopupOpen(true)}>Change Password</button>
                    </div>
                </div>
            )}

            {isChangePasswordPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Change Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <label>
                                Current Password:
                                <input type="password" required />
                            </label>
                            <label>
                                New Password:
                                <input type="password" required />
                            </label>
                            <label>
                                Confirm New Password:
                                <input type="password" required />
                            </label>
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsChangePasswordPopupOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCust;