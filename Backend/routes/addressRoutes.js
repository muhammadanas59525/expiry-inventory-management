const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all addresses for a user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching addresses for user:', req.user._id);
        const user = await User.findById(req.user._id).populate('addresses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.addresses);
    } catch (error) {
        console.error('Addresses fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add a new address
router.post('/', auth, async (req, res) => {
    try {
        const { fullName, address, city, state, postalCode, country, phone, isDefault } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAddress = {
            fullName,
            address,
            city,
            state,
            postalCode,
            country,
            phone,
            isDefault: isDefault || false
        };

        // If this is the first address or isDefault is true, handle default status
        if (isDefault || user.addresses.length === 0) {
            user.addresses.forEach(addr => addr.isDefault = false);
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Address creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update an address
router.put('/:addressId', auth, async (req, res) => {
    try {
        const { fullName, address, city, state, postalCode, country, phone, isDefault } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Update address fields
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            fullName,
            address,
            city,
            state,
            postalCode,
            country,
            phone,
            isDefault: isDefault || false
        };

        // If setting as default, update other addresses
        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        await user.save();
        res.json(user.addresses[addressIndex]);
    } catch (error) {
        console.error('Address update error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete an address
router.delete('/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Remove the address
        user.addresses.splice(addressIndex, 1);
        await user.save();

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Address deletion error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Set an address as default
router.put('/:addressId/default', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Set all addresses to non-default
        user.addresses.forEach(addr => addr.isDefault = false);
        // Set the selected address as default
        user.addresses[addressIndex].isDefault = true;

        await user.save();
        res.json(user.addresses[addressIndex]);
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 