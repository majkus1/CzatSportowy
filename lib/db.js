const mongoose = require('mongoose');

async function connectToDb() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    console.log('Already connected to the database.');
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

export default connectToDb;
