
// getkey.js
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');

const KEYS_FILE_PATH = path.join(__dirname, 'keys.json');

// Helper function to generate random key
const generateKey = () => {
    return Math.random().toString(36).substr(2, 16); // 16 karakterli rastgele key
};

module.exports = async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Veritabanı (keys.json) dosyasını kontrol et
    let keys = [];
    try {
        keys = JSON.parse(readFileSync(KEYS_FILE_PATH));
    } catch (err) {
        // Dosya yoksa başlat
        keys = [];
    }

    // Eğer IP zaten var ve 15 dakikadan önce key almışsa, yeni key veremeyiz
    const existingKey = keys.find(entry => entry.ip === ip);
    if (existingKey) {
        const createdAt = new Date(existingKey.created);
        if (new Date() - createdAt < 15 * 60 * 1000) {
            return res.status(400).json({
                status: "error",
                message: "15 dakika içinde tekrar key alamazsınız."
            });
        }
    }

    // Yeni key üret
    const key = generateKey();
    const newEntry = {
        ip,
        key,
        created: new Date().toISOString(),
        used: false
    };

    // Yeni key'i kaydet
    keys.push(newEntry);
    writeFileSync(KEYS_FILE_PATH, JSON.stringify(keys));

    return res.status(200).json({
        status: "success",
        key
    });
};
