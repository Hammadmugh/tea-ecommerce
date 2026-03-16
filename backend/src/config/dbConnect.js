import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      `DataBase connected : ${connect.connection.host}, ${connect.connection.name}`
    );
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

export default dbConnect;