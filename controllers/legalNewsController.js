const LegalNews = require('../models/LegalNews');

const getAllNews = async (req, res) => {
  try {
    const news = await LegalNews.find().sort({ publishedDate: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addNews = async (req, res) => {
  try {
    const { title, summary, category, sourceUrl, sourceName, publishedDate } = req.body;
    const item = new LegalNews({ title, summary, category, sourceUrl, sourceName, publishedDate });
    await item.save();
    res.status(201).json({ message: 'News item added successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllNews, addNews };
