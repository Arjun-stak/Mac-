const express = require('express');
const bodyParser = require('body-parser');
const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Dynamic port for deployment

// Middleware to parse POST requests
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (frontend)

// Route to handle Instagram video scraping
app.post('/download', async (req, res) => {
    const instagramUrl = req.body.url;

    if (!instagramUrl) {
        return res.status(400).send({ error: 'Invalid URL' });
    }

    try {
        // Fetch the HTML of the Instagram post
        const html = await requestPromise(instagramUrl);
        const $ = cheerio.load(html);

        // Extract video URL (the meta property that holds video URL)
        const videoUrl = $('meta[property="og:video"]').attr('content');

        if (videoUrl) {
            return res.status(200).json({ videoUrl });
        } else {
            return res.status(404).send({ error: 'Video not found' });
        }
    } catch (error) {
        return res.status(500).send({ error: 'Failed to fetch video' });
    }
});

// Fallback route for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});