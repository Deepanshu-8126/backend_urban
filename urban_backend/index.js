const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); // Ye line aapke Flutter app ko connect karne degi

app.get('/', (req, res) => res.send('Backend is Live!'));

// 0.0.0.0 likhna zaroori hai taaki network par access ho sake
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});