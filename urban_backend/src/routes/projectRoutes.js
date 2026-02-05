const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); // Mongoose Model
const fs = require('fs');
const path = require('path');

// Seed Route (Import JSON to MongoDB)
router.post('/seed', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, '../../data/haldwani_projects.json');
        if (!fs.existsSync(dataPath)) {
            // Fallback data if file doesn't exist
            return res.status(404).json({ success: false, message: "Seed file not found" });
        }

        const projects = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // Clear existing for demo purposes (optional)
        await Project.deleteMany({});

        // Bulk Insert
        await Project.insertMany(projects);

        res.json({ success: true, message: `Successfully seeded ${projects.length} projects to Database.` });
    } catch (error) {
        console.error("Seed Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Projects
router.get('/', async (req, res) => {
    try {
        // Try Fetching from DB
        let projects = await Project.find().sort({ 'financials.allocated': -1 });

        // If DB empty, fallback to reading file directly (Mock Mode)
        if (projects.length === 0) {
            const dataPath = path.join(__dirname, '../../data/haldwani_projects.json');
            if (fs.existsSync(dataPath)) {
                projects = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            }
        }

        const totalFunds = projects.reduce((acc, p) => acc + (p.financials?.allocated || 0), 0);
        const totalSpent = projects.reduce((acc, p) => acc + (p.financials?.spent || 0), 0);

        res.json({
            success: true,
            data: projects,
            meta: {
                totalFunds,
                totalSpent,
                count: projects.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Advanced Analytics (MPLADS Summary)
router.get('/analytics', async (req, res) => {
    try {
        let projects = await Project.find();
        if (projects.length === 0) {
            const dataPath = path.join(__dirname, '../../data/haldwani_projects.json');
            if (fs.existsSync(dataPath)) {
                projects = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            }
        }

        // Calculations for Charts
        const statusCounts = { 'Planned': 0, 'In-Progress': 0, 'Completed': 0 };
        const categorySpending = {}; // { 'Infrastructure': 4500000, ... }

        projects.forEach(p => {
            // Status Count
            if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;

            // Category Spending
            if (!categorySpending[p.category]) categorySpending[p.category] = 0;
            categorySpending[p.category] += (p.financials?.spent || 0);
        });

        // MPLADS Specific Summary (Simulated based on Real Data)
        // "Allocated Limit" typically comes from a static ceiling (e.g., 5 Cr per year per MP).
        // Here we sum up our projects to create the "Works Sanctioned" and "Expenditure".

        const worksSanctionedCount = projects.length;
        const worksSanctionedCost = projects.reduce((acc, p) => acc + (p.financials?.allocated || 0), 0);

        const worksCompletedCount = statusCounts['Completed'];
        const worksCompletedCost = projects
            .filter(p => p.status === 'Completed')
            .reduce((acc, p) => acc + (p.financials?.spent || 0), 0);

        const expenditureTotal = projects.reduce((acc, p) => acc + (p.financials?.spent || 0), 0);

        const mpladsSummary = {
            allocatedLimit: 50000000, // ₹5 Cr (Simulated Limit)
            amountConsented: 10700000, // ₹1.07 Cr (Simulated Calamity Relief)
            worksRecommended: { count: worksSanctionedCount + 5, cost: worksSanctionedCost + 15000000 }, // Slightly higher
            worksSanctioned: { count: worksSanctionedCount, cost: worksSanctionedCost },
            worksCompleted: { count: worksCompletedCount, cost: worksCompletedCost },
            expenditureOnDate: expenditureTotal
        };

        res.json({
            success: true,
            data: {
                summary: mpladsSummary,
                charts: {
                    status: statusCounts,
                    spending: categorySpending
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
