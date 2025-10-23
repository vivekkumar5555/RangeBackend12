import mongoose from "mongoose";

const { Schema, model } = mongoose;

const leadSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const leadVerificationModel = model("LeadVerification", leadSchema);

export { leadVerificationModel };