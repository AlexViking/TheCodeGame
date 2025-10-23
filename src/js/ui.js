import Debug from './debug.js';

export class UI {
	constructor() {
		this.eventListeners = {};
	}

	// Event system
	on(event, callback) {
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}
		this.eventListeners[event].push(callback);
	}

	emit(event, data) {
		if (this.eventListeners[event]) {
			this.eventListeners[event].forEach(callback => callback(data));
		}
	}

	// UI Methods
	showLevelSelect(levelsByCategory, userManager = null) {
		const levelSelect = document.getElementById('levelSelect');
		const gameContainer = document.getElementById('gameContainer');

		if (levelSelect) levelSelect.style.display = 'flex';
		if (gameContainer) gameContainer.style.display = 'none';

		// Clear existing content and rebuild level selection
		const container = levelSelect.querySelector('.level-cards-container');
		if (container) {
			container.innerHTML = '';

			// Add user info section at the top of the page (outside level-cards-container)
			this.renderUserInfoSection(levelSelect, userManager);

			// Render level categories in the container
			this.renderCategorizedLevels(levelsByCategory, container, userManager);
		}
	}

	renderUserInfoSection(levelSelect, userManager) {
		// Remove any existing user info section
		const existingUserInfo = levelSelect.querySelector('.user-info-section');
		if (existingUserInfo) {
			existingUserInfo.remove();
		}

		// Add user info section at the top of the page
		if (userManager) {
			const userInfo = document.createElement('div');
			userInfo.className = 'user-info-section';

			if (userManager.isAuthenticated) {
				const xp = userManager.getXP();
				// Show logged-in user interface
				userInfo.innerHTML = `
					<div class="user-welcome">
						<h2>Welcome back, ${userManager.getCurrentUser()}!</h2>
						<p>Progress: ${userManager.getCompletedLevels().length} levels completed</p>
					</div>
					<div class="xp-section">
						<div class="xp-bar-container">
							<div class="xp-bar">
								<span class="xp-label">HTML</span>
								<div class="xp-progress">
									<div class="xp-fill html-xp" style="width: ${Math.min(100, (xp.html / 1000) * 100)}%"></div>
								</div>
								<span class="xp-value">${xp.html} XP</span>
							</div>
							<div class="xp-bar">
								<span class="xp-label">CSS</span>
								<div class="xp-progress">
									<div class="xp-fill css-xp" style="width: ${Math.min(100, (xp.css / 1000) * 100)}%"></div>
								</div>
								<span class="xp-value">${xp.css} XP</span>
							</div>
							<div class="xp-bar">
								<span class="xp-label">JavaScript</span>
								<div class="xp-progress">
									<div class="xp-fill js-xp" style="width: ${Math.min(100, (xp.javascript / 1000) * 100)}%"></div>
								</div>
								<span class="xp-value">${xp.javascript} XP</span>
							</div>
						</div>
					</div>
					<div class="user-actions">
						<button class="user-btn logout" id="logoutBtn">Logout</button>
					</div>
				`;
			} else {
				// Show login interface
				userInfo.innerHTML = `
					<div class="user-login-form">
						<div class="login-inputs">
							<div class="input-group">
								<label for="inlineUsernameInput">USERNAME:</label>
								<input type="text" id="inlineUsernameInput" placeholder="Enter your username" maxlength="20">
								<small>Your progress will be saved automatically!</small>
							</div>
						</div>
						<div class="login-actions">
							<button class="user-btn primary" id="inlineLoginBtn">START PLAYING</button>
							<button class="user-btn secondary" id="inlineGuestBtn">PLAY AS GUEST</button>
						</div>
					</div>
				`;
			}

			// Insert at the top of levelSelect (before level-cards-container)
			const levelCardsContainer = levelSelect.querySelector('.level-cards-container');
			levelSelect.insertBefore(userInfo, levelCardsContainer);
			this.bindUserSectionEvents(userInfo, userManager);
		}
	}

	renderCategorizedLevels(levelsByCategory, container, userManager) {

		// Render each category only if user is authenticated
		if (userManager && userManager.isAuthenticated) {
			// Create three-column layout
			container.innerHTML = `
				<div class="three-column-layout">
					<div class="column html-column">
						<h2 class="column-title">HTML</h2>
						<div class="column-levels" id="html-levels"></div>
					</div>
					<div class="column css-column">
						<h2 class="column-title">CSS</h2>
						<div class="column-levels" id="css-levels"></div>
					</div>
					<div class="column js-column">
						<h2 class="column-title">JAVASCRIPT</h2>
						<div class="column-levels" id="js-levels"></div>
					</div>
				</div>
			`;

			// Populate each column with its respective levels
			Object.entries(levelsByCategory).forEach(([category, levels]) => {
				let targetContainer;
				switch(category.toUpperCase()) {
					case 'HTML':
						targetContainer = container.querySelector('#html-levels');
						break;
					case 'CSS':
						targetContainer = container.querySelector('#css-levels');
						break;
					case 'JAVASCRIPT':
						targetContainer = container.querySelector('#js-levels');
						break;
					default:
						// For any other categories, add to the first column
						targetContainer = container.querySelector('#html-levels');
				}

				if (targetContainer) {
					this.renderLevelCards(levels, targetContainer);
				}
			});
		}

		// Add styles for new UI elements
		this.addCategorizedLevelStyles();
	}

	bindUserSectionEvents(userInfo, userManager) {
		if (userManager.isAuthenticated) {
			// Bind authenticated user events
			const logoutBtn = userInfo.querySelector('#logoutBtn');

			if (logoutBtn) {
				logoutBtn.addEventListener('click', () => {
					userManager.logout();
					location.reload();
				});
			}
		} else {
			// Bind login events
			const usernameInput = userInfo.querySelector('#inlineUsernameInput');
			const loginBtn = userInfo.querySelector('#inlineLoginBtn');
			const guestBtn = userInfo.querySelector('#inlineGuestBtn');

			if (usernameInput) usernameInput.focus();

			if (loginBtn) {
				loginBtn.addEventListener('click', () => {
					const username = usernameInput.value.trim();

					if (username) {
						userManager.processLogin(username);
						this.emit('userAuthenticated');
					} else {
						this.showInlineError(userInfo, 'Please enter a username');
					}
				});
			}

			if (guestBtn) {
				guestBtn.addEventListener('click', () => {
					userManager.processLogin('Guest');
					this.emit('userAuthenticated');
				});
			}

			// Handle Enter key
			usernameInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					loginBtn.click();
				}
			});
		}
	}


	showInlineError(container, message) {
		let errorDiv = container.querySelector('.inline-error');
		if (!errorDiv) {
			errorDiv = document.createElement('div');
			errorDiv.className = 'inline-error';
			container.appendChild(errorDiv);
		}
		errorDiv.textContent = message;
		setTimeout(() => {
			if (errorDiv.parentNode) {
				errorDiv.parentNode.removeChild(errorDiv);
			}
		}, 3000);
	}

	renderLevelCards(levels, container) {
		levels.forEach(level => {
			const levelCard = document.createElement('div');
			const lockClass = level.unlocked ? '' : 'locked';
			const completedClass = level.completed ? 'completed' : '';

			levelCard.className = `level-card-simple ${lockClass} ${completedClass}`;
			levelCard.innerHTML = `
				<div class="level-number">${level.levelNumber || '?'}</div>
				<h3>${level.name}</h3>
				<p>${level.description}</p>
				${!level.unlocked ? '<div class="lock-icon">🔒</div>' : ''}
				${level.completed ? '<div class="complete-icon">✅</div>' : ''}
			`;

			if (level.unlocked) {
				levelCard.addEventListener('click', () => {
					this.emit('levelSelected', level.id);
				});
			}

			container.appendChild(levelCard);
		});
	}

	addCategorizedLevelStyles() {
		// Check if styles already added
		if (document.querySelector('#categorized-level-styles')) return;

		const style = document.createElement('style');
		style.id = 'categorized-level-styles';
		style.textContent = `
			.level-select {
				background-color: #1a1a2e;
				color: #eee;
				height: 100vh;
				overflow: hidden;
				position: relative;
				display: flex;
				flex-direction: column;
			}

			.level-cards-container {
				padding: 20px;
				flex: 1;
				overflow: hidden;
			}

			/* Pixel-style scrollbar for level-cards-container */
			.level-cards-container::-webkit-scrollbar {
				width: 16px;
				background: #0f3460;
				border: 2px solid #4ecca3;
			}

			.level-cards-container::-webkit-scrollbar-track {
				background: #0f3460;
				border: 1px solid #4ecca3;
				margin: 2px;
			}

			.level-cards-container::-webkit-scrollbar-thumb {
				background: #4ecca3;
				border: 2px solid #0f3460;
				min-height: 20px;
			}

			.level-cards-container::-webkit-scrollbar-thumb:hover {
				background: #f39c12;
			}

			.level-cards-container::-webkit-scrollbar-corner {
				background: #0f3460;
			}

			/* Firefox scrollbar styling */
			.level-cards-container {
				scrollbar-width: auto;
				scrollbar-color: #4ecca3 #0f3460;
			}

			.user-info-section {
				background: #16213e;
				border: 4px solid #0f3460;
				padding: 20px;
				margin-bottom: 30px;
				min-height: 120px;
				position: sticky;
				top: 0;
				z-index: 100;
				width: 100%;
				box-sizing: border-box;
			}

			.user-info-section:has(.user-welcome) {
				display: grid;
				grid-template-columns: 1fr 2fr 1fr;
				gap: 20px;
				align-items: center;
			}

			.user-login-form, .user-edit-form {
				text-align: center;
			}

			.user-login-form h2, .user-edit-form h2 {
				color: #f39c12;
				font-size: 20px;
				margin-bottom: 20px;
				text-shadow: 2px 2px 0px #000;
			}

			.login-inputs, .edit-inputs {
				display: grid;
				grid-template-columns: 1fr;
				gap: 20px;
				margin-bottom: 20px;
				text-align: left;
				max-width: 400px;
				margin: 0 auto 20px auto;
			}

			.input-group {
				display: flex;
				flex-direction: column;
			}

			.input-group label {
				color: #4ecca3;
				font-size: 8px;
				margin-bottom: 8px;
				text-transform: uppercase;
			}

			.input-group input, .input-group textarea {
				background: #0f3460;
				border: 2px solid #4ecca3;
				color: #eee;
				padding: 10px;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				transition: all 0.3s ease;
			}

			.input-group input:focus, .input-group textarea:focus {
				outline: none;
				border-color: #f39c12;
				background: #1a1a2e;
				box-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
			}

			.input-group textarea {
				resize: vertical;
				line-height: 1.4;
			}

			.input-group small {
				color: #888;
				font-size: 6px;
				margin-top: 5px;
				line-height: 1.4;
			}

			.login-actions, .edit-actions {
				display: flex;
				gap: 15px;
				justify-content: center;
			}

			.user-btn.primary {
				border-color: #4ecca3;
				color: #4ecca3;
			}

			.user-btn.primary:hover {
				background: #4ecca3;
				color: #0f3460;
			}

			.user-btn.secondary {
				border-color: #e94560;
				color: #e94560;
			}

			.user-btn.secondary:hover {
				background: #e94560;
				color: #16213e;
			}

			.inline-error {
				color: #e94560;
				font-size: 8px;
				text-align: center;
				margin-top: 10px;
				padding: 8px;
				background: rgba(233, 69, 96, 0.1);
				border: 1px solid #e94560;
			}

			.user-welcome h2 {
				color: #f39c12;
				margin: 0 0 5px 0;
				font-size: 20px;
				font-family: 'Press Start 2P', monospace;
			}

			.user-welcome p {
				color: #4ecca3;
				margin: 0;
				font-size: 10px;
				font-family: 'Press Start 2P', monospace;
			}

			.user-actions {
				display: flex;
				gap: 10px;
			}

			.user-btn {
				padding: 8px 16px;
				background: #0f3460;
				border: 2px solid #4ecca3;
				color: #4ecca3;
				font-family: 'Press Start 2P', monospace;
				cursor: pointer;
				font-size: 8px;
				text-transform: uppercase;
				transition: all 0.3s ease;
			}

			.user-btn:hover {
				background: #4ecca3;
				color: #0f3460;
				transform: translateY(-2px);
			}

			.user-btn.logout {
				border-color: #e94560;
				color: #e94560;
			}

			.user-btn.logout:hover {
				background: #e94560;
				color: #16213e;
			}

			/* Three Column Layout */
			.three-column-layout {
				display: flex;
				height: 100%;
				gap: 20px;
			}

			.column {
				flex: 1;
				display: flex;
				flex-direction: column;
				background: #0f1e3d;
				border: 2px solid #0f3460;
				border-radius: 8px;
				overflow: hidden;
			}

			.html-column {
				border-color: #e94560;
			}

			.css-column {
				border-color: #f39c12;
			}

			.js-column {
				border-color: #4ecca3;
			}

			.column-title {
				color: #fff;
				font-size: 16px;
				padding: 15px;
				text-align: center;
				text-transform: uppercase;
				font-family: 'Press Start 2P', monospace;
				text-shadow: 2px 2px 0px #000;
				border-bottom: 2px solid;
				margin: 0;
				background: rgba(0, 0, 0, 0.3);
				flex-shrink: 0;
			}

			.html-column .column-title {
				background: linear-gradient(135deg, #e94560, #c73650);
				border-bottom-color: #e94560;
			}

			.css-column .column-title {
				background: linear-gradient(135deg, #f39c12, #e67e22);
				border-bottom-color: #f39c12;
			}

			.js-column .column-title {
				background: linear-gradient(135deg, #4ecca3, #45b7aa);
				border-bottom-color: #4ecca3;
			}

			.column-levels {
				flex: 1;
				padding: 20px;
				overflow-y: auto;
				display: flex;
				flex-direction: column;
				gap: 15px;
			}

			/* Custom scrollbar for each column */
			.column-levels::-webkit-scrollbar {
				width: 12px;
			}

			.column-levels::-webkit-scrollbar-track {
				background: #0f3460;
				border-radius: 6px;
			}

			.column-levels::-webkit-scrollbar-thumb {
				background: #4ecca3;
				border-radius: 6px;
			}

			.html-column .column-levels::-webkit-scrollbar-thumb {
				background: #e94560;
			}

			.css-column .column-levels::-webkit-scrollbar-thumb {
				background: #f39c12;
			}

			.js-column .column-levels::-webkit-scrollbar-thumb {
				background: #4ecca3;
			}

			.column-levels::-webkit-scrollbar-thumb:hover {
				opacity: 0.8;
			}



			.level-card-simple {
				position: relative;
				background: #16213e;
				border: 2px solid #0f3460;
				padding: 15px;
				cursor: pointer;
				transition: all 0.3s ease;
				min-height: 120px;
				font-family: 'Press Start 2P', monospace;
				border-radius: 6px;
				flex-shrink: 0;
			}

			.level-card-simple:hover:not(.locked) {
				border-color: #f39c12;
				transform: translateY(-5px);
				box-shadow: 0 5px 20px rgba(243, 156, 18, 0.3);
			}

			.level-card-simple.locked {
				border-color: #666;
				opacity: 0.5;
				cursor: not-allowed;
			}

			.level-card-simple.completed {
				border-color: #4ecca3;
				background: rgba(78, 204, 163, 0.1);
				box-shadow: 0 0 10px rgba(78, 204, 163, 0.2);
			}

			.level-number {
				position: absolute;
				top: -4px;
				right: -4px;
				width: 30px;
				height: 30px;
				background: #e94560;
				color: white;
				border-radius: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
				font-size: 12px;
				font-family: 'Press Start 2P', monospace;
			}

			.level-card-simple.completed .level-number {
				background: #4ecca3;
				color: #16213e;
			}

			.level-card-simple.locked .level-number {
				background: #666;
				color: #333;
			}

			.level-card-simple h3 {
				color: #f39c12;
				margin: 0 0 15px 0;
				font-size: 12px;
				padding-right: 40px;
				font-family: 'Press Start 2P', monospace;
				line-height: 1.4;
			}

			.level-card-simple.locked h3 {
				color: #666;
			}

			.level-card-simple.completed h3 {
				color: #4ecca3;
			}

			.level-card-simple p {
				color: #eee;
				margin: 0;
				font-size: 8px;
				line-height: 1.6;
				font-family: 'Press Start 2P', monospace;
			}

			.level-card-simple.locked p {
				color: #666;
			}

			.lock-icon, .complete-icon {
				position: absolute;
				bottom: 10px;
				right: 10px;
				font-size: 16px;
			}

			.xp-section {
				text-align: center;
			}

			.xp-bar-container {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			.xp-bar {
				display: flex;
				align-items: center;
				gap: 10px;
				font-size: 8px;
				font-family: 'Press Start 2P', monospace;
			}

			.xp-label {
				color: #4ecca3;
				min-width: 100px;
				text-align: left;
				text-transform: uppercase;
				font-weight: bold;
			}

			.xp-progress {
				flex: 1;
				height: 16px;
				background: #0f3460;
				border: 2px solid #4ecca3;
				position: relative;
				overflow: hidden;
			}

			.xp-fill {
				height: 100%;
				transition: width 0.5s ease;
				position: relative;
			}

			.xp-fill.html-xp {
				background: linear-gradient(90deg, #e94560, #ff6b8a);
			}

			.xp-fill.css-xp {
				background: linear-gradient(90deg, #f39c12, #ffb347);
			}

			.xp-fill.js-xp {
				background: linear-gradient(90deg, #4ecca3, #7fffd4);
			}

			.xp-value {
				color: #f39c12;
				min-width: 60px;
				text-align: right;
				font-weight: bold;
			}

			@media (max-width: 768px) {
				.user-info-section {
					grid-template-columns: 1fr;
					text-align: center;
					gap: 15px;
				}

				.xp-bar {
					flex-direction: column;
					gap: 5px;
				}

				.xp-label {
					min-width: auto;
					text-align: center;
				}

				.xp-value {
					min-width: auto;
					text-align: center;
				}

				.three-column-layout {
					flex-direction: column;
					gap: 15px;
				}

				.column {
					min-height: 300px;
				}

				.column-title {
					font-size: 12px;
					padding: 10px;
				}

				.level-card-simple h3 {
					font-size: 10px;
				}

				.level-card-simple p {
					font-size: 7px;
				}
			}


		`;
		document.head.appendChild(style);
	}

	showGameScreen(level) {
		const levelSelect = document.getElementById('levelSelect');
		const gameContainer = document.getElementById('gameContainer');

		if (levelSelect) levelSelect.style.display = 'none';
		if (gameContainer) gameContainer.style.display = 'flex';

		// Update level info in header
		const levelInfo = document.querySelector('.level-info');
		if (levelInfo) {
			levelInfo.textContent = `LEVEL: ${level.name}`;
		}

		// Clear code input
		const codeInput = document.getElementById('codeInput');
		if (codeInput) {
			codeInput.value = '';
		}

		// Set up back button
		const backButton = document.querySelector('.back-button');
		if (backButton) {
			backButton.addEventListener('click', () => {
				this.emit('backToMenu');
			});
		}
	}

	showSuccess(level, levelManager) {
		const modalOverlay = document.getElementById('modalOverlay');
		const successModal = document.getElementById('successModal');

		if (modalOverlay) modalOverlay.style.display = 'block';
		if (successModal) {
			successModal.style.display = 'block';

			// Update success message if level has custom completion message
			if (level.completion && level.completion.message) {
				const message = successModal.querySelector('p');
				if (message) {
					message.textContent = level.completion.message;
				}
			}
		}

		// Check if there's a next level
		const nextLevel = this.getNextLevel(level, levelManager);
		const nextLevelBtn = successModal?.querySelector('#nextLevelBtn');
		const backMenuBtn = successModal?.querySelector('#backMenuBtn');

		// Show/hide next level button based on availability
		if (nextLevelBtn) {
			if (nextLevel) {
				nextLevelBtn.style.display = 'block';
				nextLevelBtn.onclick = () => {
					this.hideSuccess();
					this.emit('levelSelected', nextLevel.id);
				};
			} else {
				nextLevelBtn.style.display = 'none';
			}
		}

		// Set up back to menu button
		if (backMenuBtn) {
			backMenuBtn.onclick = () => {
				this.hideSuccess();
				this.emit('backToMenu');
			};
		}
	}

	getNextLevel(currentLevel, levelManager) {
		if (!levelManager) return null;

		// Get all levels in the same category
		const levels = levelManager.getLevelsList();
		const currentIndex = levels.findIndex(l => l.id === currentLevel.id);

		Debug.logGameFlow('Getting next level', {
			currentLevelId: currentLevel.id,
			currentIndex,
			totalLevels: levels.length,
			levelsIds: levels.map(l => l.id)
		});

		if (currentIndex >= 0 && currentIndex < levels.length - 1) {
			const nextLevel = levels[currentIndex + 1];
			Debug.logGameFlow('Found potential next level', {
				nextLevelId: nextLevel.id,
				isUnlocked: nextLevel.unlocked
			});
			// Only return if the next level is unlocked
			return nextLevel.unlocked ? nextLevel : null;
		}

		Debug.logGameFlow('No next level found', { currentIndex, totalLevels: levels.length });
		return null;
	}

	hideSuccess() {
		const modalOverlay = document.getElementById('modalOverlay');
		const successModal = document.getElementById('successModal');

		if (modalOverlay) modalOverlay.style.display = 'none';
		if (successModal) successModal.style.display = 'none';
	}

	showMenu() {
		this.hideSuccess();
		this.emit('backToMenu');
	}

}