import User from "../models/user.model.js";

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
}

export const findUserById = async (id: string) => {
    return await User.findById(id);
}

export const createUser = async (name: string, email: string, password: string) => {
    const newUser = new User({ name, email, password });
    await newUser.save();
    return newUser;
}