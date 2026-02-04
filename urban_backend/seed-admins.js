const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./src/models/Admin');

const adminAccounts = [
    {
        name: 'Water Department Admin',
        email: 'water@cityos.gov.in',
        password: 'Water@2026',
        role: 'water-admin',
        department: 'water'
    },
    {
        name: 'Electricity Department Admin',
        email: 'electricity@cityos.gov.in',
        password: 'Electric@2026',
        role: 'electricity-admin',
        department: 'electricity'
    },
    {
        name: 'Waste Management Admin',
        email: 'garbage@cityos.gov.in',
        password: 'Waste@2026',
        role: 'garbage-admin',
        department: 'garbage'
    },
    {
        name: 'Roads Department Admin',
        email: 'roads@cityos.gov.in',
        password: 'Roads@2026',
        role: 'roads-admin',
        department: 'roads'
    },
    {
        name: 'Health Department Admin',
        email: 'health@cityos.gov.in',
        password: 'Health@2026',
        role: 'health-admin',
        department: 'health'
    },
    {
        name: 'Sanitation Department Admin',
        email: 'sanitation@cityos.gov.in',
        password: 'Sanitation@2026',
        role: 'sanitation-admin',
        department: 'sanitation'
    },
    {
        name: 'Super Admin',
        email: 'admin@cityos.gov.in',
        password: 'CityOS@2026',
        role: 'admin',
        department: 'general'
    }
];

async function seedAdmins() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const adminData of adminAccounts) {
            const existingAdmin = await Admin.findOne({ email: adminData.email });

            if (existingAdmin) {
                console.log(`⏭️  Admin already exists: ${adminData.email}`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(adminData.password, 10);

            const admin = new Admin({
                name: adminData.name,
                email: adminData.email,
                password: hashedPassword,
                role: adminData.role,
                department: adminData.department,
                isActive: true
            });

            await admin.save();
            console.log(`✅ Created admin: ${adminData.name} (${adminData.email})`);
        }

        console.log('\n🎉 All admin accounts created successfully!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 ADMIN LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════════════════════\n');

        adminAccounts.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name}`);
            console.log(`   Department: ${admin.department.toUpperCase()}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Password: ${admin.password}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('🔐 Save these credentials for login!');
        console.log('═══════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding admins:', error);
        process.exit(1);
    }
}

seedAdmins();
