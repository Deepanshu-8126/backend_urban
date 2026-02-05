const express = require('express');
const router = express.Router();

// Mock Data for Haldwani (Demo Purposes)
// Real implementation would fetch from DB (Project.find())
const mockProjects = [
    {
        id: '1',
        title: 'Community Hall Construction - Banbhoolpura',
        description: 'Construction of a multi-purpose community hall for public gatherings and events.',
        category: 'Infrastructure',
        location: { city: 'Haldwani', address: 'Banbhoolpura, Haldwani', lat: 29.2150, lng: 79.5180 },
        financials: { allocated: 2500000, spent: 1000000, contractor: 'Nainital Constructions' }, // ₹25L
        status: 'In-Progress',
        progress: 40,
        dates: { start: '2025-02-01', end: '2025-12-01' },
        images: ['community_hall.jpg']
    },
    {
        id: '2',
        title: 'Solar Street Lights - Kaladhungi Road',
        description: 'Installation of high-efficiency solar street lights along the main highway.',
        category: 'Infrastructure',
        location: { city: 'Haldwani', address: 'Kaladhungi Road', lat: 29.2200, lng: 79.5100 },
        financials: { allocated: 1250000, spent: 1250000, contractor: 'Green Solars UK' }, // ₹12.5L
        status: 'Completed',
        progress: 100,
        dates: { start: '2024-11-01', end: '2025-01-15' },
        images: ['solar_lights.jpg']
    },
    {
        id: '3',
        title: 'Medical Equipment - Base Hospital',
        description: 'Procurement of advanced X-ray machines and dialysis units for the civil hospital.',
        category: 'Health',
        location: { city: 'Haldwani', address: 'Base Hospital, Haldwani', lat: 29.2100, lng: 79.5100 },
        financials: { allocated: 4500000, spent: 500000, contractor: 'MediTech Supplies' }, // ₹45L
        status: 'Planned',
        progress: 10,
        dates: { start: '2025-04-01', end: '2025-09-01' },
        images: ['hospital_equip.jpg']
    },
    {
        id: '4',
        title: 'Concrete Road - Kusumkhera Block',
        description: 'Laying of 2km durable concrete road connecting inner rural blocks.',
        category: 'Infrastructure',
        location: { city: 'Haldwani', address: 'Kusumkhera', lat: 29.2350, lng: 79.5000 },
        financials: { allocated: 1875000, spent: 1500000, contractor: 'UK Rural Roads Dept' }, // ₹18.75L
        status: 'In-Progress',
        progress: 80,
        dates: { start: '2024-12-01', end: '2025-03-31' },
        images: ['concrete_road.jpg']
    },
    {
        id: '5',
        title: 'Smart Classroom - GIC Haldwani',
        description: 'Digital classroom setup with interactive boards for Govt Inter College.',
        category: 'Education',
        location: { city: 'Haldwani', address: 'Nainital Road', lat: 29.2250, lng: 79.5200 },
        financials: { allocated: 800000, spent: 800000, contractor: 'EduTech India' }, // ₹8L
        status: 'Completed',
        progress: 100,
        dates: { start: '2024-10-01', end: '2025-01-30' },
        images: ['smart_class.jpg']
    }
];

// Get All Projects (Filtered by City optional)
router.get('/', (req, res) => {
    // In real app: const projects = await Project.find({ 'location.city': req.query.city });
    res.json({
        success: true,
        data: mockProjects,
        meta: {
            totalFunds: mockProjects.reduce((acc, p) => acc + p.financials.allocated, 0),
            totalSpent: mockProjects.reduce((acc, p) => acc + p.financials.spent, 0),
            count: mockProjects.length
        }
    });
});

// Get Stats
router.get('/stats', (req, res) => {
    const totalAllocated = mockProjects.reduce((acc, p) => acc + p.financials.allocated, 0);
    const totalSpent = mockProjects.reduce((acc, p) => acc + p.financials.spent, 0);

    const statusCounts = {
        'Planned': 0, 'In-Progress': 0, 'Completed': 0, 'Halted': 0
    };
    mockProjects.forEach(p => statusCounts[p.status]++);

    res.json({
        success: true,
        data: {
            financials: { allocated: totalAllocated, spent: totalSpent },
            statusDistribution: statusCounts
        }
    });
});

module.exports = router;
