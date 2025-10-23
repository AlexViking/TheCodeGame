import { RuleEngine } from './ruleEngine.js';
import Debug from './debug.js';

export class LevelManager {
	constructor(userManager = null) {
		Debug.logInit('LevelManager');
		this.levels = [];
		this.unlockedLevels = new Set(["html-1"]); // Start with first HTML level unlocked
		this.ruleEngine = new RuleEngine();
		this.userManager = userManager;

		Debug.logLevelEvent('LevelManager initialized', null, {
			initialUnlockedLevels: Array.from(this.unlockedLevels)
		});
	}

	async loadLevels() {
		Debug.logLevelEvent('Starting level loading process');

		// Load HTML levels
		const htmlLevels = [];
		for (let i = 1; i <= 6; i++) {
			htmlLevels.push(`HTML/level${i}.json`);
		}

		// Load CSS levels
		const cssLevels = [];
		for (let i = 1; i <= 6; i++) {
			cssLevels.push(`CSS/level${i}.json`);
		}

		// Load JavaScript levels
		const jsLevels = [];
		for (let i = 1; i <= 6; i++) {
			jsLevels.push(`JAVASCRIPT/level${i}.json`);
		}

		const levelFiles = [
			...htmlLevels,
			...cssLevels,
			...jsLevels
		];

		Debug.logLevelEvent('Level files to load', null, { files: levelFiles });

		for (const file of levelFiles) {
			try {
				Debug.logLevelEvent('Loading level file', file);

				const response = await fetch(`src/data/levels/${file}`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const levelData = await response.json();
				Debug.logLevelEvent('Level data fetched', file, {
					levelId: levelData.id,
					rulesCount: levelData.rules?.length || 0
				});

				const processedLevel = this.processLevel(levelData);
				this.levels.push(processedLevel);

				Debug.logLevelEvent('Level processed and added', levelData.id, {
					totalLevelsLoaded: this.levels.length
				});

			} catch (error) {
				Debug.logError(error, `Loading level file: ${file}`);
				console.error(`Failed to load level file: ${file}`, error);
			}
		}

		// Sort levels by category and level number
		this.levels.sort((a, b) => {
			const aCat = a.category || 'HTML';
			const bCat = b.category || 'HTML';
			if (aCat !== bCat) {
				const order = { 'HTML': 0, 'CSS': 1, 'JAVASCRIPT': 2 };
				return order[aCat] - order[bCat];
			}
			return (a.levelNumber || 0) - (b.levelNumber || 0);
		});

		// Update unlocked levels based on user progress
		if (this.userManager) {
			this.updateUnlockedLevels();
		}

		Debug.logLevelEvent('Level loading completed', null, {
			totalLevels: this.levels.length,
			loadedLevels: this.levels.map(l => ({ id: l.id, name: l.name }))
		});
	}

	processLevel(levelData) {
		Debug.logLevelEvent('Processing level', levelData.id, {
			rulesCount: levelData.rules.length
		});

		// Convert rule check strings to functions for easier use
		levelData.rules = levelData.rules.map((rule, index) => {
			Debug.logLevelEvent('Processing rule', levelData.id, {
				ruleIndex: index,
				ruleId: rule.id,
				checkType: rule.checkType
			});

			return {
				...rule,
				check: this.ruleEngine.createCheckFunction(rule.checkType, rule.checkParams)
			};
		});

		Debug.logLevelEvent('Level processing completed', levelData.id);
		return levelData;
	}

	getLevel(levelId) {
		Debug.logLevelEvent('Retrieving level', levelId);
		const level = this.levels.find(level => level.id === levelId);

		if (level) {
			Debug.logLevelEvent('Level found', levelId, {
				name: level.name,
				rulesCount: level.rules.length
			});
		} else {
			Debug.logError(new Error(`Level not found: ${levelId}`), 'Level retrieval');
		}

		return level;
	}

	isLevelUnlocked(levelId) {
		const unlocked = this.unlockedLevels.has(levelId);
		Debug.logLevelEvent('Level unlock status checked', levelId, { unlocked });
		return unlocked;
	}

	unlockLevel(levelId) {
		const wasUnlocked = this.unlockedLevels.has(levelId);
		this.unlockedLevels.add(levelId);

		if (!wasUnlocked) {
			Debug.logLevelEvent('Level unlocked', levelId, {
				totalUnlockedLevels: this.unlockedLevels.size,
				allUnlockedLevels: Array.from(this.unlockedLevels)
			});
		}
	}

	getLevelsList() {
		Debug.logLevelEvent('Generating levels list');

		const levelsList = this.levels.map(level => ({
			id: level.id,
			name: level.name,
			description: level.description,
			difficulty: level.difficulty,
			unlocked: this.isLevelUnlocked(level.id)
		}));

		Debug.logLevelEvent('Levels list generated', null, {
			totalLevels: levelsList.length,
			unlockedCount: levelsList.filter(l => l.unlocked).length
		});

		return levelsList;
	}

	updateUnlockedLevels() {
		if (!this.userManager) return;

		const completedLevels = this.userManager.getCompletedLevels();

		// Always unlock the first level
		this.unlockedLevels.add('html-1');

		// Unlock levels based on completed levels
		completedLevels.forEach(levelId => {
			this.unlockedLevels.add(levelId);

			const level = this.getLevel(levelId);
			if (level && level.completion && level.completion.unlocks) {
				level.completion.unlocks.forEach(unlockLevelId => {
					this.unlockedLevels.add(unlockLevelId);
				});
			}
		});

		Debug.logLevelEvent('Unlocked levels updated from user progress', null, {
			completedLevels: completedLevels,
			unlockedLevels: Array.from(this.unlockedLevels)
		});
	}

	isLevelUnlocked(levelId) {
		// Check if level is unlocked by progression
		if (this.unlockedLevels.has(levelId)) {
			return true;
		}

		// Check if user has completed this level (via keys)
		if (this.userManager && this.userManager.isLevelCompleted(levelId)) {
			this.unlockedLevels.add(levelId);
			return true;
		}

		// Check prerequisites
		const level = this.getLevel(levelId);
		if (level && level.prerequisites) {
			const allPrereqsCompleted = level.prerequisites.every(prereqId =>
				this.userManager && this.userManager.isLevelCompleted(prereqId)
			);
			if (allPrereqsCompleted) {
				this.unlockedLevels.add(levelId);
				return true;
			}
		}

		return false;
	}

	completeLevel(levelId) {
		Debug.logLevelEvent('Processing level completion', levelId);

		const level = this.getLevel(levelId);
		if (!level) return;

		// XP is now handled in userManager.completeLevel() called from main.js

		// Unlock next levels
		if (level.completion && level.completion.unlocks) {
			const levelsToUnlock = level.completion.unlocks;

			Debug.logLevelEvent('Unlocking new levels', levelId, {
				levelsToUnlock: levelsToUnlock
			});

			levelsToUnlock.forEach(unlockLevelId => {
				this.unlockLevel(unlockLevelId);
			});

			Debug.logLevelEvent('Level completion processing finished', levelId, {
				newlyUnlockedLevels: levelsToUnlock
			});
		} else {
			Debug.logLevelEvent('No levels to unlock', levelId);
		}
	}

	getLevelsByCategory() {
		const categories = {};

		this.levels.forEach(level => {
			const category = level.category || 'HTML';
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push({
				...level,
				unlocked: this.isLevelUnlocked(level.id),
				completed: this.userManager ? this.userManager.isLevelCompleted(level.id) : false
			});
		});

		return categories;
	}
}