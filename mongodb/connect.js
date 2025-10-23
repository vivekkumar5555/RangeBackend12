import mongoose from "mongoose";

const ConnectionDb = async (MONGO_URI) => {
  try {
    const connect = await mongoose.connect(`${MONGO_URI}`);

    if (connect) {
      console.log("Connected To Database");
      console.log("Database Name:", connect.connection.name);
      console.log("Connection State:", connect.connection.readyState);
    }else{
        console.log("not connected to database")
    }
  } catch (error) {
    console.log("Error in Connecting To Database", error.message);
  }
};

export default ConnectionDb;