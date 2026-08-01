class PremierLeaguePredictions {
  constructor() {
    // 1. App State & Config
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
      "https://script.google.com/macros/s/AKfycbw2k8sOZgYWQhaz1EbeBc-YIuAUse53cKR-dn4JwnjEYcKQEG1i0KVbsMQc5bDcDz7PUg/exec";
      
    // 2. DOM Elements
    this.list = document.getElementById("sortableList");
    this.overSelect = document.getElementById("overAchiever");
    this.underSelect = document.getElementById("underAchiever");
    this.submitBtn = document.querySelector("button");
    this.playerNameInput = document.getElementById("playerName");
    this.topScorerInput = document.getElementById("topScorer");

    // 3. Boot the App
    this.init();
  }

  init() {
    this.populateDropdowns();
    this.renderList();
    this.attachEventListeners();
  }

  populateDropdowns() {
    this.teams.forEach((team) => {
      this.overSelect.add(new Option(team, team));
      this.underSelect.add(new Option(team, team));
    });
  }

  renderList() {
    this.list.innerHTML = "";
    this.teams.forEach((team, index) => {
      const li = document.createElement("li");
      li.className = "team-item";
      li.draggable = true;
      li.innerHTML = `<span class="position">${index + 1}</span> <span>${team}</span>`;

      // Drag events for individual items
      li.addEventListener("dragstart", () => li.classList.add("dragging"));
      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        this.updatePositions();
      });

      this.list.appendChild(li);
    });
  }

  attachEventListeners() {
    // Handle the sorting logic over the list container
    this.list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(this.list, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        this.list.appendChild(draggable);
      } else {
        this.list.insertBefore(draggable, afterElement);
      }
    });

    // Attach click listener to the submit button
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevents default form submission if wrapped in a form later
        this.submitPredictions();
      });
    }
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".team-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }

  updatePositions() {
    const items = this.list.querySelectorAll(".team-item");
    items.forEach((item, index) => {
      item.querySelector(".position").innerText = index + 1;
    });
  }

  async submitPredictions() {
    const name = this.playerNameInput.value.trim();
    const scorer = this.topScorerInput.value.trim();
    const overAchiever = this.overSelect.value;
    const underAchiever = this.underSelect.value;

    if (!name || !scorer) {
      alert("Please fill in your name and Golden Boot prediction!");
      return;
    }

    // Extract the final 1-20 list from the DOM
    const teamItems = this.list.querySelectorAll(
      ".team-item span:nth-child(2)",
    );
    const tablePredictions = Array.from(teamItems).map(
      (item) => item.innerText,
    );

    const payload = {
      name: name,
      scorer: scorer,
      overAchiever: overAchiever,
      underAchiever: underAchiever,
      table: tablePredictions,
    };

    // Update UI to show saving state
    this.submitBtn.innerText = "Saving...";
    this.submitBtn.disabled = true;

    try {
      await fetch(this.scriptURL, {
        method: "POST",
        mode: "no-cors", // Bypasses Google Apps Script CORS redirects
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      alert(`Predictions for ${name} saved successfully!`);
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Failed to save to Google Sheets. Please check your internet connection or URL.",
      );
    } finally {
      // Reset UI state
      this.submitBtn.innerText = "Submit Predictions";
      this.submitBtn.disabled = false;
    }
  }
}

// Instantiate the class once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new PremierLeaguePredictions();
});
