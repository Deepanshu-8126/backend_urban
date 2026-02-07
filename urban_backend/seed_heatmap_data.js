const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./src/models/Complaint');

dotenv.config();

const haldwaniComplaints = [
    {
        title: "Garbage Pile Up",
        description: "Massive garbage pile near the court area. Spreading foul smell.",
        category: "Sanitation",
        status: "pending",
        location: { type: "Point", coordinates: [79.5135, 29.2195] }, // Civil Lines
        ward: "Ward 1 (Civil Lines)",
        userId: "65b21a8f9c1a2b3d4e5f6g7h" // Corrected to userId
    },
    {
        title: "Street Light Not Working",
        description: "Main road street lights are off since 3 days.",
        category: "Electricity",
        status: "pending",
        location: { type: "Point", coordinates: [79.5180, 29.2150] }, // Tikonia
        ward: "Ward 5 (Tikonia)",
        userId: "65b21a8f9c1a2b3d4e5f6g7i"
    },
    {
        title: "Water Leakage",
        description: "Main pipeline burst near Mukhani Chauraha.",
        category: "Water Supply",
        status: "working", // Map to working
        location: { type: "Point", coordinates: [79.4950, 29.2150] }, // Mukhani
        ward: "Ward 8 (Mukhani)",
        userId: "65b21a8f9c1a2b3d4e5f6g7j"
    },
    {
        title: "Potholes on Road",
        description: "Dangerous potholes appearing after rains.",
        category: "Roads",
        status: "pending",
        location: { type: "Point", coordinates: [79.5100, 29.2220] }, // Heera Nagar
        ward: "Ward 3 (Heera Nagar)",
        userId: "65b21a8f9c1a2b3d4e5f6g7k"
    },
    {
        title: "Drainage Blockage",
        description: "Drain is overflowing into the main market.",
        category: "Sanitation",
        status: "pending",
        location: { type: "Point", coordinates: [79.4850, 29.2250] }, // Kusumkhera
        ward: "Ward 10 (Kusumkhera)",
        userId: "65b21a8f9c1a2b3d4e5f6g7l"
    },
    {
        title: "Traffic Signal Failure",
        description: "Signal at Tikonia is flickering red and green both.",
        category: "Traffic",
        status: "solved", // Map to solved
        location: { type: "Point", coordinates: [79.5181, 29.2151] }, // Tikonia
        ward: "Ward 5 (Tikonia)",
        userId: "65b21a8f9c1a2b3d4e5f6g7m"
    },
    {
        title: "Encroachment on Footpath",
        description: "Local vendors blocking the entire footpath space.",
        category: "Encroachment",
        status: "pending",
        location: { type: "Point", coordinates: [79.5140, 29.2190] }, // Civil Lines Nearer
        ward: "Ward 1 (Civil Lines)",
        userId: "65b21a8f9c1a2b3d4e5f6g7n"
    },
    // Adding more count to Civil Lines to make it a RED HOTSPOT
    { title: "Waste Burning", description: "Burning of plastic and waste in open area.", category: "Sanitation", status: "pending", location: { type: "Point", coordinates: [79.5136, 29.2196] }, ward: "Ward 1", userId: "65b21a8f9c1a2b3d4e5f6g7o" },
    { title: "Sewer Overflow", description: "Sewer water flooding the street.", category: "Sewerage", status: "pending", location: { type: "Point", coordinates: [79.5134, 29.2194] }, ward: "Ward 1", userId: "65b21a8f9c1a2b3d4e5f6g7p" },
    { title: "Stray Animal Issue", description: "Groups of cattle blocking high traffic road.", category: "General", status: "pending", location: { type: "Point", coordinates: [79.5132, 29.2192] }, ward: "Ward 1", userId: "65b21a8f9c1a2b3d4e5f6g7q" },
    { title: "Illegal Parking", description: "Cars parked on both sides of narrow lane.", category: "Traffic", status: "pending", location: { type: "Point", coordinates: [79.5138, 29.2198] }, ward: "Ward 1", userId: "65b21a8f9c1a2b3d4e5f6g7r" },
    { title: "Garbage Dump", description: "Unauthorized dump site created by locals.", category: "Sanitation", status: "pending", location: { type: "Point", coordinates: [79.5139, 29.2199] }, ward: "Ward 1", userId: "65b21a8f9c1a2b3d4e5f6g7s" }
];

const seedHeatmap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for Heatmap Seeding');

        // Delete existing mock data to avoid clutter
        const result = await Complaint.deleteMany({ title: { $in: haldwaniComplaints.map(c => c.title) } });
        console.log(`🗑️ Deleted ${result.deletedCount} existing demo complaints`);

        await Complaint.insertMany(haldwaniComplaints);
        console.log(`✅ Successfully seeded ${haldwaniComplaints.length} complaints for Haldwani Heatmap demo!`);

        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedHeatmap();
