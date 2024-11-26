import User from "../models/users_model.js"
import mongoose from "mongoose";

const validPhoneNumber = (phoneNumber) => {
    const regex = /^01[0125][0-9]{8}$/;
    return regex.test(phoneNumber.toString());
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addUser = async (req, res) => {
    const user = req.body;
    const newUser = new User(user);
    try {
        if (!validPhoneNumber(user.phone)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
        const existingUser = await User.findOne({
            $or: [
                { phone: user.phone },
                { handle: user.handle }
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.phone === user.phone ?
                    "Phone number already exists" :
                    "Handle already exists"
            });
        }

        await newUser.save();
        res.status(201).json({
            message: "User Added Successfully",
            newUser
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );
        res.status(200).json({
            message: "User Updated Successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User Deleted Successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const validateUserData = (userData) => {
    const trimmedName = String(userData.name || "").trim();
    const trimmedHandle = String(userData.handle || "").trim();
    const trimmedPhone = String(userData.phone || "").trim();
    const trimmedLevel = String(userData.level || "").trim().toLowerCase();
    const groupValue = Number(userData.group || 0);

    if (!trimmedName || !trimmedHandle || !trimmedPhone || !trimmedLevel) {
        return { isValid: false, error: "All fields are required" };
    }

    if (!validPhoneNumber(trimmedPhone)) {
        return { isValid: false, error: "Phone number is invalid" };
    }

    if (!["beginner", "intermediate", "advanced", "general"].includes(trimmedLevel)) {
        return { isValid: false, error: "Invalid level. Must be beginner, intermediate, or advanced" };
    }

    if (isNaN(groupValue)) {
        return { isValid: false, error: "Group must be a number" };
    }

    return {
        isValid: true,
        data: {
            name: trimmedName,
            handle: trimmedHandle,
            phone: trimmedPhone,
            level: trimmedLevel,
            group: groupValue
        }
    };
};

export const addBulkUsers = async (req, res) => {
    const { users } = req.body;

    if (!Array.isArray(users)) {
        return res.status(400).json({ message: "Users data must be an array" });
    }

    const validatedUsers = [];
    const invalidUsers = [];
    const seenPhones = new Set();
    const seenHandles = new Set();

    const existingPhones = await User.distinct("phone");
    const existingHandles = await User.distinct("handle");

    existingPhones.forEach(phone => seenPhones.add(phone));
    existingHandles.forEach(handle => seenHandles.add(handle));

    users.forEach((userData, index) => {
        const validation = validateUserData(userData);
        if (validation.isValid) {
            if (seenPhones.has(validation.data.phone)) {
                invalidUsers.push({
                    rowIndex: index + 1,
                    data: userData,
                    error: "Duplicate phone number"
                });
            }
            else if (seenHandles.has(validation.data.handle)) {
                invalidUsers.push({
                    rowIndex: index + 1,
                    data: userData,
                    error: "Duplicate handle"
                });
            }
            else {
                seenPhones.add(validation.data.phone);
                seenHandles.add(validation.data.handle);
                validatedUsers.push(validation.data);
            }
        } else {
            invalidUsers.push({
                rowIndex: index + 1,
                data: userData,
                error: validation.error
            });
        }
    });

    try {
        let insertedUsers = [];
        if (validatedUsers.length > 0) {
            insertedUsers = await User.insertMany(validatedUsers);
        }

        const response = {
            success: {
                count: insertedUsers.length,
                users: insertedUsers
            },
            failures: {
                count: invalidUsers.length,
                details: invalidUsers
            }
        };

        const status = insertedUsers.length > 0 && invalidUsers.length > 0 ? 207 :
            insertedUsers.length === 0 ? 400 : 201;

        res.status(status).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
