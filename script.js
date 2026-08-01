class PremierLeaguePredictions {
  constructor() {
    this.teams = [
      "AFC Bournemouth", "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion", 
      "Chelsea", "Coventry City", "Crystal Palace", "Everton", "Fulham", 
      "Hull City", "Ipswich Town", "Leeds United", "Liverpool", "Manchester City", 
      "Manchester United", "Newcastle United", "Nottingham Forest", "Sunderland", "Tottenham Hotspur"
    ];
    this.scriptURL = 'https://script.google.com/macros/s/AKfycbw2k8sOZgYWQhaz1EbeBc-YIuAUse53cKR-dn4JwnjEYcKQEG1i0KVbsMQc5bDcDz7PUg/exec';

    this.list = document.getElementById('sortableList');
    this.overSelect = document.getElementById('overAchiever');
    this.underSelect = document.getElementById('underAchiever');
    this.submitBtn = document.querySelector('button');
    this.playerNameInput = document.getElementById('playerName');
    this.topScorerInput = document.getElementById('topScorer');
    this.toastElement = document.getElementById('toast');

    this.init();
  }

  init() {
    this.populateDropdowns();
    this.renderList();
    this.initializeSortable();
    this.attachEventListeners();
  }

  populateDropdowns() {
    this.teams.forEach(team => {
      this.overSelect.add(new Option(team, team));
      this.underSelect.add(new Option(team, team));
    });
  }

  renderList() {
    this.list.innerHTML = '';
    
    const gripIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`;

    this.teams.forEach((team, index) => {
      const li = document.createElement('li');
      li.className = 'team-item';
      
      li.innerHTML = `
        <span class="position"></span> 
        <span class="team-name">${team}</span>
        <div class="grip-handle">${gripIcon}</div>
      `;
      
      this.list.appendChild(li);
    });

    // Run once on load to set initial numbers and colors
    this.updatePositions();
  }

  initializeSortable() {
    new Sortable(this.list, {
      handle: '.grip-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: () => {
        this.updatePositions();
      }
    });
  }

  attachEventListeners() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitPredictions();
      });
    }
  }

  updatePositions() {
    const items = this.list.querySelectorAll('.team-item');
    items.forEach((item, index) => {
      const posSpan = item.querySelector('.position');
      const pos = index + 1;
      
      posSpan.innerText = pos;
      
      // Reset classes
      posSpan.className = 'position';
      
      // Apply color coding
      if (pos === 1) {
        posSpan.classList.add('pos-champ');
      } else if (pos >= 2 && pos <= 4) {
        posSpan.classList.add('pos-cl');
      } else if (pos === 5) {
        posSpan.classList.add('pos-el');
      } else if (pos === 6) {
        posSpan.classList.add('pos-ecl');
      } else if (pos >= 18 && pos <= 20) {
        posSpan.classList.add('pos-rel');
      }
    });
  }

  showToast(message, isError = false) {
    if (!this.toastElement) return;
    
    this.toastElement.innerText = message;
    
    if (isError) {
      this.toastElement.classList.add('error');
    } else {
      this.toastElement.classList.remove('error');
    }
    
    this.toastElement.classList.add('show');
    
    // Hide after 3.5 seconds
    setTimeout(() => {
      this.toastElement.classList.remove('show');
    }, 3500);
  }

  async submitPredictions() {
    const name = this.playerNameInput.value.trim();
    const scorer = this.topScorerInput.value.trim();
    const overAchiever = this.overSelect.value;
    const underAchiever = this.underSelect.value;
    
    if (!name || !scorer) {
      this.showToast("⚠️ Please fill in your name and Golden Boot!", true);
      return;
    }

    const teamItems = this.list.querySelectorAll('.team-name');
    const tablePredictions = Array.from(teamItems).map(item => item.innerText);

    const payload = {
      name: name,
      scorer: scorer,
      overAchiever: overAchiever,
      underAchiever: underAchiever,
      table: tablePredictions
    };

    this.submitBtn.innerText = 'Saving...';
    this.submitBtn.disabled = true;

    try {
      await fetch(this.scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      
      this.showToast(`✅ Predictions for ${name} saved successfully!`);
      
    } catch (error) {
      console.error('Error:', error);
      this.showToast('❌ Failed to save. Check your connection.', true);
    } finally {
      this.submitBtn.innerText = 'Submit Predictions';
      this.submitBtn.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PremierLeaguePredictions();
});