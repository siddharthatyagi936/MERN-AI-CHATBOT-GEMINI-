import { connect, disconnect} from "mongoose";
 async function connectToDatabase(){
    try{
        await connect(process.env.MONGODB_URL)
    }catch(error){
      throw new Error("Could not connect to MongoDB");
    }
}

async function disconnectFromDatabase(){
  try {
    await disconnect();
  } catch (error) {
    throw new Error("Could not disconnect to MongoDB");
  }
}

export{connectToDatabase,disconnectFromDatabase};