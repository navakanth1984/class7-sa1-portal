/**
 * maths_interactive.js - Comprehensive Pedagogical Learning & Exam Prep Engine
 * Features:
 *  1. Audio Pedagogical Engine (Web Speech API with kid-friendly voice & sentence glow)
 *  2. Interactive Collapsible Mind Maps (SVG-based with zoom & pan)
 *  3. Active Recall & Spaced Repetition (SuperMemo SM-2 & Leitner Box System)
 *  4. Interactive Practice & Test Arena (with Instant Feedback & Confetti)
 *  5. SA-1 Timed Mock Exam Simulator & 5-Minute Revision Cheat Sheet
 *  6. "Oops! Mistake Notebook" (Self-Correction Journal)
 *  7. Floating Canvas Whiteboard / Scratchpad
 */

(function () {
  'use strict';

  /* =========================================================================
     1. Audio Pedagogical Engine (Web Speech API)
     ========================================================================= */
  const AudioEngine = {
    synth: window.speechSynthesis,
    currentUtterance: null,
    isPlaying: false,
    selectedVoice: null,
    rate: 0.9, // optimal pace for 11-13 year olds
    pitch: 1.05, // warm, encouraging teacher pitch
    activeElement: null,

    // Pre-scripted audio guides for topics and exercises
    scripts: {
      'intro-ch7': "Hello young mathematician! Welcome to Chapter 7: A Tale of Three Intersecting Lines. Did you know that when any three straight lines meet in a flat plane, they trap the strongest and most rigid polygon in the universe — the Triangle! Today, we will discover why every triangle's angles add up to exactly 180 degrees, why an exterior angle equals the sum of two interior opposites, and the secret drawbridge rule that decides whether three sticks can form a triangle at all!",
      'intro-ch8': "Welcome to Chapter 8: Working with Fractions! Fractions are not just numbers stacked on top of each other — they are stories about sharing, measuring, and scaling. When we multiply fractions like half times a third, we are taking a slice of another slice! And when we divide fractions, we are simply asking: how many small measuring scoops fit inside the whole container? Let's master the area model and the flip-and-multiply rule together!",
      'angle-sum-proof': "Here is the Parallel Ceiling Proof for the Angle Sum Property. Imagine triangle A B C. Draw a ceiling line through the top vertex A that runs strictly parallel to the base B C. Because of the alternate interior angles, or the Z rule, angle B flips up to the left of vertex A, and angle C flips up to the right! Together with angle A, all three angles line up perfectly on a straight line, which measures 180 degrees! That is why angle A plus angle B plus angle C is always 180 degrees!",
      'exterior-angle-theorem': "The Exterior Angle Theorem is like walking around a triangle. If you extend side B C straight out to point D, the angle formed on the outside is called an Exterior Angle. This outer turn is always equal to the sum of the two interior angles on the far opposite side! So angle A C D equals angle A plus angle B. If the outside angle is 110 degrees and one inside angle is 50 degrees, the other inside angle must be 110 minus 50, which is 60 degrees!",
      'triangle-inequality-rule': "Think of the Triangle Inequality Theorem as two drawbridge arms trying to meet over a river! If your moat is 6 centimeters wide, and your bridge arms are 2 centimeters and 3 centimeters, when they lower down, their total reach is only 5 centimeters! They fall into the water and can never touch. For three sticks to form a closed triangle, the sum of any two sides must be strictly greater than the third side: a plus b is greater than c!",
      'centroid-orthocenter': "Let us never confuse a Median with an Altitude! A Median connects a vertex to the midpoint of the opposite side. All three medians meet at the Centroid, point G, which is the exact center of gravity where a cardboard triangle can balance on the sharp tip of your pencil! On the other hand, an Altitude is a straight perpendicular drop at 90 degrees. All three altitudes meet at the Orthocenter, point H. In a right triangle, the orthocenter sits right at the 90 degree vertex!",
      'frac-mult-area': "Why do we multiply numerators and denominators when multiplying fractions? Picture a square cake! If you shade half of it with blue horizontal stripes, and one third of it with yellow vertical stripes, the part with both stripes has 1 times 1, or 1 piece, out of 2 times 3, or 6 total pieces! The green overlap is one-sixth. Numerators count the double-shaded pieces; denominators count all the pieces!",
      'frac-div-scoop': "Why do we flip the second fraction and multiply when dividing? Imagine you have 3 whole loaves of bread. You want to slice them using a measuring scoop of size one-half. How many half-scoops fit inside 3 wholes? Each whole gives 2 scoops, so 3 wholes give 3 times 2, which is 6 scoops! Dividing by one-half is the exact same thing as multiplying by 2 over 1. Flip and multiply is simply counting scoops!",

      // Exercise specific scripts
      'q-ex71-q2': "Exercise 7.1, Question 2 asks: The three angles of a triangle are equal to one another. What is the measure of each angle? Let each angle be x. Since the sum of all three angles is 180 degrees, we write x plus x plus x equals 180. That means 3x equals 180. Dividing 180 by 3 gives 60 degrees! Each angle is 60 degrees, which means this is an equilateral triangle!",
      'q-ex71-q4': "Exercise 7.1, Question 4 asks: The angles of a triangle are in the ratio 1 to 2 to 3. Find each angle. Let the angles be 1x, 2x, and 3x. Add them together: 1x plus 2x plus 3x equals 6x. Since the total must be 180 degrees, 6x equals 180, so x equals 30 degrees. Multiply out: 1 times 30 is 30 degrees, 2 times 30 is 60 degrees, and 3 times 30 is 90 degrees! This is a right-angled triangle!",
      'q-ex71-q5': "Exercise 7.1, Question 5: Three consecutive angles increase by 10 degrees. Find them. Let the angles be a, a plus 10, and a plus 20. Adding all three gives 3a plus 30 equals 180 degrees. Subtract 30 from 180 to get 150. Now divide 150 by 3 to find a equals 50 degrees! The three angles are 50 degrees, 60 degrees, and 70 degrees.",
      'q-ex72-ext1': "Worked Problem 1 on Exterior Angles: The exterior angle is 110 degrees, and one interior opposite angle is 50 degrees. Find the missing interior angle. Remember our golden rule: Exterior angle equals the sum of the two interior opposites. Therefore, the missing angle is 110 minus 50, which equals 60 degrees!",
      'q-inequality-ex': "Triangle Inequality Test: Can sides of 3 cm, 4 cm, and 8 cm make a triangle? Let us test the shortest two sides: 3 plus 4 is 7. But 7 is NOT greater than 8! The two short sticks cannot reach across the 8 centimeter gap. Therefore, no triangle can be formed!",
      'q-ex83-mult': "Multiplication Example: Multiply 3/4 by 8/9. Before multiplying big numbers, look for shortcuts by cross-cancelling! 4 divides into 8 twice. 3 divides into 9 three times. So we are left with 1 times 2 on top, and 1 times 3 on the bottom. The final simplified answer is 2/3!",
      'q-ex84-div': "Division Word Problem: A rope of length 15 and 3/4 meters is cut into small pieces of 1 and 3/4 meters each. How many pieces do we get? First, turn both mixed numbers into improper fractions. 15 and 3/4 is 63/4. 1 and 3/4 is 7/4. Now divide 63/4 by 7/4. Flip the second fraction to get 63/4 times 4/7. The 4s cancel out completely, and 63 divided by 7 is exactly 9 pieces!"
    },

    init: function () {
      if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API is not supported by this browser.');
        return;
      }
      this.populateVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.populateVoices();
      }
      this.setupCompanionBar();
      this.setupInlineButtons();
    },

    populateVoices: function () {
      const voices = this.synth.getVoices();
      const voiceSelect = document.getElementById('audioVoiceSelect');
      if (!voiceSelect) return;

      voiceSelect.innerHTML = '';
      // Find English voices, prioritizing natural kid-friendly or UK/US/IN English
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      enVoices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${v.name} (${v.lang})`;
        if (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || idx === 0) {
          opt.selected = true;
          this.selectedVoice = v;
        }
        voiceSelect.appendChild(opt);
      });

      voiceSelect.addEventListener('change', (e) => {
        this.selectedVoice = enVoices[e.target.value] || null;
      });
    },

    speakText: function (text, targetEl, onEndCallback) {
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      if (this.activeElement) {
        this.activeElement.classList.remove('audio-highlight');
      }

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.selectedVoice;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      if (targetEl) {
        this.activeElement = targetEl;
        targetEl.classList.add('audio-highlight');
      }

      const updateUIPlaying = (playing) => {
        this.isPlaying = playing;
        const mainBtn = document.getElementById('masterAudioPlayBtn');
        if (mainBtn) mainBtn.innerHTML = playing ? '⏸️ Pause' : '▶️ Play Guide';
      };

      utterance.onstart = () => {
        updateUIPlaying(true);
      };

      utterance.onend = () => {
        updateUIPlaying(false);
        if (this.activeElement) {
          this.activeElement.classList.remove('audio-highlight');
          this.activeElement = null;
        }
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        updateUIPlaying(false);
        if (this.activeElement) {
          this.activeElement.classList.remove('audio-highlight');
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    },

    stop: function () {
      if (this.synth.speaking) {
        this.synth.cancel();
      }
      this.isPlaying = false;
      if (this.activeElement) {
        this.activeElement.classList.remove('audio-highlight');
        this.activeElement = null;
      }
      const mainBtn = document.getElementById('masterAudioPlayBtn');
      if (mainBtn) mainBtn.innerHTML = '▶️ Play Guide';
      document.querySelectorAll('.btn-inline-audio').forEach(b => {
        b.classList.remove('playing');
        b.innerHTML = '🎧 Listen';
      });
    },

    setupCompanionBar: function () {
      const playBtn = document.getElementById('masterAudioPlayBtn');
      const stopBtn = document.getElementById('masterAudioStopBtn');
      const topicSelect = document.getElementById('audioTopicSelect');

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (this.isPlaying) {
            this.synth.pause();
            this.isPlaying = false;
            playBtn.innerHTML = '▶️ Resume';
          } else if (this.synth.paused) {
            this.synth.resume();
            this.isPlaying = true;
            playBtn.innerHTML = '⏸️ Pause';
          } else {
            const topicKey = topicSelect ? topicSelect.value : 'intro-ch7';
            const script = this.scripts[topicKey] || this.scripts['intro-ch7'];
            this.speakText(script);
          }
        });
      }

      if (stopBtn) {
        stopBtn.addEventListener('click', () => this.stop());
      }

      if (topicSelect) {
        topicSelect.addEventListener('change', () => {
          const script = this.scripts[topicSelect.value];
          if (script) {
            this.speakText(script);
          }
        });
      }

      // Speed control buttons
      document.querySelectorAll('.audio-speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.audio-speed-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.rate = parseFloat(btn.dataset.speed);
          if (this.isPlaying && this.currentUtterance) {
            // Restart with new rate
            const topicKey = topicSelect ? topicSelect.value : 'intro-ch7';
            this.speakText(this.scripts[topicKey]);
          }
        });
      });
    },

    setupInlineButtons: function () {
      document.querySelectorAll('.btn-inline-audio').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const scriptKey = btn.dataset.audioKey;
          const customText = btn.dataset.audioText;
          const parentCard = btn.closest('article, .content-card, li, .quiz-card') || btn.parentElement;

          if (btn.classList.contains('playing')) {
            this.stop();
            btn.classList.remove('playing');
            btn.innerHTML = '🎧 Listen';
            return;
          }

          document.querySelectorAll('.btn-inline-audio').forEach(b => {
            b.classList.remove('playing');
            b.innerHTML = '🎧 Listen';
          });

          let textToSpeak = customText || this.scripts[scriptKey];
          if (!textToSpeak) {
            const heading = btn.closest('h1, h2, h3, h4');
            if (heading) {
              let text = heading.innerText.replace(/🎧|Listen|Stop|to Answer|to Teacher/gi, '').trim() + '. ';
              let sibling = heading.nextElementSibling;
              while (sibling && !sibling.matches('h1, h2, h3, h4, hr')) {
                text += sibling.innerText + ' ';
                sibling = sibling.nextElementSibling;
              }
              textToSpeak = text;
            } else {
              textToSpeak = parentCard.innerText.replace(/🎧|Listen|Stop/gi, '');
            }
          }
          btn.classList.add('playing');
          btn.innerHTML = '⏹️ Stop';

          this.speakText(textToSpeak, parentCard, () => {
            btn.classList.remove('playing');
            btn.innerHTML = '🎧 Listen';
          });
        });
      });
    }
  };

  /* =========================================================================
     2. Interactive Concept Mind Maps (SVG-based with zoom & pan)
     ========================================================================= */
  const MindMapEngine = {
    dataCh7: {
      id: 'root-ch7',
      label: '📐 Triangles Universe',
      color: '#0284c7',
      children: [
        {
          id: 'anatomy',
          label: '1. Anatomy & Classification',
          color: '#0f766e',
          children: [
            { id: 'sides', label: 'By Sides: Equilateral (all equal), Isosceles (2 equal), Scalene (all distinct)', color: '#14b8a6' },
            { id: 'angles', label: 'By Angles: Acute (<90°), Right (90°), Obtuse (>90°)', color: '#14b8a6' },
            { id: 'elements', label: '3 Vertices, 3 Sides, 3 Angles, Perimeter = a+b+c', color: '#14b8a6' }
          ]
        },
        {
          id: 'lines',
          label: '2. Special Lines & Centers',
          color: '#d97706',
          children: [
            { id: 'median', label: 'Median: Midpoint connector → Meets at Centroid (G). Physical center of mass (2:1 ratio)', color: '#f59e0b' },
            { id: 'altitude', label: 'Altitude: Perpendicular drop → Meets at Orthocenter (H). (Inside / On 90° vertex / Outside)', color: '#f59e0b' }
          ]
        },
        {
          id: 'theorems',
          label: '3. Golden Theorems',
          color: '#2563eb',
          children: [
            { id: 'sum', label: 'Angle Sum Property: ∠A + ∠B + ∠C = 180° (Parallel Ceiling Proof)', color: '#3b82f6' },
            { id: 'ext', label: 'Exterior Angle: ∠Ext = Sum of two remote interior angles (∠ACD = ∠A + ∠B)', color: '#3b82f6' },
            { id: 'ineq', label: 'Triangle Inequality: Sum of any two sides > 3rd side (a + b > c). Drawbridge rule!', color: '#3b82f6' }
          ]
        },
        {
          id: 'rigidity',
          label: '4. Real-World Applications',
          color: '#7c3aed',
          children: [
            { id: 'bridges', label: 'Structural Rigidity: Truss bridges, bicycle frames, roof rafters do not deform', color: '#8b5cf6' }
          ]
        }
      ]
    },

    dataCh8: {
      id: 'root-ch8',
      label: '🍰 Fractions Mastery',
      color: '#d97706',
      children: [
        {
          id: 'concepts',
          label: '1. What is a Fraction?',
          color: '#0f766e',
          children: [
            { id: 'part-whole', label: 'Part of a Whole: Numerator = parts chosen, Denominator = total equal parts', color: '#14b8a6' },
            { id: 'division', label: 'Division meaning: a/b is identical to a ÷ b', color: '#14b8a6' }
          ]
        },
        {
          id: 'types',
          label: '2. Types of Fractions',
          color: '#2563eb',
          children: [
            { id: 'proper', label: 'Proper: Numerator < Denominator (Value < 1, e.g. 3/4)', color: '#3b82f6' },
            { id: 'improper', label: 'Improper: Numerator ≥ Denominator (Value ≥ 1, e.g. 7/4)', color: '#3b82f6' },
            { id: 'mixed', label: 'Mixed: Whole Number + Proper Fraction (e.g. 1 3/4)', color: '#3b82f6' },
            { id: 'equiv', label: 'Equivalent: Multiply or divide top & bottom by the same non-zero number', color: '#3b82f6' }
          ]
        },
        {
          id: 'ops',
          label: '3. Operations & Models',
          color: '#e11d48',
          children: [
            { id: 'add-sub', label: 'Add/Subtract: Find LCM of denominators, convert to like fractions', color: '#f43f5e' },
            { id: 'mult', label: 'Multiplication: Area Model! (a/b) × (c/d) = (a×c)/(b×d). "Of" means multiply', color: '#f43f5e' },
            { id: 'div', label: 'Division: Scoop Model! Flip & multiply by reciprocal. a/b ÷ c/d = (a/b) × (d/c)', color: '#f43f5e' }
          ]
        },
        {
          id: 'word-prob',
          label: '4. Word Problem Strategy',
          color: '#7c3aed',
          children: [
            { id: 'recipes', label: 'Scaling recipes, cutting ropes, sharing pizzas, finding remainder parts (1 - x)', color: '#8b5cf6' }
          ]
        }
      ]
    },

    init: function () {
      this.renderMap('mindmap-ch7-container', this.dataCh7);
      this.renderMap('mindmap-ch8-container', this.dataCh8);
    },

    renderMap: function (containerId, data) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '520');
      svg.setAttribute('viewBox', '0 0 960 480');
      svg.style.cursor = 'grab';

      // Defs for gradients & filters
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <filter id="shadow-${containerId}" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.15" />
        </filter>
      `;
      svg.appendChild(defs);

      const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(mainGroup);

      // Simple tree layout generator
      const rootX = 60;
      const rootY = 240;

      // Draw Root Node
      this.drawNode(mainGroup, rootX, rootY, data.label, data.color, true, containerId);

      const totalBranches = data.children.length;
      const branchGap = 380 / (totalBranches - 1 || 1);

      data.children.forEach((branch, bIdx) => {
        const bX = 280;
        const bY = 50 + bIdx * branchGap;

        // Path from Root to Branch
        this.drawCurve(mainGroup, rootX + 90, rootY, bX, bY, data.color);
        this.drawNode(mainGroup, bX, bY, branch.label, branch.color, false, containerId);

        // Sub branches
        if (branch.children) {
          const subCount = branch.children.length;
          const subGap = Math.min(48, 120 / (subCount || 1));
          branch.children.forEach((sub, sIdx) => {
            const sX = 580;
            const sY = bY - ((subCount - 1) * subGap) / 2 + sIdx * subGap;
            this.drawCurve(mainGroup, bX + 130, bY, sX, sY, branch.color);
            this.drawNode(mainGroup, sX, sY, sub.label, sub.color, false, containerId, true);
          });
        }
      });

      container.appendChild(svg);
    },

    drawNode: function (group, x, y, text, color, isRoot, containerId, isLeaf) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'mindmap-node');
      g.style.transition = 'transform 0.2s';

      const paddingX = 14;
      const paddingY = 8;
      const fontSize = isRoot ? 15 : isLeaf ? 11.5 : 13;
      const charWidth = fontSize * 0.58;
      const textWidth = Math.min(320, Math.max(80, text.length * charWidth));
      const boxHeight = fontSize + paddingY * 2;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y - boxHeight / 2);
      rect.setAttribute('width', textWidth);
      rect.setAttribute('height', boxHeight);
      rect.setAttribute('rx', isRoot ? 12 : 8);
      rect.setAttribute('fill', isRoot ? color : '#ffffff');
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', isRoot ? '3' : '2');
      rect.setAttribute('filter', `url(#shadow-${containerId})`);
      g.appendChild(rect);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + textWidth / 2);
      label.setAttribute('y', y + fontSize * 0.35);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', isRoot ? '#ffffff' : '#0f172a');
      label.setAttribute('font-size', fontSize);
      label.setAttribute('font-weight', isRoot || !isLeaf ? '700' : '500');
      label.textContent = text.length > 42 ? text.substring(0, 40) + '…' : text;
      g.appendChild(label);

      // Hover and click interaction
      g.addEventListener('click', () => {
        AudioEngine.speakText(text);
      });

      group.appendChild(g);
    },

    drawCurve: function (group, x1, y1, x2, y2, color) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dx = (x2 - x1) * 0.5;
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.7');
      group.appendChild(path);
    }
  };

  /* =========================================================================
     3. Active Recall & Spaced Repetition (SuperMemo SM-2 & Leitner Box System)
     ========================================================================= */
  const FlashcardEngine = {
    cards: [
      {
        id: 'fc1',
        topic: 'Chapter 7',
        question: 'What is the Angle Sum Property of a triangle, and what is its parallel ceiling proof?',
        answer: 'The sum of all three interior angles in any triangle is strictly 180° (∠A + ∠B + ∠C = 180°).\nProof: Draw a line through top vertex A parallel to base BC. By alternate interior angles (Z-rule), ∠B and ∠C flip up to vertex A, forming a straight angle line (180°).',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc2',
        topic: 'Chapter 7',
        question: 'What does the Exterior Angle Theorem state?',
        answer: 'The measure of any exterior angle of a triangle is equal to the sum of the measures of its two remote interior opposite angles.\nFormula: ∠ACD = ∠A + ∠B.',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc3',
        topic: 'Chapter 7',
        question: 'What is the Triangle Inequality Drawbridge rule?',
        answer: 'A closed triangle can exist ONLY IF the sum of the lengths of any two sides is strictly greater than the third side (a + b > c).\nIf two sides sum to less than or equal to the third side, the drawbridge arms collapse and cannot meet!',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc4',
        topic: 'Chapter 7',
        question: 'What is a Median vs an Altitude, and where do they meet?',
        answer: '• Median: Connects a vertex to the midpoint of opposite side. Meets at the CENTROID (G), dividing medians in ratio 2:1. (Center of mass balance point!)\n• Altitude: Perpendicular drop from vertex to opposite side (90°). Meets at the ORTHOCENTER (H).',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc5',
        topic: 'Chapter 7',
        question: 'Where is the Orthocenter located in Acute, Right, and Obtuse triangles?',
        answer: '• Acute Triangle: INSIDE the triangle.\n• Right-Angled Triangle: Exactly ON the vertex containing the 90° angle.\n• Obtuse Triangle: OUTSIDE the triangle, behind the obtuse angle vertex.',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc6',
        topic: 'Chapter 7',
        question: 'Can a triangle have two right angles or two obtuse angles? Why?',
        answer: 'NO. If two angles were 90°, their sum would be 180°, leaving 0° for the third angle (parallel rays that never meet). If two were >90°, their sum would exceed 180°, violating the Angle Sum Property.',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc7',
        topic: 'Chapter 8',
        question: 'What is the difference between a Proper and an Improper fraction?',
        answer: '• Proper Fraction: Numerator < Denominator (e.g. 3/5). Value is strictly less than 1.\n• Improper Fraction: Numerator ≥ Denominator (e.g. 7/4). Value is 1 or greater, and can be rewritten as a Mixed Number (1 3/4).',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc8',
        topic: 'Chapter 8',
        question: 'How does the Area Model explain why numerators multiply and denominators multiply?',
        answer: 'Think of a unit square cake: 1/2 horizontal slice times 1/3 vertical slice creates a grid of 2 × 3 = 6 equal cells. The overlap is 1 × 1 = 1 cell. Thus, (1/2) × (1/3) = 1/6!',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc9',
        topic: 'Chapter 8',
        question: 'Why do we "Flip and Multiply" (Reciprocal) when dividing fractions?',
        answer: 'Division is asking "how many scoops fit inside?". For example, 3 ÷ (1/2) asks how many half-scoops fit into 3 wholes. Since each whole holds 2 halves, 3 holds 3 × 2 = 6. Dividing by a fraction is the same as multiplying by its reciprocal!',
        box: 1,
        nextReview: 0
      },
      {
        id: 'fc10',
        topic: 'Chapter 8',
        question: 'What is the reciprocal of a mixed number like 2 3/4?',
        answer: 'First convert the mixed number to an improper fraction: 2 3/4 = (2×4 + 3)/4 = 11/4.\nThen flip numerator and denominator: Reciprocal is 4/11. (Notice: 11/4 × 4/11 = 1).',
        box: 1,
        nextReview: 0
      }
    ],

    currentIndex: 0,
    isFlipped: false,

    init: function () {
      this.loadStorage();
      this.renderCard();
      this.setupControls();
      this.updateRetentionGauge();
    },

    loadStorage: function () {
      const saved = localStorage.getItem('maths_sa1_flashcards');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.cards.forEach((card, idx) => {
            if (parsed[card.id]) {
              card.box = parsed[card.id].box || 1;
              card.nextReview = parsed[card.id].nextReview || 0;
            }
          });
        } catch (e) {
          console.error('Failed to parse saved flashcards', e);
        }
      }
    },

    saveStorage: function () {
      const saveObj = {};
      this.cards.forEach(c => {
        saveObj[c.id] = { box: c.box, nextReview: c.nextReview };
      });
      localStorage.setItem('maths_sa1_flashcards', JSON.stringify(saveObj));
      this.updateRetentionGauge();
    },

    renderCard: function () {
      const card = this.cards[this.currentIndex];
      const frontEl = document.getElementById('fcFront');
      const backEl = document.getElementById('fcBack');
      const cardInner = document.getElementById('fcCardInner');
      const counterEl = document.getElementById('fcCounter');

      if (!frontEl || !backEl) return;

      this.isFlipped = false;
      cardInner.classList.remove('flipped');

      frontEl.innerHTML = `
        <div>
          <span class="flashcard-badge">${card.topic} • Leitner Box ${card.box}</span>
          <div class="flashcard-prompt" style="margin-top:14px;">${card.question}</div>
        </div>
        <div class="flashcard-instruction">👆 Click anywhere to reveal answer</div>
      `;

      backEl.innerHTML = `
        <div>
          <span class="flashcard-badge" style="background:#d1fae5; color:#065f46;">Master Solution</span>
          <div class="flashcard-answer" style="margin-top:12px; white-space:pre-line;">${card.answer}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-inline-audio" data-audio-text="${encodeURIComponent(card.answer.replace(/\n/g, ' '))}">🎧 Listen to Answer</button>
          <div class="flashcard-instruction">Rate how easily you recalled this:</div>
        </div>
      `;

      AudioEngine.setupInlineButtons();

      if (counterEl) {
        counterEl.textContent = `Card ${this.currentIndex + 1} of ${this.cards.length}`;
      }
    },

    setupControls: function () {
      const scene = document.getElementById('fcCardScene');
      const cardInner = document.getElementById('fcCardInner');

      if (scene && cardInner) {
        scene.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          this.isFlipped = !this.isFlipped;
          cardInner.classList.toggle('flipped', this.isFlipped);
        });
      }

      // Rating buttons: Again, Hard, Good, Easy
      document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rating = btn.dataset.rate;
          const card = this.cards[this.currentIndex];

          if (rating === 'again') {
            card.box = 1;
          } else if (rating === 'hard') {
            card.box = Math.max(1, card.box);
          } else if (rating === 'good') {
            card.box = Math.min(5, card.box + 1);
          } else if (rating === 'easy') {
            card.box = Math.min(5, card.box + 2);
          }

          this.saveStorage();
          this.nextCard();
        });
      });

      const nextBtn = document.getElementById('fcNextBtn');
      const prevBtn = document.getElementById('fcPrevBtn');
      if (nextBtn) nextBtn.addEventListener('click', () => this.nextCard());
      if (prevBtn) prevBtn.addEventListener('click', () => this.prevCard());
    },

    nextCard: function () {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
      this.renderCard();
    },

    prevCard: function () {
      this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
      this.renderCard();
    },

    updateRetentionGauge: function () {
      const gaugeEl = document.getElementById('retentionPercentage');
      const barEl = document.getElementById('retentionProgressBar');
      const masteredEl = document.getElementById('retentionMasteredCount');

      let totalPoints = 0;
      let masteredCount = 0;
      this.cards.forEach(c => {
        totalPoints += c.box;
        if (c.box >= 4) masteredCount++;
      });

      const maxPoints = this.cards.length * 5;
      const percentage = Math.round((totalPoints / maxPoints) * 100);

      if (gaugeEl) gaugeEl.textContent = `${percentage}%`;
      if (barEl) barEl.style.width = `${percentage}%`;
      if (masteredEl) masteredEl.textContent = `${masteredCount} / ${this.cards.length} Core Concepts`;
    }
  };

  /* =========================================================================
     4. Interactive Practice & Quiz Arena (with Instant Feedback & Confetti)
     ========================================================================= */
  const QuizEngine = {
    questions: [
      {
        id: 'q1',
        title: 'Exterior Angle Calculation',
        prompt: 'In a triangle, an exterior angle measures 115°, and one of its interior opposite angles is 45°. What is the measure of the other interior opposite angle?',
        type: 'mcq',
        options: ['160°', '70°', '60°', '80°'],
        correct: 1, // 70°
        explanation: 'By the Exterior Angle Theorem, Exterior Angle = Sum of two interior opposite angles. Therefore, Missing Angle = 115° - 45° = 70°! Well done!'
      },
      {
        id: 'q2',
        title: 'Triangle Existence Test',
        prompt: 'Which of the following sets of side lengths can successfully form a closed triangle?',
        type: 'mcq',
        options: ['2 cm, 3 cm, 6 cm', '4 cm, 5 cm, 9 cm', '6 cm, 7 cm, 10 cm', '1 cm, 2 cm, 4 cm'],
        correct: 2, // 6, 7, 10
        explanation: 'By the Triangle Inequality Theorem, the sum of any two sides must exceed the third side. For 6, 7, 10: 6+7=13 > 10, 6+10=16 > 7, and 7+10=17 > 6. In all other options, the two shorter sticks collapse and cannot bridge the third side!'
      },
      {
        id: 'q3',
        title: 'Ratio of Angles',
        prompt: 'The angles of a triangle are in the ratio 2 : 3 : 4. What is the measure of the largest angle?',
        type: 'mcq',
        options: ['40°', '60°', '80°', '90°'],
        correct: 2, // 80°
        explanation: 'Sum of ratio parts = 2 + 3 + 4 = 9 parts. Since total angle sum is 180°, each part is 180° ÷ 9 = 20°. The largest angle is 4 parts: 4 × 20° = 80°.'
      },
      {
        id: 'q4',
        title: 'Orthocenter Position',
        prompt: 'Where does the Orthocenter of a right-angled triangle lie?',
        type: 'mcq',
        options: ['Inside the triangle', 'At the vertex of the right angle', 'Outside the triangle', 'At the midpoint of the hypotenuse'],
        correct: 1,
        explanation: 'In a right triangle, the two perpendicular legs serve directly as two of the altitudes! Therefore, all three altitudes meet right at the vertex of the 90° right angle.'
      },
      {
        id: 'q5',
        title: 'Fraction Multiplication (Area Model)',
        prompt: 'Multiply and simplify to lowest terms: (3/4) × (8/9)',
        type: 'mcq',
        options: ['24/36', '2/3', '1/3', '3/2'],
        correct: 1, // 2/3
        explanation: 'Cross-cancelling: 4 divides into 8 twice, and 3 divides into 9 three times. This leaves (1×2) / (1×3) = 2/3.'
      },
      {
        id: 'q6',
        title: 'Fraction Division (Scoop Model)',
        prompt: 'Calculate: 6 ÷ (2/3)',
        type: 'mcq',
        options: ['4', '9', '18', '2'],
        correct: 1, // 9
        explanation: 'Flip and multiply by the reciprocal! 6 ÷ (2/3) = 6 × (3/2) = (18 / 2) = 9 scoops!'
      },
      {
        id: 'q7',
        title: 'Centroid Division Ratio',
        prompt: 'The Centroid (G) of a triangle divides each median starting from the vertex to the base in what ratio?',
        type: 'mcq',
        options: ['1 : 1', '2 : 1', '3 : 1', '1 : 2'],
        correct: 1, // 2:1
        explanation: 'The Centroid always divides each median into two segments in the exact ratio 2:1, with the longer piece extending from the vertex to the centroid.'
      },
      {
        id: 'q8',
        title: 'Word Problem: Rope Cutting',
        prompt: 'A ribbon of length 15 ¾ meters is cut into pieces of 1 ¾ meters each. How many total pieces are obtained?',
        type: 'mcq',
        options: ['7 pieces', '8 pieces', '9 pieces', '10 pieces'],
        correct: 2, // 9 pieces
        explanation: 'Convert mixed numbers to improper fractions: 15 ¾ = 63/4 m, and 1 ¾ = 7/4 m. Dividing: (63/4) ÷ (7/4) = (63/4) × (4/7) = 63/7 = 9 pieces!'
      }
    ],

    score: 0,
    attempted: 0,

    init: function () {
      this.renderQuiz();
    },

    renderQuiz: function () {
      const container = document.getElementById('quiz-questions-list');
      if (!container) return;

      container.innerHTML = '';
      this.questions.forEach((q, idx) => {
        const card = document.createElement('article');
        card.className = 'quiz-card';
        card.id = `quiz-${q.id}`;

        let optionsHtml = '';
        q.options.forEach((opt, optIdx) => {
          optionsHtml += `
            <div class="quiz-option" data-qid="${q.id}" data-opt="${optIdx}">
              <span style="font-weight:700; width:22px; height:22px; border-radius:50%; background:#f1f5f9; display:inline-flex; align-items:center; justify-content:center; font-size:0.75rem;">${String.fromCharCode(65 + optIdx)}</span>
              <span>${opt}</span>
            </div>
          `;
        });

        card.innerHTML = `
          <div class="quiz-header">
            <span class="quiz-number">Question ${idx + 1} of ${this.questions.length} • ${q.title}</span>
            <button class="btn-inline-audio" data-audio-text="${encodeURIComponent(q.prompt)}">🎧 Listen</button>
          </div>
          <p style="font-weight:600; font-size:1.02rem; margin-bottom:12px;">${q.prompt}</p>
          <div class="quiz-options">${optionsHtml}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <button class="btn primary check-answer-btn" data-qid="${q.id}" style="padding:6px 16px;">Check Answer</button>
            <span class="quiz-status-indicator" id="status-${q.id}" style="font-size:0.85rem; font-weight:700;"></span>
          </div>
          <div class="quiz-feedback" id="feedback-${q.id}"></div>
        `;

        container.appendChild(card);
      });

      AudioEngine.setupInlineButtons();
      this.setupQuizInteractions();
    },

    setupQuizInteractions: function () {
      // Option selection
      document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const qid = opt.dataset.qid;
          const parent = opt.closest('.quiz-options');
          parent.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        });
      });

      // Check answer
      document.querySelectorAll('.check-answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const qid = btn.dataset.qid;
          const q = this.questions.find(item => item.id === qid);
          const card = document.getElementById(`quiz-${qid}`);
          const selectedOpt = card.querySelector('.quiz-option.selected');
          const feedback = document.getElementById(`feedback-${qid}`);
          const status = document.getElementById(`status-${qid}`);

          if (!selectedOpt) {
            alert('Please select an option first!');
            return;
          }

          const chosenIdx = parseInt(selectedOpt.dataset.opt, 10);
          const isCorrect = chosenIdx === q.correct;

          feedback.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
          feedback.innerHTML = `
            <strong>${isCorrect ? '🎉 Correct!' : '⚠️ Not quite.'}</strong> ${q.explanation}
            ${!isCorrect ? `<br><button class="btn add-mistake-btn" data-qid="${qid}" style="margin-top:8px; padding:4px 10px; font-size:0.8rem; background:#fee2e2; border-color:#f87171; color:#991b1b;">➕ Add to Oops! Mistake Notebook</button>` : ''}
          `;

          if (isCorrect) {
            card.classList.add('answered-correct');
            status.textContent = '✅ Correct (+15 XP)';
            status.style.color = '#15803d';
            // Trigger Confetti!
            if (typeof confetti === 'function') {
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
            }
            this.score++;
          } else {
            card.classList.add('answered-incorrect');
            status.textContent = '❌ Review Explanation';
            status.style.color = '#b91c1c';
            MistakeNotebook.addMistake(q, chosenIdx);
          }

          this.attempted++;
          this.updateScoreboard();

          // Bind add mistake button if created
          const addMistakeBtn = feedback.querySelector('.add-mistake-btn');
          if (addMistakeBtn) {
            addMistakeBtn.addEventListener('click', () => {
              MistakeNotebook.addMistake(q, chosenIdx);
              addMistakeBtn.textContent = '✅ Added to Mistake Notebook';
              addMistakeBtn.disabled = true;
            });
          }
        });
      });
    },

    updateScoreboard: function () {
      const scoreEl = document.getElementById('quizLiveScore');
      const pctEl = document.getElementById('quizLivePercentage');
      if (scoreEl) scoreEl.textContent = `${this.score} / ${this.attempted}`;
      if (pctEl && this.attempted > 0) {
        pctEl.textContent = `${Math.round((this.score / this.attempted) * 100)}%`;
      }
    }
  };

  /* =========================================================================
     5. SA-1 Timed Mock Exam Simulator & 5-Minute Revision Cheat Sheet
     ========================================================================= */
  const ExamSimulator = {
    timerInterval: null,
    totalSeconds: 45 * 60, // 45 minutes
    remainingSeconds: 45 * 60,
    isRunning: false,

    init: function () {
      this.setupTimer();
      this.setupCheatSheetPrint();
    },

    setupTimer: function () {
      const startBtn = document.getElementById('startExamTimerBtn');
      const resetBtn = document.getElementById('resetExamTimerBtn');
      const display = document.getElementById('examTimerDigits');

      const updateDisplay = () => {
        if (!display) return;
        const m = Math.floor(this.remainingSeconds / 60);
        const s = this.remainingSeconds % 60;
        display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            startBtn.innerHTML = '▶️ Resume Exam';
          } else {
            this.isRunning = true;
            startBtn.innerHTML = '⏸️ Pause Exam';
            this.timerInterval = setInterval(() => {
              if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                updateDisplay();
              } else {
                clearInterval(this.timerInterval);
                this.isRunning = false;
                alert('⏰ Time is up! Review your answers and submit your exam paper.');
              }
            }, 1000);
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          clearInterval(this.timerInterval);
          this.isRunning = false;
          this.remainingSeconds = this.totalSeconds;
          updateDisplay();
          if (startBtn) startBtn.innerHTML = '▶️ Start Exam';
        });
      }
    },

    setupCheatSheetPrint: function () {
      const printBtn = document.getElementById('printCheatSheetBtn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }
    }
  };

  /* =========================================================================
     6. "Oops! Mistake Notebook" (Self-Correction Journal)
     ========================================================================= */
  const MistakeNotebook = {
    mistakes: [],

    init: function () {
      this.load();
      this.render();
    },

    load: function () {
      const data = localStorage.getItem('maths_sa1_mistakes');
      if (data) {
        try {
          this.mistakes = JSON.parse(data);
        } catch (e) {
          this.mistakes = [];
        }
      }
    },

    save: function () {
      localStorage.setItem('maths_sa1_mistakes', JSON.stringify(this.mistakes));
      this.render();
    },

    addMistake: function (questionObj, chosenOptionIdx) {
      if (!this.mistakes.some(m => m.id === questionObj.id)) {
        this.mistakes.push({
          id: questionObj.id,
          title: questionObj.title,
          prompt: questionObj.prompt,
          userChoice: questionObj.options[chosenOptionIdx],
          correctChoice: questionObj.options[questionObj.correct],
          explanation: questionObj.explanation,
          date: new Date().toLocaleDateString()
        });
        this.save();
      }
    },

    removeMistake: function (id) {
      this.mistakes = this.mistakes.filter(m => m.id !== id);
      this.save();
    },

    render: function () {
      const container = document.getElementById('mistakes-list');
      const badge = document.getElementById('mistakeCountBadge');
      if (!container) return;

      if (badge) badge.textContent = `${this.mistakes.length} Weak Spots`;

      if (this.mistakes.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:30px; color:#15803d;">
            <div style="font-size:2.5rem;">🌟</div>
            <h3 style="margin:8px 0;">Your Mistake Notebook is Clean!</h3>
            <p style="color:#64748b; font-size:0.9rem;">You have not logged any mistakes yet. Keep solving questions and testing your limits!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      this.mistakes.forEach(m => {
        const item = document.createElement('div');
        item.className = 'mistake-item';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <strong style="color:#b45309; font-size:0.95rem;">📌 ${m.title}</strong>
            <button class="btn clear-mistake-btn" data-id="${m.id}" style="padding:2px 8px; font-size:0.75rem; background:#dcfce7; border-color:#86efac; color:#166534;">✅ Mastered & Clear</button>
          </div>
          <p style="margin:6px 0; font-size:0.9rem; font-weight:600;">${m.prompt}</p>
          <div style="font-size:0.85rem; color:#7f1d1d; background:#fee2e2; padding:6px 10px; border-radius:6px; margin:6px 0;">
            ❌ What you selected: <strong>${m.userChoice}</strong>
          </div>
          <div style="font-size:0.85rem; color:#14532d; background:#dcfce7; padding:6px 10px; border-radius:6px; margin:6px 0;">
            💡 How to solve it: ${m.explanation}
          </div>
        `;
        container.appendChild(item);
      });

      container.querySelectorAll('.clear-mistake-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.removeMistake(btn.dataset.id);
        });
      });
    }
  };

  /* =========================================================================
     7. Floating Canvas Whiteboard / Scratchpad
     ========================================================================= */
  const ScratchpadEngine = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    color: '#1e293b',
    lineWidth: 3,

    init: function () {
      this.canvas = document.getElementById('scratchpadCanvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      const modal = document.getElementById('scratchpadModal');
      const fab = document.getElementById('scratchpadFab');
      const closeBtn = document.getElementById('closeScratchpadBtn');

      if (fab && modal) {
        fab.addEventListener('click', () => {
          modal.classList.toggle('open');
          this.resize();
        });
      }

      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('open');
        });
      }

      this.setupDrawing();
    },

    resize: function () {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    },

    setupDrawing: function () {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const start = (e) => {
        this.isDrawing = true;
        const pos = getPos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
      };

      const draw = (e) => {
        if (!this.isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
      };

      const stop = () => {
        this.isDrawing = false;
      };

      this.canvas.addEventListener('mousedown', start);
      this.canvas.addEventListener('mousemove', draw);
      window.addEventListener('mouseup', stop);

      this.canvas.addEventListener('touchstart', start, { passive: false });
      this.canvas.addEventListener('touchmove', draw, { passive: false });
      window.addEventListener('touchend', stop);

      // Tool controls
      document.querySelectorAll('.sp-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.color = btn.dataset.color;
          this.lineWidth = btn.dataset.width ? parseInt(btn.dataset.width, 10) : 3;
        });
      });

      const clearBtn = document.getElementById('clearScratchpadBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });
      }
    }
  };

  /* =========================================================================
     8. Smart Tab-Aware Navigation & Deep Linking
     ========================================================================= */
  const SmartNavigator = {
    init: function () {
      this.bindAnchorClicks();
      this.handleInitialHash();
      window.addEventListener('hashchange', () => this.navigateToHash(window.location.hash));
    },

    activateTabForElement: function (targetEl) {
      if (!targetEl) return false;
      const panel = targetEl.closest('.tab-panel');
      if (panel) {
        const tabBtn = document.querySelector(`.tab[data-tab="${panel.id}"]`);
        if (tabBtn) {
          tabBtn.click();
          return true;
        }
      }
      return false;
    },

    navigateToHash: function (hash, smooth = true) {
      if (!hash || hash === '#') return;
      const targetId = decodeURIComponent(hash.replace(/^#/, ''));
      const target = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
      if (target) {
        this.activateTabForElement(target);
        setTimeout(() => {
          target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
          target.classList.add('audio-highlight');
          setTimeout(() => target.classList.remove('audio-highlight'), 2500);
        }, 150);
      }
    },

    bindAnchorClicks: function () {
      document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href && href.length > 1) {
            e.preventDefault();
            history.pushState(null, '', href);
            this.navigateToHash(href);
          }
        }
      });
    },

    handleInitialHash: function () {
      if (window.location.hash) {
        setTimeout(() => this.navigateToHash(window.location.hash, false), 350);
      }
    }
  };

  /* =========================================================================
     Master Bootstrap
     ========================================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    AudioEngine.init();
    MindMapEngine.init();
    FlashcardEngine.init();
    QuizEngine.init();
    ExamSimulator.init();
    MistakeNotebook.init();
    ScratchpadEngine.init();
    SmartNavigator.init();
  });

})();
