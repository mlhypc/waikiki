require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

async function clearDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();

    console.log('\n📊 Current Database Status:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Total: ${userCount + eventCount} documents`);

    if (userCount === 0 && eventCount === 0) {
      console.log('\n✓ Database is already empty. Nothing to clear.');
      await mongoose.connection.close();
      return;
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('   This action cannot be undone.');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nType "YES" to confirm deletion: ', async (answer) => {
      if (answer.trim() === 'YES') {
        console.log('\n🗑️  Clearing database...\n');

        // Delete all users
        const deletedUsers = await User.deleteMany({});
        console.log(`✓ Deleted ${deletedUsers.deletedCount} users`);

        // Delete all events
        const deletedEvents = await Event.deleteMany({});
        console.log(`✓ Deleted ${deletedEvents.deletedCount} events`);

        console.log('\n✅ Database cleared successfully!');
        console.log(`   Total deleted: ${deletedUsers.deletedCount + deletedEvents.deletedCount} documents`);
      } else {
        console.log('\n❌ Deletion cancelled.');
      }

      readline.close();
      await mongoose.connection.close();
      console.log('\n✓ Disconnected from MongoDB');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Error clearing database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
clearDatabase();
