"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FontPicker = () => {
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState('');

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_FONTS_API_KEY; // Ensure your API key is stored in .env.local
    axios.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`)
      .then(response => {
        const fontFamilies = response.data.items.map(font => font.family);
        setFonts(fontFamilies);
        setSelectedFont(fontFamilies[0]); // Set initial font to the first one in the list
      })
      .catch(error => console.error('Error fetching fonts:', error));
  }, []);

  return (
    <div>
      <h1>Font Picker</h1>
      <select
        value={selectedFont}
        onChange={e => setSelectedFont(e.target.value)}
        style={{ fontFamily: selectedFont, fontSize: '16px' }}
      >
        {fonts.map(font => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
      <p style={{ fontFamily: selectedFont, fontSize: '24px' }}>
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
};

export default FontPicker;