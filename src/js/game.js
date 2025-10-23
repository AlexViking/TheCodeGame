import { RuleEngine } from './ruleEngine.js';
import { CodeEditor } from './codeEditor.js';
import Debug from './debug.js';

export class Game {
	constructor(levelData, ui, levelManager) {
		Debug.logInit('Game', {
			levelId: levelData.id,
			levelName: levelData.name,
			rulesCount: levelData.rules.length
		});

		this.level = levelData;
		this.ui = ui;
		this.levelManager = levelManager;
		this.currentRuleIndex = 0;
		this.completedRules = new Set();
		this.ruleEngine = new RuleEngine();
		this.codeEditor = new CodeEditor();
		this.currentCode = '';
		this.advanceTimeout = null; // For delaying auto-advance
		this.levelCompleted = false; // Prevent duplicate completion
	}

	start() {
		Debug.logGameFlow('Game starting', {
			levelId: this.level.id,
			initialRuleIndex: this.currentRuleIndex
		});

		this.ui.showGameScreen(this.level);
		this.bindEvents();
		this.renderRules();
		this.updateProgress();
		this.checkCode();

		Debug.logGameFlow('Game started successfully');
	}

	bindEvents() {
		Debug.logGameFlow('Binding game events');

		const codeInput = document.getElementById('codeInput');
		if (codeInput) {
			codeInput.addEventListener('input', () => {
				Debug.logGameFlow('Code input detected', {
					codeLength: codeInput.value.length,
					currentRuleIndex: this.currentRuleIndex
				});
				this.checkCode();
			});
		}

		// Note: Next button removed - using auto-advance functionality
	}

	checkCode() {
		this.currentCode = this.codeEditor.getCode();

		Debug.logGameFlow('Checking code', {
			codeLength: this.currentCode.length,
			currentRuleIndex: this.currentRuleIndex,
			codePreview: this.currentCode.substring(0, 50) + (this.currentCode.length > 50 ? '...' : '')
		});

		const results = this.ruleEngine.validate(
			this.currentCode,
			this.level.rules,
			this.currentRuleIndex
		);

		Debug.logGameFlow('Code validation completed', {
			currentRulePassed: results.currentRulePassed,
			allPreviousRulesPassed: results.allPreviousRulesPassed,
			totalResults: results.ruleResults.length
		});

		// Update completed rules based on validation results
		const previousCompletedCount = this.completedRules.size;
		this.completedRules.clear();
		results.ruleResults.forEach(result => {
			if (result.passed) {
				this.completedRules.add(result.ruleId);
			}
		});

		if (this.completedRules.size !== previousCompletedCount) {
			Debug.logGameFlow('Completed rules changed', {
				previousCount: previousCompletedCount,
				newCount: this.completedRules.size,
				completedRules: Array.from(this.completedRules)
			});
		}

		// Analyze code for errors and hints
		const currentRule = this.level.rules[this.currentRuleIndex];
		this.codeEditor.analyzeCode(this.currentCode, currentRule, results);

		this.updateUI(results);
	}

	updateUI(results) {
		// Update preview
		this.updatePreview();

		// Update rules display
		this.renderRules();

		// Update progress
		this.updateProgress();

		// Auto-advance to next rule, but not to level completion
		if (results.currentRulePassed && results.allPreviousRulesPassed) {
			Debug.logGameFlow('Rule passed - checking if should advance', {
				currentRuleIndex: this.currentRuleIndex,
				isLastRule: this.currentRuleIndex === this.level.rules.length - 1
			});

			// Clear any existing timeout
			if (this.advanceTimeout) {
				clearTimeout(this.advanceTimeout);
			}

			// Only auto-advance if NOT the last rule
			if (this.currentRuleIndex < this.level.rules.length - 1) {
				// Add a small delay for user feedback before advancing
				this.advanceTimeout = setTimeout(() => {
					this.nextRule();
					this.advanceTimeout = null;
				}, 1500); // 1.5 second delay
			} else {
				// Last rule completed - show completion button instead of auto-completing
				this.showCompletionButton();
			}
		} else {
			// Clear timeout if rule is no longer passed
			if (this.advanceTimeout) {
				clearTimeout(this.advanceTimeout);
				this.advanceTimeout = null;
			}
			// Hide completion button if rules are no longer all passed
			this.hideCompletionButton();
		}
	}

	updatePreview() {
		const previewArea = document.getElementById('previewArea');
		if (!previewArea) return;

		try {
			let sanitizedCode = this.currentCode;

			// Check if this is a JavaScript level
			const isJavaScriptLevel = this.level.category === 'JAVASCRIPT';

			if (!isJavaScriptLevel) {
				// For non-JS levels, remove script tags for security
				sanitizedCode = sanitizedCode
					.replace(/<script[^>]*>.*?<\/script>/gi, '')
					.replace(/on\w+\s*=/gi, '');
			} else {
				// For JS levels, keep onclick handlers but remove dangerous ones
				sanitizedCode = sanitizedCode.replace(/on(?!click)\w+\s*=/gi, '');
			}

			// Scope CSS to prevent interference with game UI
			sanitizedCode = this.scopeUserCSS(sanitizedCode);

			// Wrap content in isolation container
			previewArea.innerHTML = `<div class="user-content-container">${sanitizedCode}</div>`;

			// For JavaScript levels, we need to execute scripts after DOM insertion
			if (isJavaScriptLevel) {
				this.executeUserScripts();
			}
		} catch (e) {
			previewArea.innerHTML = '<div class="preview-error">Error rendering preview</div>';
		}
	}

	executeUserScripts() {
		// Find and execute script tags in the user content
		const userContainer = document.querySelector('#previewArea .user-content-container');
		if (!userContainer) return;

		const scripts = userContainer.querySelectorAll('script');
		scripts.forEach(script => {
			try {
				// First check if the script content is valid
				let scriptContent = script.textContent.trim();
				if (!scriptContent) return;

				// Clean up any HTML entities or malformed content
				scriptContent = scriptContent
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&amp;/g, '&')
					.replace(/&quot;/g, '"');

				// Test the script content for basic JavaScript validity
				if (scriptContent.includes('<') && !scriptContent.includes('innerHTML')) {
					console.warn('Script contains HTML content, skipping execution');
					return;
				}

				// Execute script in global scope so onclick handlers can access functions
				try {
					// Use eval to execute in global scope (needed for onclick handlers)
					window.eval(`
						try {
							${scriptContent}
						} catch (e) {
							console.warn('User script execution error:', e.message);
						}
					`);
				} catch (syntaxError) {
					console.warn('Syntax error in user script:', syntaxError.message);
					return;
				}

			} catch (e) {
				console.warn('Error executing user script:', e.message);
			}
		});
	}

	scopeUserCSS(code) {
		// Find style tags and scope their CSS to .user-content-container
		return code.replace(/<style>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
			// Add scope to each CSS rule
			const scopedCSS = cssContent.replace(/([^{}]+)\{/g, '.user-content-container $1{');
			return `<style>${scopedCSS}</style>`;
		});
	}

	renderRules() {
		const container = document.getElementById('rulesSection');
		if (!container) return;

		container.innerHTML = '';

		// Filter rules to show: completed rules + current rule (current rule always at top)
		const rulesToShow = [];

		// Add current rule first (at top)
		if (this.currentRuleIndex < this.level.rules.length) {
			const currentRule = this.level.rules[this.currentRuleIndex];
			rulesToShow.push({
				...currentRule,
				index: this.currentRuleIndex,
				isCurrent: true
			});
		}

		// Add completed rules below current rule
		this.level.rules.forEach((rule, index) => {
			if (index < this.currentRuleIndex && this.completedRules.has(rule.id)) {
				rulesToShow.push({
					...rule,
					index: index,
					isCurrent: false
				});
			}
		});

		Debug.logGameFlow('Rendering rules', {
			totalRules: this.level.rules.length,
			currentRuleIndex: this.currentRuleIndex,
			visibleRules: rulesToShow.length,
			completedRules: this.completedRules.size
		});

		rulesToShow.forEach(rule => {
			const isCompleted = this.completedRules.has(rule.id);
			const isCurrent = rule.isCurrent;

			const ruleCard = document.createElement('div');
			ruleCard.className = `rule-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
			ruleCard.innerHTML = `
				<div class="rule-number">${rule.id}</div>
				<div class="rule-header">
					<div class="rule-text">${rule.text}</div>
					<div class="rule-actions">
						<button class="info-button" onclick="window.game.toggleHint(${rule.id})">INFO</button>
						<span class="rule-status">${isCompleted ? '✅' : isCurrent ? '⏳' : '❌'}</span>
					</div>
				</div>
				<div class="rule-hint" id="hint-${rule.id}">
					💡 ${rule.hint}
				</div>
			`;

			container.appendChild(ruleCard);
		});
	}

	toggleHint(ruleId) {
		const hint = document.getElementById(`hint-${ruleId}`);
		if (hint) {
			hint.classList.toggle('visible');
		}
	}

	updateProgress() {
		const rulesCompletedElement = document.getElementById('rulesCompleted');
		const totalRulesElement = document.getElementById('totalRules');

		if (rulesCompletedElement) {
			rulesCompletedElement.textContent = this.completedRules.size;
		}

		if (totalRulesElement) {
			totalRulesElement.textContent = this.level.rules.length;
		}
	}

	nextRule() {
		const wasLastRule = this.currentRuleIndex === this.level.rules.length - 1;

		Debug.logGameFlow('Advancing to next rule', {
			currentRuleIndex: this.currentRuleIndex,
			isLastRule: wasLastRule,
			totalRules: this.level.rules.length
		});

		if (this.currentRuleIndex < this.level.rules.length - 1) {
			this.currentRuleIndex++;
			Debug.logGameFlow('Rule index advanced', {
				newRuleIndex: this.currentRuleIndex,
				currentRule: this.level.rules[this.currentRuleIndex].text
			});

			this.renderRules();
			this.checkCode();
		} else {
			// Level complete
			Debug.logLevelEvent('Level completion triggered', this.level.id);
			this.completeLevel();
		}
	}

	completeLevel() {
		// Prevent duplicate completion
		if (this.levelCompleted) {
			Debug.logLevelEvent('Level completion already processed', this.level.id);
			return;
		}

		this.levelCompleted = true;

		Debug.logLevelEvent('Level completed', this.level.id, {
			finalRuleIndex: this.currentRuleIndex,
			completedRulesCount: this.completedRules.size,
			totalRules: this.level.rules.length
		});

		// Emit level completion event to main app
		this.ui.emit('levelCompleted', this.level.id);

		// Show success modal with level manager for next level detection
		this.ui.showSuccess(this.level, this.levelManager);
	}

	showCompletionButton() {
		let completionButton = document.getElementById('completeLevelBtn');

		if (!completionButton) {
			// Create the completion button
			completionButton = document.createElement('button');
			completionButton.id = 'completeLevelBtn';
			completionButton.className = 'complete-level-btn';
			completionButton.textContent = '🎉 COMPLETE LEVEL';
			completionButton.onclick = () => this.completeLevel();

			// Add to rules section
			const rulesSection = document.getElementById('rulesSection');
			if (rulesSection) {
				rulesSection.appendChild(completionButton);
			}
		}

		completionButton.style.display = 'block';
		Debug.logGameFlow('Completion button shown');
	}

	hideCompletionButton() {
		const completionButton = document.getElementById('completeLevelBtn');
		if (completionButton) {
			completionButton.style.display = 'none';
			Debug.logGameFlow('Completion button hidden');
		}
	}

	advanceToNextRule() {
		this.nextRule();
	}
}