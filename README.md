# The Code Game - Technical Documentation v1.1.0

## 🎮 Project Overview

The Code Game is an educational web application inspired by Neal Agarwal's "The Game" that teaches programming concepts through progressive, rule-based challenges. Students write code that must satisfy increasingly complex rules, with real-time validation and live preview across HTML, CSS, and JavaScript.

### Core Features

-   **Progressive rule-based learning system** - 18 levels across 3 categories
-   **Split-screen interface** (code editor + live preview)
-   **Auto-advancing rules** upon completion (v1.0.1)
-   **Smart rule visibility** - only current and completed rules shown
-   **Multi-language support** - HTML, CSS, and JavaScript levels
-   **Pixelated retro aesthetic** with responsive design
-   **Real-time code validation** with multiple check types
-   **Educational hints system** with detailed explanations
-   **Advanced debug mode** with Shift+D toggle
-   **Modular ES6 architecture** for easy extension
-   **User progress tracking** with XP system
-   **Level prerequisites** and unlocking system

---

## 📁 Folder Structure

```
code-game/
├── index.html                 # Main entry point
├── README.md                 # Technical documentation
├── LICENSE                   # MIT License
│
├── src/
│   ├── js/
│   │   ├── main.js          # Application entry point & game initialization
│   │   ├── game.js          # Core game logic & rule progression
│   │   ├── levelManager.js  # Level loading & unlock management
│   │   ├── ruleEngine.js    # Rule validation system
│   │   ├── ui.js           # UI components & user interactions
│   │   ├── userManager.js  # User authentication & progress tracking
│   │   └── debug.js        # Debug mode with Shift+D toggle
│   │
│   ├── css/
│   │   ├── main.css         # Global styles & typography
│   │   └── game.css         # Game-specific UI styles
│   │
│   ├── data/levels/
│   │   ├── HTML/           # HTML lessons (6 levels)
│   │   │   ├── level1.json  # Text and paragraphs
│   │   │   ├── level2.json  # Headings and formatting
│   │   │   ├── level3.json  # Links and lists
│   │   │   ├── level4.json  # Images and attributes
│   │   │   ├── level5.json  # Forms and inputs
│   │   │   └── level6.json  # Tables and structure
│   │   │
│   │   ├── CSS/            # CSS lessons (6 levels)
│   │   │   ├── level1.json  # Colors and basic styling
│   │   │   ├── level2.json  # Fonts and text styling
│   │   │   ├── level3.json  # Borders and spacing
│   │   │   ├── level4.json  # Layout and positioning
│   │   │   ├── level5.json  # Flexbox basics
│   │   │   └── level6.json  # Responsive design
│   │   │
│   │   ├── JAVASCRIPT/     # JavaScript lessons (6 levels)
│   │   │   ├── level1.json  # Variables and output
│   │   │   ├── level2.json  # Functions and events
│   │   │   ├── level3.json  # Conditionals and logic
│   │   │   ├── level4.json  # Loops and arrays
│   │   │   ├── level5.json  # DOM manipulation
│   │   │   └── level6.json  # Interactive features
│   │   │
│   │   └── dataBlock-HTML.json  # Legacy HTML definitions
│   │
│   └── assets/
│       └── icons/           # SVG icons for levels (future)
│
└── tests/                   # Future testing setup
    ├── unit/               # Unit tests
    └── e2e/                # End-to-end tests
```

---

## 📋 Version History

### Version 1.1.1 (Current)
- **Visual Enhancements**:
  - Added animated background with floating pixelated code symbols
  - Pixelated HTML `<>`, CSS `{}`, and JavaScript `()` symbols with sparkle animations
  - Background animations work across both level selection and game screens
  - Symbols randomly appear with varying animation delays and durations
  - Some symbols have pulse effects for added visual interest

### Version 1.1.0

-   **Multi-Language Support**:

    -   Added 18 comprehensive levels across HTML, CSS, and JavaScript
    -   Implemented level prerequisites and progressive unlocking
    -   Enhanced rule validation with multiple check types (contains, regex, custom)
    -   User authentication and progress tracking system
    -   XP system with level completion rewards

-   **Content Expansion**:

    -   6 HTML levels: from basic text to complex forms and tables
    -   6 CSS levels: from colors to responsive design and Flexbox
    -   6 JavaScript levels: from variables to interactive DOM manipulation
    -   Educational progression with proper prerequisite chains

-   **Developer Experience**:
    -   Comprehensive lesson creation guides (this documentation)
    -   Standardized JSON level format for easy contribution
    -   Template files and examples for each lesson type

### Version 1.0.1

-   **UI/UX Improvements**:

    -   Added author info and GitHub link to main screen
    -   Reorganized header layout (progress left, title center, back button right)
    -   Removed bottom bar, moved all controls to header
    -   Fixed game layout to fit screen without scrolling
    -   Auto-advancing rules with 1.5s delay after completion
    -   Smart rule visibility: only current rule (top) + completed rules shown
    -   Enhanced rule styling with current rule highlighting
    -   Removed manual "Next Rule" button for smoother flow

-   **Technical Fixes**:
    -   Fixed HTML tag display in rule text using proper HTML entities
    -   Improved debug logging with better error handling
    -   Enhanced auto-advance logic with timeout management

### Version 1.0.0

-   Initial modular architecture implementation
-   Complete refactor from single-file to ES6 modules
-   Debug mode with Shift+D toggle
-   Comprehensive logging system
-   JSON-based level data structure

---

## 🐛 Debug Mode Implementation

### Debug System Features

-   **Shift+D Toggle**: Instantly enable/disable debug mode
-   **Live Debug Panel**: Real-time log display in top-right corner
-   **Categorized Logging**: Color-coded logs (INIT, GAME, RULE, LEVEL, UI, ERROR)
-   **Copy to Clipboard**: Export all logs as formatted text
-   **Clear Logs**: Reset log history
-   **Console Integration**: Styled console logs when enabled
-   **Toast Notifications**: Visual feedback for debug actions

### Debug Categories

```javascript
// Available debug categories with color coding:
INIT    (Green)  - Component initialization
GAME    (Orange) - Game flow and state changes
RULE    (Red)    - Rule validation and checking
LEVEL   (Purple) - Level loading and management
UI      (Blue)   - User interface events
ERROR   (Red)    - Error tracking and debugging
```

### Usage

```javascript
// Debug logging examples:
Debug.logGameFlow("Action description", { data });
Debug.logRuleValidation("Rule message", { ruleData });
Debug.logLevelEvent("Event", levelId, { details });
Debug.logUIEvent("UI action", { eventData });
Debug.logError(error, "Context description");
```

---

## 🔧 Code Refactoring Guide

### 1. **main.js** - Application Entry Point

```javascript
// Initialize game modules
import { Game } from "./game.js";
import { LevelManager } from "./levelManager.js";
import { UI } from "./ui.js";

class CodeGame {
	constructor() {
		this.ui = new UI();
		this.levelManager = new LevelManager();
		this.game = null;
	}

	async init() {
		await this.levelManager.loadLevels();
		this.ui.showLevelSelect(this.levelManager.levels);
		this.bindEvents();
	}

	bindEvents() {
		this.ui.on("levelSelected", (level) => this.startLevel(level));
		this.ui.on("backToMenu", () => this.showMenu());
	}

	startLevel(levelId) {
		const levelData = this.levelManager.getLevel(levelId);
		this.game = new Game(levelData, this.ui);
		this.game.start();
	}
}

// Start application
const app = new CodeGame();
app.init();
```

### 2. **game.js** - Core Game Logic

```javascript
export class Game {
	constructor(levelData, ui) {
		this.level = levelData;
		this.ui = ui;
		this.currentRuleIndex = 0;
		this.completedRules = new Set();
		this.ruleEngine = new RuleEngine();
	}

	start() {
		this.ui.showGameScreen(this.level);
		this.bindEvents();
		this.renderRules();
	}

	checkCode(code) {
		const results = this.ruleEngine.validate(
			code,
			this.level.rules,
			this.currentRuleIndex
		);
		this.updateUI(results);

		if (results.currentRulePassed && results.allPreviousRulesPassed) {
			this.advanceToNextRule();
		}
	}

	advanceToNextRule() {
		if (this.currentRuleIndex < this.level.rules.length - 1) {
			this.currentRuleIndex++;
			this.renderRules();
		} else {
			this.completeLevel();
		}
	}
}
```

### 3. **levelManager.js** - Level Data Management

```javascript
export class LevelManager {
	constructor() {
		this.levels = [];
		this.unlockedLevels = new Set(["html"]); // Start with HTML unlocked
	}

	async loadLevels() {
		const levelFiles = [
			"dataBlock-HTML.json",
			"dataBlock-CSS.json",
			"dataBlock-JavaScript.json",
		];

		for (const file of levelFiles) {
			const data = await fetch(`/src/data/levels/${file}`);
			const level = await data.json();
			this.levels.push(this.processLevel(level));
		}
	}

	processLevel(levelData) {
		// Convert rule check strings to functions
		levelData.rules = levelData.rules.map((rule) => ({
			...rule,
			check: this.createCheckFunction(rule.checkType, rule.checkParams),
		}));
		return levelData;
	}

	createCheckFunction(type, params) {
		const checkFunctions = {
			contains: (code) => code.includes(params.text),
			regex: (code) =>
				new RegExp(params.pattern, params.flags).test(code),
			count: (code) =>
				(code.match(new RegExp(params.pattern, "g")) || []).length >=
				params.min,
			custom: (code) => eval(params.function), // Be careful with eval in production
		};

		return checkFunctions[type] || (() => false);
	}
}
```

### 4. **Data Structure - dataBlock-HTML.json**

```json
{
	"id": "html",
	"name": "HTML BASICS",
	"description": "Master the structure of the web",
	"icon": "html-icon.svg",
	"difficulty": "beginner",
	"rules": [
		{
			"id": 1,
			"text": "Type any text to get started!",
			"hint": "HTML can display text directly. Try typing 'Hello World' or any message you like.",
			"checkType": "custom",
			"checkParams": {
				"function": "(code) => code.trim().length > 0"
			}
		},
		{
			"id": 2,
			"text": "Now wrap your text in a <p> tag",
			"hint": "The <p> tag creates a paragraph. Use it like this: <p>Your text here</p>.",
			"checkType": "contains",
			"checkParams": {
				"text": "<p>"
			},
			"additionalChecks": [
				{
					"checkType": "contains",
					"checkParams": { "text": "</p>" }
				}
			]
		}
	],
	"completion": {
		"unlocks": ["css"],
		"message": "🎉 You've mastered HTML basics! CSS is now unlocked!",
		"achievement": "html_master"
	}
}
```

---

## 🚀 Phase 2 Development Plan

### Phase 2.1: Enhanced Learning Features (2 weeks)

#### 1. **Achievement System**

-   [ ] Design achievement badges (SVG, pixelated style)
-   [ ] Implement achievement tracking
-   [ ] Create achievement notification system
-   [ ] Add achievement gallery/profile page

#### 2. **Progress Persistence**

-   [ ] Implement localStorage save system
-   [ ] Add user profiles (local)
-   [ ] Save partial progress within levels
-   [ ] Export/import progress feature

#### 3. **Enhanced Feedback System**

-   [ ] Add syntax highlighting in code editor
-   [ ] Implement error messages with line numbers
-   [ ] Create visual indicators for syntax errors
-   [ ] Add "Show Solution" feature (after X attempts)

### Phase 2.2: Content Expansion (3 weeks)

#### 1. **CSS Level Development**

Rules progression:

-   Basic selectors (element, class, id)
-   Colors and backgrounds
-   Box model (margin, padding, border)
-   Flexbox challenges
-   Advanced: animations, media queries

#### 2. **JavaScript Level Development**

Rules progression:

-   Variables and data types
-   Functions and return values
-   Arrays and loops
-   DOM manipulation
-   Advanced: async/promises

#### 3. **Advanced Levels**

-   React basics
-   SQL queries
-   Git commands
-   Regex patterns

### Phase 2.3: Gamification Features (2 weeks)

#### 1. **Scoring System**

-   [ ] Time-based scoring
-   [ ] Hint penalty system
-   [ ] Efficiency bonus (code length)
-   [ ] Global leaderboard (optional)

#### 2. **Challenge Modes**

-   [ ] Speed run mode
-   [ ] Minimal code challenge
-   [ ] Daily challenges
-   [ ] Community-created levels

#### 3. **Visual/Audio Enhancements**

-   [ ] Particle effects for completions
-   [ ] 8-bit sound effects
-   [ ] Background music (toggleable)
-   [ ] Screen shake effects

### Phase 2.4: Technical Improvements (2 weeks)

#### 1. **Code Quality**

-   [ ] Implement TypeScript
-   [ ] Add comprehensive testing
-   [ ] Set up CI/CD pipeline
-   [ ] Performance optimization

#### 2. **Security**

-   [ ] Implement proper HTML sanitization
-   [ ] Secure code execution for preview
-   [ ] Rate limiting for submissions
-   [ ] XSS prevention

#### 3. **Analytics**

-   [ ] Track learning progress
-   [ ] Identify problem areas
-   [ ] A/B testing for rules
-   [ ] Generate progress reports

### Phase 2.5: Platform Features (3 weeks)

#### 1. **Teacher Dashboard**

-   [ ] Class management
-   [ ] Progress tracking
-   [ ] Custom rule creation
-   [ ] Assignment system

#### 2. **Student Features**

-   [ ] Peer challenges
-   [ ] Code sharing
-   [ ] Help system
-   [ ] Progress certificates

#### 3. **Mobile Support**

-   [ ] Responsive design optimization
-   [ ] Touch-friendly interface
-   [ ] Mobile code editor
-   [ ] Offline mode

---

## 🛠️ Technical Stack Recommendations

### Current Stack

-   Vanilla JavaScript
-   HTML5/CSS3
-   No build process

### Recommended Upgrades

```json
{
	"frontend": {
		"framework": "React or Vue.js",
		"stateManagement": "Redux or Pinia",
		"styling": "Styled Components or CSS Modules",
		"codeEditor": "CodeMirror or Monaco Editor",
		"testing": "Jest + React Testing Library"
	},
	"buildTools": {
		"bundler": "Vite or Webpack 5",
		"transpiler": "Babel or TypeScript",
		"linter": "ESLint + Prettier"
	},
	"backend": {
		"api": "Node.js + Express",
		"database": "PostgreSQL or MongoDB",
		"authentication": "JWT + OAuth2",
		"hosting": "Vercel or Netlify"
	}
}
```

---

## 📊 Success Metrics

### Learning Metrics

-   Rule completion rate
-   Average time per rule
-   Hint usage frequency
-   Error patterns

### Engagement Metrics

-   Session duration
-   Return rate
-   Level completion rate
-   Achievement unlock rate

### Technical Metrics

-   Page load time < 2s
-   Code validation < 100ms
-   60fps animations
-   Mobile score > 90

---

## 🔒 Security Considerations

### Code Execution Safety

```javascript
// Safe preview rendering
function sanitizeHTML(code) {
	const wrapper = document.createElement("div");
	wrapper.innerHTML = code;

	// Remove dangerous elements
	const dangerous = wrapper.querySelectorAll("script, iframe, object, embed");
	dangerous.forEach((el) => el.remove());

	// Remove event handlers
	const allElements = wrapper.querySelectorAll("*");
	allElements.forEach((el) => {
		Array.from(el.attributes).forEach((attr) => {
			if (attr.name.startsWith("on")) {
				el.removeAttribute(attr.name);
			}
		});
	});

	return wrapper.innerHTML;
}
```

---

## 🚦 Getting Started (Post-Refactor)

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/code-game.git

# Install dependencies
cd code-game
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Adding New Levels

1. Create JSON file in `src/data/levels/`
2. Define rules with check functions
3. Add to level loader configuration
4. Create corresponding icon in `src/assets/icons/`
5. Test thoroughly with edge cases

---

## 📚 Lesson Creation Guides

### 🔧 General Level Structure

All levels follow a standardized JSON format with the following structure:

```json
{
	"id": "category-number",
	"name": "Display Name",
	"description": "Brief description for level selection",
	"icon": "icon-file.svg",
	"difficulty": "beginner|intermediate|advanced",
	"levelNumber": 1,
	"category": "HTML|CSS|JAVASCRIPT",
	"prerequisites": ["previous-level-id"],
	"rules": [
		{
			"id": 1,
			"text": "What the user needs to do",
			"hint": "Detailed explanation with examples",
			"checkType": "contains|regex|custom",
			"checkParams": {
				/* validation parameters */
			},
			"additionalChecks": [
				/* optional extra validations */
			]
		}
	],
	"completion": {
		"unlocks": ["next-level-id"],
		"message": "Success message",
		"achievement": "achievement_key",
		"keyValue": "UNIQUE_COMPLETION_KEY"
	}
}
```

### 🌐 HTML Lesson Creation Guide

#### Step 1: Create the Level File

Create a new file in `src/data/levels/HTML/level{X}.json` where X is the next level number.

#### Step 2: HTML Level Template

```json
{
  "id": "html-X",
  "name": "HTML - Topic Name",
  "description": "Brief description of what students will learn",
  "icon": "html-icon.svg",
  "difficulty": "beginner",
  "levelNumber": X,
  "category": "HTML",
  "prerequisites": ["html-{X-1}"],
  "rules": [
    {
      "id": 1,
      "text": "Create a basic HTML structure",
      "hint": "Start with basic tags like &lt;h1&gt;, &lt;p&gt;, etc. Remember to use proper opening and closing tags!",
      "checkType": "contains",
      "checkParams": {
        "text": "<h1>"
      },
      "additionalChecks": [
        {
          "checkType": "contains",
          "checkParams": { "text": "</h1>" }
        }
      ]
    }
  ],
  "completion": {
    "unlocks": ["html-{X+1}"],
    "message": "🎉 Great! You've mastered [topic]!",
    "achievement": "html_topic_name",
    "keyValue": "HTML0X_TOPIC_NAME"
  }
}
```

#### Step 3: HTML Check Types

-   **contains**: Simple text search

    ```json
    "checkType": "contains",
    "checkParams": { "text": "<p>" }
    ```

-   **regex**: Pattern matching for complex validation

    ```json
    "checkType": "regex",
    "checkParams": {
      "pattern": "<img[^>]*src=",
      "flags": "i"
    }
    ```

-   **custom**: JavaScript function for complex logic
    ```json
    "checkType": "custom",
    "checkParams": {
      "function": "(code) => code.includes('<ul>') && code.includes('<li>')"
    }
    ```

#### Step 4: HTML Teaching Progression

1. **Level 1**: Text and paragraphs (`<p>`)
2. **Level 2**: Headings and formatting (`<h1>`, `<strong>`, `<em>`)
3. **Level 3**: Links and lists (`<a>`, `<ul>`, `<li>`)
4. **Level 4**: Images and attributes (`<img>`, `src`, `alt`)
5. **Level 5**: Forms and inputs (`<form>`, `<input>`, `<button>`)
6. **Level 6**: Tables and structure (`<table>`, `<tr>`, `<td>`)

#### Step 5: HTML Best Practices

-   Always use HTML entities in rule text (`&lt;` instead of `<`)
-   Include both opening and closing tag checks
-   Provide clear, encouraging hints with examples
-   Use progressive difficulty within each level
-   Test with common student mistakes

### 🎨 CSS Lesson Creation Guide

#### Step 1: Create the CSS Level File

Create `src/data/levels/CSS/level{X}.json`

#### Step 2: CSS Level Template

```json
{
  "id": "css-X",
  "name": "CSS - Topic Name",
  "description": "Learn about CSS [topic]",
  "icon": "css-icon.svg",
  "difficulty": "beginner",
  "levelNumber": X,
  "category": "CSS",
  "prerequisites": ["css-{X-1}"],
  "rules": [
    {
      "id": 1,
      "text": "Create HTML structure first",
      "hint": "CSS needs HTML to style! Start with: &lt;p&gt;Hello CSS!&lt;/p&gt;",
      "checkType": "contains",
      "checkParams": { "text": "<p>" }
    },
    {
      "id": 2,
      "text": "Add a &lt;style&gt; tag",
      "hint": "CSS goes inside &lt;style&gt;&lt;/style&gt; tags at the top of your HTML.",
      "checkType": "contains",
      "checkParams": { "text": "<style>" }
    },
    {
      "id": 3,
      "text": "Write CSS rule to change [property]",
      "hint": "Inside style tags, write: p { [property]: [value]; }",
      "checkType": "regex",
      "checkParams": {
        "pattern": "p\\s*{[^}]*[property]\\s*:",
        "flags": "i"
      }
    }
  ],
  "completion": {
    "unlocks": ["css-{X+1}"],
    "message": "🎉 Excellent! You've learned CSS [topic]!",
    "achievement": "css_topic_name",
    "keyValue": "CSS0X_TOPIC_NAME"
  }
}
```

#### Step 3: CSS Teaching Progression

1. **Level 1**: Colors and basic styling (`color`, `background-color`)
2. **Level 2**: Fonts and text styling (`font-family`, `font-size`, `text-align`)
3. **Level 3**: Borders and spacing (`border`, `margin`, `padding`)
4. **Level 4**: Layout and positioning (`display`, `position`, `width`, `height`)
5. **Level 5**: Flexbox basics (`display: flex`, `justify-content`, `align-items`)
6. **Level 6**: Responsive design (`@media`, `max-width`, responsive units)

#### Step 4: CSS Validation Patterns

-   **Color properties**: `"pattern": "color\\s*:\\s*(red|blue|green|#[0-9a-fA-F]{3,6})"`
-   **Size properties**: `"pattern": "font-size\\s*:\\s*\\d+(px|em|rem)"`
-   **Flexbox**: `"pattern": "display\\s*:\\s*flex"`
-   **Complex selectors**: `"pattern": "\\.class-name\\s*{[^}]*property"`

### 💻 JavaScript Lesson Creation Guide

#### Step 1: Create the JavaScript Level File

Create `src/data/levels/JAVASCRIPT/level{X}.json`

#### Step 2: JavaScript Level Template

```json
{
  "id": "js-X",
  "name": "JavaScript - Topic Name",
  "description": "Learn JavaScript [topic]",
  "icon": "js-icon.svg",
  "difficulty": "beginner",
  "levelNumber": X,
  "category": "JAVASCRIPT",
  "prerequisites": ["js-{X-1}"],
  "rules": [
    {
      "id": 1,
      "text": "Create HTML element for output",
      "hint": "JavaScript needs HTML to interact with: &lt;p id=\"output\"&gt;Text&lt;/p&gt;",
      "checkType": "regex",
      "checkParams": {
        "pattern": "<p[^>]*id=",
        "flags": "i"
      }
    },
    {
      "id": 2,
      "text": "Add &lt;script&gt; tags",
      "hint": "JavaScript goes inside &lt;script&gt;&lt;/script&gt; tags after your HTML.",
      "checkType": "contains",
      "checkParams": { "text": "<script>" }
    },
    {
      "id": 3,
      "text": "Write JavaScript to [do something]",
      "hint": "Use: let variable = \"value\"; document.getElementById(\"output\").innerHTML = variable;",
      "checkType": "contains",
      "checkParams": { "text": "let" },
      "additionalChecks": [
        {
          "checkType": "contains",
          "checkParams": { "text": "innerHTML" }
        }
      ]
    }
  ],
  "completion": {
    "unlocks": ["js-{X+1}"],
    "message": "🎉 Amazing! You've mastered JavaScript [topic]!",
    "achievement": "js_topic_name",
    "keyValue": "JS0X_TOPIC_NAME"
  }
}
```

#### Step 3: JavaScript Teaching Progression

1. **Level 1**: Variables and output (`let`, `innerHTML`, `getElementById`)
2. **Level 2**: Functions and events (`function`, `onclick`, `addEventListener`)
3. **Level 3**: Conditionals and logic (`if`, `else`, `===`, `!==`)
4. **Level 4**: Loops and arrays (`for`, `while`, `[]`, `push`, `length`)
5. **Level 5**: DOM manipulation (`createElement`, `appendChild`, `style`)
6. **Level 6**: Interactive features (forms, user input, dynamic content)

#### Step 4: JavaScript Validation Patterns

-   **Variables**: `"pattern": "(let|const|var)\\s+\\w+\\s*="`
-   **Functions**: `"pattern": "function\\s+\\w+\\s*\\("`
-   **DOM methods**: `"pattern": "document\\.(getElementById|querySelector)"`
-   **Event handlers**: `"pattern": "(onclick|addEventListener)"`

### 🔄 Adding New Levels to the System

#### Step 1: Update Level Manager

In `src/js/levelManager.js`, update the level loading logic:

```javascript
// For HTML levels (if adding level 7)
const htmlLevels = [];
for (let i = 1; i <= 7; i++) {
	// Update max number
	htmlLevels.push(`HTML/level${i}.json`);
}
```

#### Step 2: Update Prerequisites Chain

Ensure each level properly unlocks the next:

-   Level X completion should unlock Level X+1
-   Last level of HTML should unlock first CSS level
-   Last level of CSS should unlock first JavaScript level

#### Step 3: Test the New Level

1. Load the game and complete prerequisites
2. Verify level appears in selection screen
3. Test each rule validation works correctly
4. Confirm level completion unlocks next level
5. Check achievement and XP systems work

### 📝 Content Writing Guidelines

#### Rule Text Best Practices

-   **Be specific**: "Add a red color to the paragraph" vs "Style the text"
-   **Use action verbs**: "Create", "Add", "Write", "Change"
-   **Show examples**: Include code snippets in hints
-   **Progressive difficulty**: Start simple, add complexity gradually

#### Hint Writing Guidelines

-   **Include examples**: Always show the exact code format
-   **Explain concepts**: Don't just show code, explain why
-   **Use HTML entities**: `&lt;` `&gt;` for angle brackets in displayed text
-   **Encourage experimentation**: "Try changing the value to see what happens!"

#### Error Prevention

-   **Test common mistakes**: What will students likely do wrong?
-   **Validate edge cases**: Empty input, wrong syntax, typos
-   **Clear error messages**: Help students understand what's missing
-   **Multiple check types**: Use additional checks for thorough validation

### 🚀 Quick Start Checklist

To add a new lesson:

-   [ ] Create JSON file in appropriate category folder
-   [ ] Follow the template structure exactly
-   [ ] Use progressive rule difficulty (3-5 rules per level)
-   [ ] Include clear hints with examples
-   [ ] Use proper HTML entities in text
-   [ ] Test all validation checks work
-   [ ] Update level manager if needed (for new level numbers)
-   [ ] Test prerequisite chain works correctly
-   [ ] Verify level unlocks next level properly
-   [ ] Check achievement system integration

---

## 📝 Contributing Guidelines

### Code Style

-   Use ES6+ features
-   Follow Airbnb JavaScript style guide
-   Write descriptive commit messages
-   Add JSDoc comments for functions

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit PR with description

---

## 🎯 Future Vision

The Code Game aims to become a comprehensive platform for learning programming through gamification. Future expansions could include:

-   Multi-language support (Python, Java, etc.)
-   Collaborative coding challenges
-   AI-powered hint system
-   Integration with school LMS
-   Mobile app version
-   VR/AR coding experiences

The goal is to make programming education as engaging and addictive as gaming itself!
