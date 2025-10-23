import Debug from './debug.js';

export class UserManager {
	constructor() {
		Debug.logInit('UserManager');
		this.currentUser = null;
		this.completedLevels = new Set();
		this.xp = {
			html: 0,
			css: 0,
			javascript: 0
		};
		this.isAuthenticated = false;
		this.allPlayers = new Map(); // Store all players
	}

	async authenticate() {
		Debug.logGameFlow('Starting user authentication');

		return new Promise((resolve) => {
			this.showAuthModal(resolve);
		});
	}

	showAuthModal(callback) {
		// Show title and author info only during player selection
		this.showTitleAndAuthor();

		const modal = this.createPlayerSelectionModal();
		document.body.appendChild(modal);

		this.bindPlayerSelectionEvents(modal, callback);
	}

	showTitleAndAuthor() {
		// Title and author info are now part of the player selection modal
		// They will be shown when the modal is displayed
	}

	hideTitleAndAuthor() {
		// Title and author info are now part of the player selection modal
		// They will be hidden when the modal is removed
	}

	createPlayerSelectionModal() {
		const existingPlayers = this.getAllPlayers();
		const modal = document.createElement('div');
		modal.className = 'player-select-modal-overlay';
		modal.innerHTML = `
			<div class="player-select-modal">
			<h1 class="title" id="gameTitle">THE CODE GAME</h1>
				<div class="author-info" id="authorInfo">
					<p class="author">Author: <a href="https://github.com/AleksandreKhundzakishvili" target="_blank"
							rel="noopener">Aleksandre Khundzakishvili</a></p>
					<p class="version">Version: 1.1.1</p>
				</div>
				<h2>Select Your Player</h2>
				<div class="player-selection">
					<div class="new-player-section">
						<h3>Start New Game</h3>
						<div class="new-player-form">
							<div class="input-group">
								<label for="newUsernameInput">Player Name:</label>
								<input type="text" id="newUsernameInput" placeholder="Enter your name" maxlength="20">
							</div>
							<div class="new-player-buttons">
								<button id="createPlayerBtn" class="auth-btn primary">Create Player</button>
								<button id="guestBtn" class="auth-btn secondary">Play as Guest</button>
							</div>
						</div>
					</div>
					${existingPlayers.length > 0 ? `
						<div class="existing-players">
							<h3>Continue Playing</h3>
							<div class="players-list">
								${existingPlayers.map(player => `
									<div class="player-card" data-username="${player.username}">
										<div class="player-info">
											<div class="player-name">${player.username}</div>
											<div class="player-stats">
												<span>Levels: ${player.completedLevels.length}</span>
												<span>Total XP: ${player.xp.html + player.xp.css + player.xp.javascript}</span>
											</div>
											<div class="player-xp">
												<div class="xp-mini-bar">
													<span class="xp-mini-label">HTML</span>
													<div class="xp-mini-fill html" style="width: ${Math.min(100, (player.xp.html / 500) * 100)}%"></div>
													<span class="xp-mini-value">${player.xp.html}</span>
												</div>
												<div class="xp-mini-bar">
													<span class="xp-mini-label">CSS</span>
													<div class="xp-mini-fill css" style="width: ${Math.min(100, (player.xp.css / 500) * 100)}%"></div>
													<span class="xp-mini-value">${player.xp.css}</span>
												</div>
												<div class="xp-mini-bar">
													<span class="xp-mini-label">JS</span>
													<div class="xp-mini-fill js" style="width: ${Math.min(100, (player.xp.javascript / 500) * 100)}%"></div>
													<span class="xp-mini-value">${player.xp.javascript}</span>
												</div>
											</div>
										</div>
										<button class="player-select-btn">Continue</button>
										<button class="player-delete-btn" title="Delete Player">🗑️</button>
									</div>
								`).join('')}
							</div>
						</div>
					` : ''}
				</div>
				<div class="auth-error" id="authError"></div>
			</div>
		`;

		// Add styles
		const style = document.createElement('style');
		style.textContent = `
			.player-select-modal-overlay {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 10000;
				padding: 0;
				box-sizing: border-box;
			}

			.player-select-modal {
				border: none;
				padding: 40px;
				width: 100%;
				height: 100%;
				overflow-y: auto;
				box-shadow: none;
				font-family: 'Press Start 2P', monospace;
				display: flex;
				flex-direction: column;
			}

			.player-select-modal .title {
				color: #f39c12;
				text-align: center;
				margin: 0 0 20px 0;
				font-size: 32px;
				text-transform: uppercase;
				text-shadow: 2px 2px 0px #000;
				font-family: 'Press Start 2P', monospace;
			}

			.player-select-modal .author-info {
				text-align: center;
				margin-bottom: 40px;
				color: #4ecca3;
			}

			.player-select-modal .author-info p {
				margin: 5px 0;
				font-size: 10px;
				font-family: 'Press Start 2P', monospace;
			}

			.player-select-modal .author-info .version {
				color: #e94560;
			}

			.player-select-modal .author-info .author a {
				color: #4ecca3;
				text-decoration: none;
			}

			.player-select-modal .author-info .author a:hover {
				color: #f39c12;
			}

			.player-select-modal h2 {
				color: #f39c12;
				text-align: center;
				margin-bottom: 25px;
				font-size: 18px;
				text-transform: uppercase;
				text-shadow: 2px 2px 0px #000;
			}

			.player-select-modal h3 {
				color: #4ecca3;
				margin-bottom: 15px;
				font-size: 12px;
				text-transform: uppercase;
				border-bottom: 2px solid #4ecca3;
				padding-bottom: 5px;
			}

			.existing-players {
				margin-bottom: 30px;
			}

			.players-list {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
				gap: 15px;
				margin-bottom: 20px;
				max-width: 100%;
			}

			@media (min-width: 900px) {
				.players-list {
					grid-template-columns: repeat(3, 1fr);
				}
			}

			@media (min-width: 600px) and (max-width: 899px) {
				.players-list {
					grid-template-columns: repeat(2, 1fr);
				}
			}

			.player-card {
				position: relative;
				background: #0f3460;
				border: 2px solid #4ecca3;
				padding: 15px;
				cursor: pointer;
				transition: all 0.3s ease;
				display: flex;
				flex-direction: column;
				gap: 10px;
			}

			.player-card:hover {
				border-color: #f39c12;
				background: #1a1a2e;
				transform: translateY(-2px);
			}

			.player-name {
				color: #f39c12;
				font-size: 12px;
				font-weight: bold;
				margin-bottom: 5px;
			}

			.player-stats {
				color: #eee;
				font-size: 8px;
				display: flex;
				gap: 15px;
				margin-bottom: 8px;
			}

			.player-xp {
				display: flex;
				flex-direction: column;
				gap: 5px;
			}

			.xp-mini-bar {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 6px;
			}

			.xp-mini-label {
				color: #4ecca3;
				min-width: 25px;
				font-weight: bold;
			}

			.xp-mini-fill {
				height: 8px;
				flex: 1;
				background: #1a1a2e;
				border: 1px solid #4ecca3;
				position: relative;
				max-width: 100px;
			}

			.xp-mini-fill.html {
				background: linear-gradient(90deg, #e94560, #ff6b8a);
			}

			.xp-mini-fill.css {
				background: linear-gradient(90deg, #f39c12, #ffb347);
			}

			.xp-mini-fill.js {
				background: linear-gradient(90deg, #4ecca3, #7fffd4);
			}

			.xp-mini-value {
				color: #f39c12;
				min-width: 30px;
				text-align: right;
				font-weight: bold;
			}

			.player-select-btn {
				padding: 8px 16px;
				background: #4ecca3;
				border: 2px solid #4ecca3;
				color: #0f3460;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				cursor: pointer;
				text-transform: uppercase;
				font-weight: bold;
				transition: all 0.3s ease;
				margin-top: 10px;
			}

			.player-select-btn:hover {
				background: #0f3460;
				color: #4ecca3;
				transform: translateY(-2px);
			}

			.player-delete-btn {
				position: absolute;
				top: 5px;
				right: 5px;
				background: #e94560;
				border: 1px solid #e94560;
				color: white;
				width: 25px;
				height: 25px;
				font-size: 10px;
				cursor: pointer;
				transition: all 0.3s ease;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.player-delete-btn:hover {
				background: #ff4757;
				transform: scale(1.1);
			}

			.new-player-section {
				border-bottom: 2px solid #4ecca3;
				padding-bottom: 20px;
				margin-bottom: 30px;
			}

			.existing-players {
				margin-bottom: 0;
			}

			.new-player-form .input-group {
				margin-bottom: 15px;
			}

			.new-player-form label {
				display: block;
				color: #4ecca3;
				margin-bottom: 8px;
				font-weight: bold;
				text-transform: uppercase;
				font-size: 10px;
			}

			.new-player-form input {
				width: 100%;
				padding: 12px;
				background: #0f3460;
				border: 2px solid #4ecca3;
				color: #eee;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				box-sizing: border-box;
				transition: all 0.3s ease;
			}

			.new-player-form input:focus {
				outline: none;
				border-color: #f39c12;
				box-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
				background: #1a1a2e;
			}

			.new-player-buttons {
				display: flex;
				gap: 15px;
				margin-top: 15px;
			}

			.auth-btn {
				flex: 1;
				padding: 12px 20px;
				background: #0f3460;
				border: 2px solid #4ecca3;
				color: #4ecca3;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				cursor: pointer;
				text-transform: uppercase;
				font-weight: bold;
				transition: all 0.3s ease;
			}

			.auth-btn:hover {
				background: #4ecca3;
				color: #0f3460;
				transform: translateY(-2px);
			}

			.auth-btn.secondary {
				border-color: #e94560;
				color: #e94560;
			}

			.auth-btn.secondary:hover {
				background: #e94560;
				color: #16213e;
			}

			.auth-error {
				color: #e94560;
				text-align: center;
				margin-top: 15px;
				font-size: 8px;
				font-family: 'Press Start 2P', monospace;
			}

			@media (max-width: 768px) {
				.player-select-modal {
					padding: 20px;
				}

				.player-select-modal .title {
					font-size: 24px;
				}

				.player-select-modal .author-info p {
					font-size: 8px;
				}

				.players-list {
					grid-template-columns: 1fr;
				}

				.new-player-buttons {
					flex-direction: column;
				}
			}
		`;
		modal.appendChild(style);

		return modal;
	}

	bindPlayerSelectionEvents(modal, callback) {
		// Bind existing player selection
		const playerCards = modal.querySelectorAll('.player-card');
		playerCards.forEach(card => {
			const selectBtn = card.querySelector('.player-select-btn');
			const deleteBtn = card.querySelector('.player-delete-btn');
			const username = card.dataset.username;

			if (selectBtn) {
				selectBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					this.loadPlayer(username);
					document.body.removeChild(modal);
					this.hideTitleAndAuthor();
					callback();
				});
			}

			if (deleteBtn) {
				deleteBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					if (confirm(`Delete player "${username}"? This cannot be undone.`)) {
						this.deletePlayer(username);
						// Refresh modal
						document.body.removeChild(modal);
						this.showAuthModal(callback);
					}
				});
			}
		});

		// Bind new player creation
		const newUsernameInput = modal.querySelector('#newUsernameInput');
		const createPlayerBtn = modal.querySelector('#createPlayerBtn');
		const guestBtn = modal.querySelector('#guestBtn');

		if (newUsernameInput) newUsernameInput.focus();

		if (createPlayerBtn) {
			createPlayerBtn.addEventListener('click', () => {
				const username = newUsernameInput.value.trim();

				if (username) {
					if (this.allPlayers.has(username)) {
						this.showError(modal, 'Player name already exists');
						return;
					}
					this.processLogin(username);
					document.body.removeChild(modal);
					this.hideTitleAndAuthor();
					callback();
				} else {
					this.showError(modal, 'Please enter a player name');
				}
			});
		}

		if (guestBtn) {
			guestBtn.addEventListener('click', () => {
				this.processLogin('Guest');
				document.body.removeChild(modal);
				this.hideTitleAndAuthor();
				callback();
			});
		}

		// Handle Enter key
		if (newUsernameInput) {
			newUsernameInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					createPlayerBtn.click();
				}
			});
		}
	}

	loadAllPlayers() {
		try {
			const savedPlayers = localStorage.getItem('codeGameAllPlayers');
			if (savedPlayers) {
				const playersData = JSON.parse(savedPlayers);
				this.allPlayers = new Map(Object.entries(playersData));
				Debug.logGameFlow('All players loaded from localStorage', {
					playerCount: this.allPlayers.size
				});
			}
		} catch (error) {
			Debug.logError(error, 'Loading all players');
		}
	}

	saveAllPlayers() {
		try {
			const playersObj = Object.fromEntries(this.allPlayers);
			localStorage.setItem('codeGameAllPlayers', JSON.stringify(playersObj));
			Debug.logGameFlow('All players saved to localStorage');
		} catch (error) {
			Debug.logError(error, 'Saving all players');
		}
	}

	getAllPlayers() {
		return Array.from(this.allPlayers.values())
			.filter(player => player.username !== 'Guest')
			.sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
	}

	loadPlayer(username) {
		Debug.logGameFlow('Loading player', {
			username,
			allPlayersCount: this.allPlayers.size,
			hasPlayerData: this.allPlayers.has(username)
		});

		const playerData = this.allPlayers.get(username);
		if (playerData) {
			Debug.logGameFlow('Player data found', {
				username,
				playerData: {
					username: playerData.username,
					xp: { ...playerData.xp },
					completedLevelsCount: playerData.completedLevels?.length || 0,
					timestamp: playerData.timestamp
				}
			});

			this.currentUser = playerData.username;
			this.xp = playerData.xp || { html: 0, css: 0, javascript: 0 };
			this.completedLevels = new Set(playerData.completedLevels || []);
			this.isAuthenticated = true;
			this.saveUserData(); // Update current user

			Debug.logGameFlow('Player loaded successfully', {
				username,
				xp: { ...this.xp },
				completedLevelsCount: this.completedLevels.size,
				isAuthenticated: this.isAuthenticated
			});
		} else {
			Debug.logError(new Error(`Player data not found for username: ${username}`), 'Player loading failed');
		}
	}

	deletePlayer(username) {
		this.allPlayers.delete(username);
		this.saveAllPlayers();
		Debug.logGameFlow('Player deleted', { username });
	}

	processLogin(username) {
		Debug.logGameFlow('Processing user login', { username });

		this.currentUser = username;
		this.isAuthenticated = true;

		// Store user data
		this.saveUserData();

		Debug.logGameFlow('User authentication completed', {
			username: this.currentUser,
			xp: this.xp,
			completedLevels: this.completedLevels.size
		});
	}

	awardXP(subject, amount) {
		const previousTotal = this.xp[subject] || 0;
		Debug.logGameFlow('XP award attempt', {
			subject,
			amount,
			previousTotal,
			hasProperty: this.xp.hasOwnProperty(subject),
			currentXpState: { ...this.xp }
		});

		if (this.xp.hasOwnProperty(subject)) {
			this.xp[subject] += amount;
			this.saveUserData();
			Debug.logGameFlow('XP awarded successfully', {
				subject,
				amount,
				previousTotal,
				newTotal: this.xp[subject],
				allXP: { ...this.xp }
			});
		} else {
			Debug.logError(new Error(`Invalid XP subject: ${subject}`), 'XP award failed');
		}
	}

	completeLevel(levelId, levelData = null) {
		// Check if level was already completed to prevent duplicate XP
		if (this.completedLevels.has(levelId)) {
			Debug.logGameFlow('Level already completed, skipping XP award', { levelId });
			return;
		}

		const xpBeforeCompletion = { ...this.xp };
		Debug.logGameFlow('Level completion started', {
			levelId,
			xpBefore: xpBeforeCompletion,
			hasLevelData: !!levelData,
			levelDataCompletion: levelData?.completion
		});

		this.completedLevels.add(levelId);

		// Award XP based on level type
		if (levelId.startsWith('html')) {
			Debug.logGameFlow('Awarding HTML XP for level', { levelId });
			this.awardXP('html', 100);
		} else if (levelId.startsWith('css')) {
			Debug.logGameFlow('Awarding CSS XP for level', { levelId });
			this.awardXP('css', 100);
		} else if (levelId.startsWith('js')) {
			Debug.logGameFlow('Awarding JavaScript XP for level', { levelId });
			this.awardXP('javascript', 100);
		} else {
			Debug.logGameFlow('Unknown level type, no base XP awarded', { levelId });
		}

		// Award bonus XP if this is the last level in a category
		if (levelData && levelData.completion && levelData.completion.bonusXP && levelData.completion.isLastInCategory) {
			const subject = levelData.completion.subject || 'html';
			Debug.logGameFlow('Bonus XP criteria met', {
				levelId,
				subject,
				bonusXP: levelData.completion.bonusXP,
				isLastInCategory: levelData.completion.isLastInCategory
			});
			this.awardXP(subject, levelData.completion.bonusXP);
			Debug.logGameFlow('Bonus XP awarded for completing category', {
				subject,
				bonusXP: levelData.completion.bonusXP
			});
		} else {
			Debug.logGameFlow('No bonus XP awarded', {
				hasLevelData: !!levelData,
				hasCompletion: !!(levelData?.completion),
				hasBonusXP: !!(levelData?.completion?.bonusXP),
				isLastInCategory: !!(levelData?.completion?.isLastInCategory)
			});
		}

		this.saveUserData();
		const xpAfterCompletion = { ...this.xp };
		Debug.logGameFlow('Level completion finished', {
			levelId,
			xpBefore: xpBeforeCompletion,
			xpAfter: xpAfterCompletion,
			totalXpChange: {
				html: xpAfterCompletion.html - xpBeforeCompletion.html,
				css: xpAfterCompletion.css - xpBeforeCompletion.css,
				javascript: xpAfterCompletion.javascript - xpBeforeCompletion.javascript
			}
		});
	}

	showLevelCompleteModal(levelName, xpAwarded) {
		const modal = this.createLevelCompleteModal(levelName, xpAwarded);
		document.body.appendChild(modal);

		const closeBtn = modal.querySelector('#closeLevelBtn');

		closeBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
		});
	}

	createLevelCompleteModal(levelName, xpAwarded) {
		const modal = document.createElement('div');
		modal.className = 'level-complete-modal-overlay';
		modal.innerHTML = `
			<div class="level-complete-modal">
				<h2>🎉 Level Complete! 🎉</h2>
				<p>Congratulations on completing <strong>${levelName}</strong>!</p>
				<div class="xp-display">
					<label>XP Earned:</label>
					<div class="xp-value">+${xpAwarded} XP</div>
				</div>
				<div class="current-xp">
					<p><strong>Your XP:</strong></p>
					<p>HTML: ${this.xp.html} | CSS: ${this.xp.css} | JavaScript: ${this.xp.javascript}</p>
				</div>
				<button id="closeLevelBtn" class="level-btn primary">Continue</button>
			</div>
		`;

		// Add styles
		const style = document.createElement('style');
		style.textContent = `
			.level-complete-modal-overlay {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(26, 26, 46, 0.95);
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 10000;
			}

			.level-complete-modal {
				background: #16213e;
				border: 4px solid #0f3460;
				padding: 30px;
				min-width: 500px;
				max-width: 650px;
				box-shadow: 0 0 30px rgba(15, 52, 96, 0.8);
				text-align: center;
				font-family: 'Press Start 2P', monospace;
			}

			.level-complete-modal h2 {
				color: #f39c12;
				margin-bottom: 15px;
				font-size: 18px;
				text-transform: uppercase;
				text-shadow: 2px 2px 0px #000;
			}

			.level-complete-modal p {
				color: #eee;
				margin-bottom: 15px;
				font-size: 10px;
				line-height: 1.6;
			}

			.xp-display {
				background: #0f3460;
				border: 4px solid #4ecca3;
				padding: 20px;
				margin: 20px 0;
			}

			.xp-display label {
				display: block;
				color: #4ecca3;
				font-weight: bold;
				margin-bottom: 10px;
				text-transform: uppercase;
				font-size: 10px;
			}

			.xp-value {
				background: #1a1a2e;
				border: 2px solid #f39c12;
				padding: 15px;
				color: #f39c12;
				font-size: 16px;
				font-weight: bold;
				letter-spacing: 1px;
				font-family: 'Press Start 2P', monospace;
			}

			.current-xp {
				background: #0f3460;
				border-left: 4px solid #4ecca3;
				padding: 15px;
				margin: 20px 0;
				text-align: left;
			}

			.current-xp p {
				margin: 8px 0;
				color: #eee;
				font-size: 8px;
				line-height: 1.6;
			}

			.current-xp strong {
				color: #4ecca3;
			}

			.level-btn {
				padding: 12px 24px;
				background: #0f3460;
				border: 2px solid #4ecca3;
				color: #4ecca3;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				cursor: pointer;
				text-transform: uppercase;
				font-weight: bold;
				margin: 0 10px;
				transition: all 0.3s ease;
			}

			.level-btn:hover {
				background: #4ecca3;
				color: #0f3460;
				transform: translateY(-2px);
			}

			.level-btn.primary {
				border-color: #f39c12;
				color: #f39c12;
			}

			.level-btn.primary:hover {
				background: #f39c12;
				color: #16213e;
			}
		`;
		modal.appendChild(style);

		return modal;
	}

	showError(modal, message) {
		const errorDiv = modal.querySelector('#authError');
		errorDiv.textContent = message;
		setTimeout(() => {
			errorDiv.textContent = '';
		}, 3000);
	}

	saveUserData() {
		try {
			const userData = {
				username: this.currentUser,
				xp: this.xp,
				completedLevels: Array.from(this.completedLevels),
				timestamp: Date.now()
			};

			Debug.logGameFlow('Saving user data to localStorage', {
				username: this.currentUser,
				xp: { ...this.xp },
				completedLevelsCount: this.completedLevels.size,
				completedLevels: Array.from(this.completedLevels)
			});

			// Save current user
			localStorage.setItem('codeGameCurrentUser', JSON.stringify(userData));

			// Save to all players list
			this.allPlayers.set(this.currentUser, userData);
			this.saveAllPlayers();

			Debug.logGameFlow('User data saved to localStorage successfully');
		} catch (error) {
			Debug.logError(error, 'Saving user data');
		}
	}

	loadUserData() {
		try {
			Debug.logGameFlow('Starting to load user data from localStorage');

			// Load all players first
			this.loadAllPlayers();

			// Try to load current user
			const savedData = localStorage.getItem('codeGameCurrentUser');
			Debug.logGameFlow('Retrieved saved data from localStorage', {
				hasSavedData: !!savedData,
				dataLength: savedData?.length || 0
			});

			if (savedData) {
				const userData = JSON.parse(savedData);
				this.currentUser = userData.username;
				this.xp = userData.xp || { html: 0, css: 0, javascript: 0 };
				this.completedLevels = new Set(userData.completedLevels || []);
				this.isAuthenticated = true;

				Debug.logGameFlow('User data loaded from localStorage successfully', {
					username: this.currentUser,
					xp: { ...this.xp },
					completedLevelsCount: this.completedLevels.size,
					completedLevels: Array.from(this.completedLevels),
					timestamp: userData.timestamp
				});
				return true;
			} else {
				Debug.logGameFlow('No saved user data found in localStorage');
			}
		} catch (error) {
			Debug.logError(error, 'Loading user data');
		}
		return false;
	}

	isLevelCompleted(levelId) {
		return this.completedLevels.has(levelId);
	}

	getCompletedLevels() {
		return Array.from(this.completedLevels);
	}

	getCurrentUser() {
		return this.currentUser;
	}

	getXP() {
		Debug.logGameFlow('XP requested', {
			currentXP: { ...this.xp },
			username: this.currentUser,
			isAuthenticated: this.isAuthenticated
		});
		return this.xp;
	}

	logout() {
		const previousXP = { ...this.xp };
		Debug.logGameFlow('User logout started', {
			username: this.currentUser,
			xpBeforeLogout: previousXP,
			completedLevelsCount: this.completedLevels.size
		});

		this.currentUser = null;
		this.xp = { html: 0, css: 0, javascript: 0 };
		this.completedLevels.clear();
		this.isAuthenticated = false;
		localStorage.removeItem('codeGameCurrentUser');

		Debug.logGameFlow('User logged out successfully', {
			xpAfterLogout: { ...this.xp },
			isAuthenticated: this.isAuthenticated
		});
	}
}