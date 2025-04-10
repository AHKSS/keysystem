const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, 'public')));

// Sunucusuz işlevler için API rotaları
app.use('/api', require('./api/getkey'));
app.use('/api', require('./api/verifykey'));

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlatma
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor...`);
});
