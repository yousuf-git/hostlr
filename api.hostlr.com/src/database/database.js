import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const DB_PATH = process.env.MONGODB_URI;

    const connectionInstance = await mongoose.connect(DB_PATH);

    console.log(`════════════════════════════════════════════════════════════
        MongoDB connected...!!
        DB HOST: ${connectionInstance.connection.host}
        DB Name: ${connectionInstance.connection.name}
════════════════════════════════════════════════════════════`);
  } catch (error) {
    console.log("MongoDB connection failed: ", error);
    throw error;
  }
};

export default connectDatabase;
