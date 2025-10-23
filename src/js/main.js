import { Game } from "./game.js";
import { LevelManager } from "./levelManager.js";
import { UserManager } from "./userManager.js";
import { UI } from "./ui.js";
import Debug from "./debug.js";

class CodeGame {
	constructor() {
		Debug.logInit('CodeGame', { timestamp: new Date().toISOString() });
		this.userManager = new UserManager();
		this.levelManager = new LevelManager(this.userManager);
		this.ui = new UI();
		this.game = null;
	}

	async init() {
		Debug.logGameFlow('Application initialization started');

		try {
			// Try to load existing user data
			const hasExistingUser = this.userManager.loadUserData();

			await this.levelManager.loadLevels();
			Debug.logGameFlow('Levels loaded successfully', {
				levelCount: this.levelManager.levels.length
			});

			this.bindEvents();
			Debug.logGameFlow('Event bindings established');

			// Show authentication if no existing user, otherwise show level select
			if (!hasExistingUser || !this.userManager.isAuthenticated) {
				await this.userManager.authenticate();
			}

			this.showLevelSelect();
			Debug.logGameFlow('Application initialization completed');
		} catch (error) {
			Debug.logError(error, 'Application initialization');
			throw error;
		}
	}

	bindEvents() {
		Debug.logGameFlow('Binding application events');
		this.ui.on("levelSelected", (levelId) => {
			Debug.logGameFlow('Level selection event triggered', { levelId });
			this.startLevel(levelId);
		});

		this.ui.on("backToMenu", () => {
			Debug.logGameFlow('Back to menu event triggered');
			this.showLevelSelect();
		});

		this.ui.on("levelCompleted", (levelId) => {
			Debug.logGameFlow('Level completion event triggered', { levelId });
			this.completeLevel(levelId);
		});

		this.ui.on("userAuthenticated", () => {
			Debug.logGameFlow('User authentication completed');
			this.showLevelSelect();
		});

		this.ui.on("userUpdated", () => {
			Debug.logGameFlow('User data updated');
			this.showLevelSelect();
		});

		this.ui.on("userEditCancelled", () => {
			Debug.logGameFlow('User edit cancelled');
			this.showLevelSelect();
		});
	}

	startLevel(levelId) {
		Debug.logLevelEvent('Starting level', levelId);

		const levelData = this.levelManager.getLevel(levelId);
		if (!levelData) {
			const error = `Level not found: ${levelId}`;
			Debug.logError(new Error(error), 'Level loading');
			console.error(error);
			return;
		}

		Debug.logLevelEvent('Level data loaded', levelId, {
			name: levelData.name,
			rulesCount: levelData.rules.length,
			difficulty: levelData.difficulty
		});

		// Clean up previous game instance
		if (this.game) {
			Debug.logGameFlow('Cleaning up previous game instance');
		}

		this.game = new Game(levelData, this.ui, this.levelManager);

		// Make game instance globally available for HTML onclick handlers
		window.game = this.game;

		this.game.start();
		Debug.logLevelEvent('Level started', levelId);
	}

	showLevelSelect() {
		Debug.logUIEvent('Showing level selection screen');

		const levelsByCategory = this.levelManager.getLevelsByCategory();
		Debug.logUIEvent('Level list prepared', {
			categories: Object.keys(levelsByCategory),
			totalLevels: Object.values(levelsByCategory).flat().length
		});

		this.ui.showLevelSelect(levelsByCategory, this.userManager);

		// Clean up global game reference
		if (window.game) {
			Debug.logGameFlow('Cleaning up global game reference');
			window.game = null;
		}
	}

	completeLevel(levelId) {
		Debug.logLevelEvent('Level completed', levelId);

		// Get level data for bonus XP calculation
		const levelData = this.levelManager.getLevel(levelId);

		// Award XP through user manager
		this.userManager.completeLevel(levelId, levelData);

		// Update level manager
		this.levelManager.completeLevel(levelId);

		const newlyUnlocked = this.levelManager.getLevelsList()
			.filter(l => l.unlocked)
			.map(l => l.id);

		Debug.logLevelEvent('Level completion processed', levelId, {
			newlyUnlockedLevels: newlyUnlocked,
			xp: this.userManager.getXP()
		});

		this.showLevelSelect();
	}
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
	Debug.logInit('DOM', { state: 'loaded' });

	try {
		const app = new CodeGame();
		await app.init();
	} catch (error) {
		Debug.logError(error, 'Application startup');
		console.error('Failed to start application:', error);
	}
});