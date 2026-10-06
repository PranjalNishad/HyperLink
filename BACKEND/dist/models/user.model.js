import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        //   default: "",
        required: false,
        default: "https://res.cloudinary.com/dxjv0gq1e/image/upload/v1697040915/avatars/default_avatar.png",
    }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
