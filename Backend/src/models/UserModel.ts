interface IUser {
    name: string,
    email: string,
    password: string,
    role: string,
    lastLogin: Date,
    isVerified: boolean,
    resetPasswordToken?: string,
	resetPasswordExpiresAt?: Date,
	verificationToken?: string,
	verificationTokenExpiresAt?: Date,
    twoFactorSecret?: string
}
import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema<IUser>({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpiresAt: {
        type: Date
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpiresAt: {
        type: Date
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    twoFactorSecret: {
        type: String,
        select:false
    }


}, {timestamps: true})


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword: string) {
    return await bcrypt.compare(plainPassword, this.password)
}

userSchema.statics.login = async function (email: string, password: string) {
    const user = await this.findOne({email}).select("+password")
    if(!user) throw new Error("Please verify your email before logging in");

    const isMatch = await user.comparePassword(password)
    if(!isMatch) throw new Error("Invalid email or password");
    return user;
}

const User = mongoose.model<IUser>("User", userSchema)
export default User