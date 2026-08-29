# Simon Says Game 🎮

A classic Simon Says memory game built with HTML, CSS, and vanilla JavaScript. Test your memory by repeating increasingly long sequences of colors.

## 🎯 Features

- **Memory Challenge** - Watch the sequence and repeat it correctly
- **Audio Feedback** - Each color plays a unique tone when pressed
- **Visual Feedback** - Buttons light up when activated
- **Level Tracking** - See your current level as you progress
- **Responsive Design** - Works on desktop and mobile devices
- **No External Dependencies** - Pure HTML, CSS, and JavaScript

## 🎮 How to Play

1. Click the **Start** button to begin
2. Watch the sequence of colors that light up
3. Repeat the sequence by clicking the colored buttons in the same order
4. Each correct sequence adds a new color to remember
5. Make a mistake and the game ends - press Start to try again!

## 🛠️ Technologies Used

- HTML5
- CSS3 (Custom styling with animations)
- JavaScript (Vanilla JS with Web Audio API)

## 📁 Project Structure
simon-says-game/
├── index.html # Main HTML file
├── style.css # All styling
├── script.js # Game logic and audio
└── README.md # Project documentation

text

## 🚀 Getting Started

### Option 1: Open in Browser
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then open http://localhost:8000 in your browser
🎵 Sound System
The game uses the Web Audio API to generate sounds programmatically:

Green: C5 (523.25 Hz)

Red: E5 (659.25 Hz)

Yellow: G5 (783.99 Hz)

Blue: C6 (1046.50 Hz)

🎨 Customization
You can easily customize the game:

Change Sound Style
In script.js, uncomment your preferred sound style:

javascript
const playColorSound = playModernSound; // Clean sine wave
// const playColorSound = playRetroSound; // Square wave (retro)
// const playColorSound = playSound; // Simple tone
Change Colors
Modify the CSS in style.css:

css
#green { background: radial-gradient(circle at 30% 30%, #7dff7d, #1f8b1f); }
#red { background: radial-gradient(circle at 30% 30%, #ff7a7a, #b31b1b); }
/* etc. */
📱 Browser Support
Works in all modern browsers that support:

ES6 JavaScript

Web Audio API

CSS Grid and Flexbox

CSS Transitions

🤝 Contributing
Feel free to fork this repository and submit pull requests for improvements!

📝 License
MIT License - feel free to use this project for learning or personal use.

🙏 Acknowledgments
Inspired by the classic Simon Says electronic game

Built as a learning project for HTML, CSS, and JavaScript

⭐ If you find this project helpful, give it a star on GitHub!
