import dbConnect from '../../src/lib/db';
import Mess from '../../src/models/Mess';
import Meal from '../../src/models/Meal';
import mongoose from 'mongoose';

async function checkData() {
  await dbConnect();
  const mess = await Mess.findOne({});
  console.log('Mess Info:', JSON.stringify(mess, null, 2));
  
  if (mess) {
    const meals = await Meal.find({ messId: mess._id }).limit(5);
    console.log('Sample Meals:', JSON.stringify(meals, null, 2));
    
    const activeMonth = mess.initialMonth;
    console.log('Active Month:', activeMonth);
    
    const [monthName, yearName] = activeMonth.split(' ');
    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthNum = monthsArr.indexOf(monthName) + 1;
    const monthPrefix = `${yearName}-${monthNum.toString().padStart(2, '0')}`;
    console.log('Month Prefix:', monthPrefix);
    
    const count = await Meal.countDocuments({
      messId: mess._id,
      $or: [
        { month: activeMonth },
        { date: { $regex: new RegExp(`^${monthPrefix}`) } }
      ]
    });
    console.log('Matching Meal Count:', count);
  }
  
  process.exit(0);
}

checkData();
