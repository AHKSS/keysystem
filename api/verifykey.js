// Verify key.js
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');

const KEYS_FILE_PATH = path.join(__dirname, 'keys.json');

module.exports = async (req, res) => {
    const { key } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!key) {
        return res.status(400).json({ status: "error", message: "Key gerekli" });
    }

    // Veritabanı (keys.json) dosyasını kontrol et
    let keys = [];
    try {
        keys = JSON.parse(readFileSync(KEYS_FILE_PATH));
    } catch (err) {
        // Dosya yoksa başlat
        keys = [];
    }

    // Key'i doğrula
    const entry = keys.find(entry => entry.ip === ip && entry.key === key);

    if (!entry) {
        return res.status(400).json({ status: "error", message: "Geçersiz key." });
    }

    if (entry.used) {
        return res.status(400).json({ status: "error", message: "Key zaten kullanıldı." });
    }

    // Key kullanıldığını işaretle
    entry.used = true;
    writeFileSync(KEYS_FILE_PATH, JSON.stringify(keys));

    return res.status(200).json({
        status: "success",
        message: "Key doğru, kullanım onaylandı."
    });
};
