import mongoose, { Schema, Document } from "mongoose";

export type PaymentMethod = "bkash" | "nogod" | "rocket" | "upay";
export type FONumberStatus = "active" | "inactive";

export interface IFONumber extends Document {
  number_id?: string;
  number: string;
  payment_method: PaymentMethod;
  status: FONumberStatus;
  added_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FONumberSchema: Schema = new Schema(
  {
    number_id: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    number: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    payment_method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["bkash", "nogod", "rocket", "upay"],
        message: "Invalid payment method. Allowed: bkash, nogod, rocket, upay",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either active or inactive",
      },
      default: "active",
      index: true,
    },
    added_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "FO User ID (added_by) is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FONumber = mongoose.model<IFONumber>("FONumber", FONumberSchema);
