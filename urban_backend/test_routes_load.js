try {
    console.log('🔄 Attempting to load property routes...');
    const routes = require('./src/routes/propertyRoutes');
    console.log('✅ Property routes loaded successfully');
    console.log('Registered Routes:', routes.stack.map(r => r.route?.path).filter(Boolean));
} catch (error) {
    console.error('❌ Failed to load property routes');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}
