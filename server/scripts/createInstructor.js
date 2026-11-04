import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { User } from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classcast';

async function promptInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function createInstructor() {
  const args = process.argv.slice(2);
  let name = args[0];
  let email = args[1];
  let password = args[2];
  let headline = args[3] || 'ClassCast Instructor & Subject Matter Specialist';

  if (!name || !email || !password) {
    console.log('[ClassCast] Create Instructor CLI');
    name = name || await promptInput('Enter Instructor Full Name: ');
    email = email || await promptInput('Enter Instructor Email: ');
    password = password || await promptInput('Enter Instructor Password (min 6 chars): ');
  }

  if (!name || !email || !password || password.length < 6) {
    console.error('[ClassCast] Error: Name, email, and password (at least 6 characters) are required.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[ClassCast] Connected to MongoDB at ${MONGODB_URI}`);

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.role === 'Instructor') {
        console.log(`[ClassCast] An Instructor account with email '${normalizedEmail}' already exists.`);
      } else {
        existing.role = 'Instructor';
        await existing.save();
        console.log(`[ClassCast] Account '${normalizedEmail}' upgraded to Instructor role.`);
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash = await User.hashPassword(password);
    const newInstructor = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Instructor',
      headline,
      avatarPreset: 'emerald-orb',
    });

    await newInstructor.save();
    console.log(`\nSUCCESS: Instructor created successfully!`);
    console.log(`Name:     ${newInstructor.name}`);
    console.log(`Email:    ${newInstructor.email}`);
    console.log(`Role:     ${newInstructor.role}`);
    console.log(`Headline: ${newInstructor.headline}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[ClassCast] Failed to create instructor:', err.message);
    process.exit(1);
  }
}

createInstructor();
