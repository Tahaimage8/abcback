import mongoose, { Schema, Document, Model, model } from "mongoose";

export interface ICounter extends Document {
  id: string; // Identifier for counter type e.g., 'manager_sub_id' or 'fo_sub_id_<manager_sub_id>'
  seq: number;
}

const CounterSchema: Schema<ICounter> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Counter: Model<ICounter> =
  mongoose.models.Counter || model<ICounter>("Counter", CounterSchema);
