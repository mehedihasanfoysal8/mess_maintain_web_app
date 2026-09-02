import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const Mess = mongoose.model('Mess', new mongoose.Schema({ name: String, initialMonth: String }), 'messes');
  const messes = await Mess.find();
  console.log(messes);
  process.exit(0);
}
check();
