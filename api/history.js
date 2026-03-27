const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data.json');

// Helper to reliably read DB
const readDb = () => {
    try {
        if (!fs.existsSync(dataFilePath)) fs.writeFileSync(dataFilePath, JSON.stringify([]));
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch(err) {
        console.error("DB Read Error", err);
        return [];
    }
}

// GET /api/history -> Return all saved chats
router.get('/', (req, res) => {
    const history = readDb();
    // Sort so newest are first
    res.json(history.sort((a,b) => b.timestamp - a.timestamp));
});

// POST /api/history -> Save a new chat snippet (or bulk payload)
router.post('/', (req, res) => {
    try {
        const { messages, title } = req.body;
        if (!messages || messages.length === 0) return res.status(400).json({ error: "Empty messages array" });

        const history = readDb();
        const newChat = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: title || messages[0]?.text?.substring(0, 40) + "..." || "New Chat",
            messages: messages
        };

        history.push(newChat);
        // Correctly order before storing
        history.sort((a,b) => b.timestamp - a.timestamp);
        fs.writeFileSync(dataFilePath, JSON.stringify(history, null, 2));

        res.json({ success: true, chat: newChat });
    } catch(error) {
        console.error("DB Write Error", error);
        res.status(500).json({ error: "Failed to persist chat." });
    }
});

// DELETE /api/history/:id -> Delete a saved chat
router.delete('/:id', (req, res) => {
    try {
        const history = readDb();
        const filtered = history.filter(chat => chat.id !== req.params.id);
        fs.writeFileSync(dataFilePath, JSON.stringify(filtered, null, 2));
        res.json({ success: true });
    } catch(err) {
        console.error("DB Delete Error", err);
        res.status(500).json({ error: "Failed to delete chat." });
    }
});

module.exports = router;
