const express     = require('express');
const ChatSession = require('../models/ChatSession');
const Sale        = require('../models/Sale');
const { protect } = require('../middleware/auth');
const router      = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

// GET /api/chat — all sessions
router.get('/', protect, async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user._id })
            .select('title createdAt')
            .sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/chat — create new session
router.post('/', protect, async (req, res) => {
    try {
        const session = await ChatSession.create({ userId: req.user._id, title: 'New Chat', messages: [] });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/chat/:id — get session with messages
router.get('/:id', protect, async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/chat/:id/ask — send message
router.post('/:id/ask', protect, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question?.trim()) return res.status(400).json({ message: 'Question is required' });

        const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Auto-title from first message
        if (session.messages.length === 0) {
            session.title = question.slice(0, 50);
        }

        // Add user message
        session.messages.push({ role: 'user', content: question });

        // Build sales data summary
        const sales = await Sale.find({ userId: req.user._id })
            .populate({ path: 'productId', populate: { path: 'categoryId' } })
            .populate('customerId');

        const totalRevenue = sales.reduce((s, x) => s + x.price * x.quantity, 0);
        const totalUnits   = sales.reduce((s, x) => s + x.quantity, 0);

        const topProducts = Object.entries(
            sales.reduce((acc, s) => {
                const n = s.productId?.name || 'Unknown';
                if (!acc[n]) acc[n] = { units: 0, revenue: 0 };
                acc[n].units   += s.quantity;
                acc[n].revenue += s.price * s.quantity;
                return acc;
            }, {})
        ).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

        const topRegions = Object.entries(
            sales.reduce((acc, s) => {
                const n = s.region || 'Unknown';
                acc[n] = (acc[n] || 0) + s.price * s.quantity;
                return acc;
            }, {})
        ).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const topCustomers = Object.entries(
            sales.reduce((acc, s) => {
                const n = s.customerId?.name || 'Unknown';
                if (!acc[n]) acc[n] = { orders: 0, revenue: 0 };
                acc[n].orders  += 1;
                acc[n].revenue += s.price * s.quantity;
                return acc;
            }, {})
        ).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const paymentModes = Object.entries(
            sales.reduce((acc, s) => {
                const n = s.paymentMode || 'Unknown';
                if (!acc[n]) acc[n] = { count: 0, revenue: 0 };
                acc[n].count   += 1;
                acc[n].revenue += s.price * s.quantity;
                return acc;
            }, {})
        ).map(([mode, v]) => ({ mode, ...v }));

        const systemPrompt =
            'You are SmartSalesAI, an expert sales analyst for an Indian business.\n\n' +
            'RULES:\n' +
            '1. Always use Rs (Indian Rupees). Never use $ or USD.\n' +
            '2. Answer only from the data provided. Never invent numbers.\n' +
            '3. Be concise and friendly. Use bullet points for lists.\n' +
            '4. For off-topic questions (like "which ai model are you"), answer naturally.\n\n' +
            '=== SALES DATA ===\n' +
            `Total Revenue: Rs ${totalRevenue.toLocaleString('en-IN')}\n` +
            `Total Orders: ${sales.length}\n` +
            `Total Units: ${totalUnits}\n\n` +
            `Top Products:\n${topProducts.map((p, i) => `${i+1}. ${p.name} - Rs ${p.revenue.toLocaleString('en-IN')} (${p.units} units)`).join('\n')}\n\n` +
            `Top Regions:\n${topRegions.map(r => `- ${r.name}: Rs ${r.revenue.toLocaleString('en-IN')}`).join('\n')}\n\n` +
            `Top Customers:\n${topCustomers.map((c, i) => `${i+1}. ${c.name} - Rs ${c.revenue.toLocaleString('en-IN')} (${c.orders} orders)`).join('\n')}\n\n` +
            `Payment Modes:\n${paymentModes.map(p => `- ${p.mode}: ${p.count} transactions`).join('\n')}\n` +
            '==================';

        // Build messages for Groq (last 8 history + current)
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...session.messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        ];

        // Call Groq
        const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

        const groqRes = await fetch(GROQ_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body:    JSON.stringify({ model: GROQ_MODEL, messages: groqMessages, max_tokens: 600, temperature: 0.4 }),
        });

        const groqData = await groqRes.json();

        let answer = 'Sorry, I could not get a response.';
        if (groqRes.ok) {
            answer = groqData.choices?.[0]?.message?.content?.trim() || answer;
        } else {
            answer = `Groq error: ${groqData.error?.message || 'Unknown error'}`;
        }

        // Save assistant reply
        session.messages.push({ role: 'assistant', content: answer });
        await session.save();

        res.json({ answer, sessionId: session._id, title: session.title });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/chat/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;