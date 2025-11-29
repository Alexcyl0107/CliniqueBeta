
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinique')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // In production, use bcrypt!
  role: { type: String, enum: ['patient', 'admin'], default: 'patient' },
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  doctorId: String,
  date: String,
  reason: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Utils
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Routes

// 1. Register
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password: hashPassword(password)
    });

    await newUser.save();
    
    // Return user without password
    const { password: _, ...userToSend } = newUser.toObject();
    res.status(201).json(userToSend);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// 2. Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password: hashPassword(password) });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const { password: _, ...userToSend } = user.toObject();
    res.json(userToSend);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// 3. Appointments (Create)
app.post('/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du rendez-vous' });
  }
});

// 4. Appointments (List - Admin)
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// 5. Appointments (Update Status)
app.patch('/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
