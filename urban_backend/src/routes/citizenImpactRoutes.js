const express = require('express');
const router = express.Router();

// Mock Gamification Data (In-Memory for Demo)
const impactData = {
    xp: 2450,
    level: 5,
    nextLevelXp: 3000,
    impactScore: 88, // Out of 100
    badges: [
        { id: '1', name: "Road Warrior", icon: "🚧", description: "Reported 5 road issues" },
        { id: '2', name: "Eco Hero", icon: "🌱", description: "Participated in tree plantation" },
        { id: '3', name: "Night Watch", icon: "💡", description: "Reported 3 street light issues" }
    ],
    leaderboard: [
        { rank: 1, name: "Arjun K.", points: 3200, avatar: "A" },
        { rank: 2, name: "Demo User", points: 2450, avatar: "D" }, // Current User
        { rank: 3, name: "Priya S.", points: 2100, avatar: "P" },
        { rank: 4, name: "Rahul M.", points: 1800, avatar: "R" },
        { rank: 5, name: "Sita V.", points: 1500, avatar: "S" }
    ]
};

// Get Impact Stats
router.get('/', (req, res) => {
    res.json({ success: true, data: impactData });
});

module.exports = router;
