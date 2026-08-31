import mongoose, { Schema, Document } from "mongoose";

export interface INumberEntry extends Document {
  userId?: string;
  userName: string;
  mobileNumber: string;
  numbers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NumberEntrySchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: false,
      index: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    numbers: {
      type: [String],
      required: true,
      validate: {
        validator: function (val: string[]) {
          return Array.isArray(val) && val.length === 10;
        },
        message: "Exactly 10 mobile numbers are required",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const NumberEntry = mongoose.model<INumberEntry>("NumberEntry", NumberEntrySchema);
