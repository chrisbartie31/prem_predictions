class PremierLeaguePredictions {
  constructor() {
    this.teams = [
      "AFC Bournemouth",
      "Arsenal",
      "Aston Villa",
      "Brentford",
      "Brighton & Hove Albion",
      "Chelsea",
      "Coventry City",
      "Crystal Palace",
      "Everton",
      "Fulham",
      "Hull City",
      "Ipswich Town",
      "Leeds United",
      "Liverpool",
      "Manchester City",
      "Manchester United",
      "Newcastle United",
      "Nottingham Forest",
      "Sunderland",
      "Tottenham Hotspur",
    ];

    this.scriptURL =
      'https://script.google.com/macros/s/AKfycbw2k8sOZgYWQhaz1EbeBc-YIuAUse53cKR-dn4JwnjEYcKQEG1i0KVbsMQc5bDcDz7PUg/exec';

    // Set the lockout date (YYYY-MM-DDTHH:MM:SSZ)
    this.seasonStartDate = new Date("2026-08-21T12:00:00Z");

    // DOM Elements - Forms
    this.list = document.getElementById("sortableList");
    this.overSelect = document.getElementById("overAchiever");
    this.underSelect = document.getElementById("underAchiever");
    this.submitBtn = document.getElementById("submitBtn");
    this.playerNameInput = document.getElementById("playerName");
    this.playerEmailInput = document.getElementById("playerEmail");
    this.topScorerInput = document.getElementById("topScorer");

    // DOM Elements - Tabs & Entries
    this.btnMyPicks = document.getElementById("btnMyPicks");
    this.btnAllEntries = document.getElementById("btnAllEntries");
    this.myPicksTab = document.getElementById("myPicksTab");
    this.allEntriesTab = document.getElementById("allEntriesTab");
    this.entriesList = document.getElementById("entriesList");
    this.entryDetail = document.getElementById("entryDetail");
    this.lockStatus = document.getElementById("lockStatus");
    this.backToListBtn = document.getElementById("backToListBtn");
    this.toastElement = document.getElementById("toast");

    this.entriesData = [];

    this.init();
  }

  init() {
    this.populateDropdowns();
    this.renderList();
    this.initializeSortable();
    this.attachEventListeners();
  }

  populateDropdowns() {
    this.teams.forEach((team) => {
      this.overSelect.add(new Option(team, team));
      this.underSelect.add(new Option(team, team));
    });
  }

  getPositionClass(index) {
    const pos = index + 1;
    if (pos >= 1 && pos <= 4) return "pos-cl";       // Champions League
    if (pos === 5) return "pos-el";                  // Europa League
    if (pos === 6) return "pos-uecl";                // Conference League Green
    if (pos >= 18 && pos <= 20) return "pos-rel";    // Relegation
    return ""; // Default (no color) for 7-17
  }

  showToast(message, isError = false) {
    this.toastElement.innerText = message;

    if (isError) {
      this.toastElement.classList.add("error");
    } else {
      this.toastElement.classList.remove("error");
    }

    this.toastElement.classList.add("show");

    // Hide the toast automatically after 3 seconds
    setTimeout(() => {
      this.toastElement.classList.remove("show");
    }, 3000);
  }

  renderList() {
    this.list.innerHTML = "";
    const gripIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`;

    this.teams.forEach((team, index) => {
      const posClass = this.getPositionClass(index);
      const li = document.createElement("li");
      li.className = "team-item";
      li.innerHTML = `
        <span class="position ${posClass}">${index + 1}</span> 
        <span class="team-name">${team}</span>
        <div class="grip-handle">${gripIcon}</div>
      `;
      this.list.appendChild(li);
    });
  }

  initializeSortable() {
    new Sortable(this.list, {
      handle: ".grip-handle",
      animation: 150,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onEnd: () => {
        this.updatePositions();
      },
    });
  }

  updatePositions() {
    const items = this.list.querySelectorAll(".team-item");
    items.forEach((item, index) => {
      const posSpan = item.querySelector(".position");
      posSpan.innerText = index + 1;
      
      // Reset the classes and apply the correct color for the new position
      posSpan.className = "position";
      const posClass = this.getPositionClass(index);
      if (posClass) {
        posSpan.classList.add(posClass);
      }
    });
  }

  attachEventListeners() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.submitPredictions();
      });
    }

    // Tab Switching Logic
    this.btnMyPicks.addEventListener("click", () => this.switchTab("picks"));
    this.btnAllEntries.addEventListener("click", () => {
      this.switchTab("entries");
      this.fetchAllEntries();
    });

    this.backToListBtn.addEventListener("click", () => {
      this.entryDetail.style.display = "none";
      document.querySelector("#allEntriesTab .card:first-child").style.display =
        "block";
    });
  }

  switchTab(tab) {
    if (tab === "picks") {
      this.btnMyPicks.classList.add("active");
      this.btnAllEntries.classList.remove("active");
      this.myPicksTab.classList.add("active");
      this.allEntriesTab.classList.remove("active");
    } else {
      this.btnAllEntries.classList.add("active");
      this.btnMyPicks.classList.remove("active");
      this.allEntriesTab.classList.add("active");
      this.myPicksTab.classList.remove("active");
    }
  }

  async fetchAllEntries() {
    this.entriesList.innerHTML = "<p>Loading entries...</p>";

    try {
      // We can fetch data via GET without no-cors mode, allowing us to read the JSON response.
      const response = await fetch(this.scriptURL);
      const data = await response.json();

      if (data.result === "success") {
        this.entriesData = data.data;
        this.renderEntriesList();
      } else {
        throw new Error("Script error");
      }
    } catch (error) {
      console.error(error);
      this.entriesList.innerHTML =
        '<p style="color: red;">Failed to load entries. Check connection.</p>';
    }
  }

  renderEntriesList() {
    this.entriesList.innerHTML = "";
    const now = new Date();
    const isLocked = now < this.seasonStartDate;

    if (isLocked) {
      this.lockStatus.innerText =
        "🔒 Picks are locked and hidden until the season starts!";
    } else {
      this.lockStatus.innerText =
        "🔓 The season has started! All picks are revealed.";
    }

    if (this.entriesData.length === 0) {
      this.entriesList.innerHTML = "<p>No predictions submitted yet.</p>";
      return;
    }

    this.entriesData.forEach((entry, index) => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "entry-card";
      entryDiv.innerHTML = `
        <span style="font-weight: bold; font-size: 1.1rem;">${entry.name}</span>
        <span style="color: var(--text-muted); font-size: 0.85rem;">Status: Submitted ✅</span>
      `;

      entryDiv.addEventListener("click", () => {
        if (isLocked) {
          this.showToast(
            "Predictions are locked until the Premier League kicks off",
            true,
          );
        } else {
          this.showEntryDetail(index);
        }
      });

      this.entriesList.appendChild(entryDiv);
    });
  }

  showEntryDetail(index) {
    const entry = this.entriesData[index];

    // Populate details
    document.getElementById("detailName").innerText =
      `${entry.name}'s Predictions`;
    document.getElementById("detailScorer").innerText = entry.scorer;
    document.getElementById("detailOver").innerText = entry.overAchiever;
    document.getElementById("detailUnder").innerText = entry.underAchiever;

    // Populate Table
    const tableUl = document.getElementById("detailTable");
    tableUl.innerHTML = "";
    entry.table.forEach((team, i) => {
      
      const posClass = this.getPositionClass(i); // <-- ADD THIS LINE

      const li = document.createElement("li");
      li.className = "team-item";
      li.style.cursor = "default"; // Disable drag styling in detail view
      li.innerHTML = `
        <span class="position ${posClass}">${i + 1}</span> <!-- ADD ${posClass} HERE -->
        <span class="team-name">${team}</span>
      `;
      tableUl.appendChild(li);
    });

    // Toggle Views
    document.querySelector("#allEntriesTab .card:first-child").style.display =
      "none";
    this.entryDetail.style.display = "block";
  }

  async submitPredictions() {
    const name = this.playerNameInput.value.trim();
    const email = this.playerEmailInput.value.trim(); // Capture email
    const scorer = this.topScorerInput.value.trim();
    const overAchiever = this.overSelect.value;
    const underAchiever = this.underSelect.value;

    if (!name || !scorer || !email) {
      this.showToast("Please fill in your name, email, and Golden Boot!", true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast("Please enter a valid email address.", true);
      return;
    }

    const teamItems = this.list.querySelectorAll(".team-name");
    const tablePredictions = Array.from(teamItems).map(
      (item) => item.innerText,
    );

    // Add email to payload
    const payload = {
      name: name,
      email: email,
      scorer: scorer,
      overAchiever: overAchiever,
      underAchiever: underAchiever,
      table: tablePredictions,
    };

    this.submitBtn.innerText = "Saving...";
    this.submitBtn.disabled = true;

    try {
      await fetch(this.scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      this.showToast(`Predictions saved! A copy was emailed to ${email}.`);
    } catch (error) {
      console.error("Error:", error);
      this.showToast(
        "Failed to save. Please check your internet connection.",
        true,
      );
    } finally {
      this.submitBtn.innerText = "Submit Predictions";
      this.submitBtn.disabled = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PremierLeaguePredictions();
});
