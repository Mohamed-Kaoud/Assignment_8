import mongoose from "mongoose";

const checkConnectionDB = async () => {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/myDB", {
      serverSelectionTimeoutMS: 1000,
    })
    .then(() => {
      console.log(`DB connected successfully`);
    })
    .catch((error) => {
      console.log(`Fail to connect DB`, { Error: error.message });
    });
};

export default checkConnectionDB;
