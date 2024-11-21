import User from "../models/users_model.js"
import mongoose from "mongoose";

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
        await newUser.save();
        res.status(201).json({
            message: "User Added Successfully",
            newUser
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

};

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