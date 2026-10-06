import { Counter } from "../models/Counter.js";

/**
 * Gets the next auto-incremented sequence for a given counter ID.
 * @param counterId Unique string identifier for the counter (e.g. 'manager_sub_id')
 * @param startSequence Initial number if counter doesn't exist yet (default 1)
 */
export async function getNextSequence(
  counterId: string,
  startSequence: number = 1
): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // If newly created and value is 1, but we specified custom startSequence (e.g., 314 for manager)
  if (counter.seq < startSequence) {
    const updatedCounter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $set: { seq: startSequence } },
      { new: true }
    );
    return updatedCounter ? updatedCounter.seq : startSequence;
  }

  return counter.seq;
}
