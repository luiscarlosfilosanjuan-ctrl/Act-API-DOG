const breedSearch = document.getElementById("breedSearch");
const suggestionsEl = document.getElementById("suggestions");
const loadImagesBtn = document.getElementById("loadImages");
const imageCount = document.getElementById("imageCount");
const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

const btnLight = document.getElementById("btnLight");
const btnDark = document.getElementById("btnDark");
const btnNature = document.getElementById("btnNature");


const viewHistoryBtn = document.getElementById("viewHistory");
const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");
const closeHistory = document.getElementById("closeHistory");
const clearHistoryBtn = document.getElementById("clearHistory");

let allBreeds = [];
let debounceTimer = null;


function debounce(fn, delay = 300) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}


function saveSearchToLocalStorage(breed) {
  const now = new Date().toLocaleString();
  const key = "busquedasPerros";
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  history.push({ breed, date: now });
  localStorage.setItem(key, JSON.stringify(history));
}


function applyTheme(theme) {
  document.body.classList.remove("light", "dark", "nature");
  document.body.classList.add(theme);
  localStorage.setItem("temaSeleccionado", theme);
}

btnLight.addEventListener("click", () => applyTheme("light"));
btnDark.addEventListener("click", () => applyTheme("dark"));
btnNature.addEventListener("click", () => applyTheme("nature"));

function loadTheme() {
  const saved = localStorage.getItem("temaSeleccionado") || "light";
  applyTheme(saved);
}

async function fetchBreeds() {
  try {
    const res = await fetch("https://dog.ceo/api/breeds/list/all");
    const data = await res.json();
    allBreeds = Object.keys(data.message);
  } catch (e) {
    console.error("Error cargando razas:", e);
    allBreeds = [];
  }
}


async function showSuggestions(term) {
  suggestionsEl.innerHTML = "";
  if (!term) {
    suggestionsEl.classList.add("hidden");
    return;
  }
  const matches = allBreeds.filter(b => b.includes(term.toLowerCase()));
  if (matches.length === 0) {
    suggestionsEl.classList.add("hidden");
    return;
  }

  const limited = matches.slice(0, 8);

  for (const breed of limited) {
    const li = document.createElement("li");
    li.dataset.breed = breed;
    li.textContent = breed.replace("-", " ");
    li.addEventListener("click", () => {
      breedSearch.value = breed;
      suggestionsEl.classList.add("hidden");
      loadBreedImages(breed);
    });
    suggestionsEl.appendChild(li);
  }

  suggestionsEl.classList.remove("hidden");
}

const onInputDebounced = debounce((e) => {
  const term = e.target.value.trim();
  showSuggestions(term);
}, 220);

breedSearch.addEventListener("input", onInputDebounced);


async function loadBreedImages(breed) {
  try {
    const count = imageCount.value;
    const url = `https://dog.ceo/api/breed/${breed}/images/random/${count}`;
    const res = await fetch(url);
    const data = await res.json();
    gallery.innerHTML = "";

    data.message.forEach(imgUrl => {
      const card = document.createElement("div");
      card.className = "card";
      const imgEl = document.createElement("img");
      imgEl.src = imgUrl;
      const p = document.createElement("p");
      p.textContent = breed.replace("-", " ");

      card.appendChild(imgEl);
      card.appendChild(p);

      card.addEventListener("click", () => {
        modalImg.src = imgUrl;
        modalText.textContent = `Raza: ${breed.replace("-", " ")}`;
        modal.classList.remove("hidden");
      });

      gallery.appendChild(card);
    });

    saveSearchToLocalStorage(breed);
  } catch (err) {
    console.error("Error cargando imágenes:", err);
  }
}

loadImagesBtn.addEventListener("click", () => {
  const term = breedSearch.value.trim().toLowerCase();
  if (!term) return;
  const exact = allBreeds.find(b => b === term);
  if (exact) {
    suggestionsEl.classList.add("hidden");
    loadBreedImages(exact);
  } else {
    showSuggestions(term);
  }
});


closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});


function renderHistory() {
  const key = "busquedasPerros";
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<li>No hay búsquedas registradas.</li>";
    return;
  }
  history.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `🐾 ${entry.breed} — ${entry.date}`;
    historyList.appendChild(li);
  });
}

viewHistoryBtn.addEventListener("click", () => {
  renderHistory();
  historyModal.classList.remove("hidden");
});
closeHistory.addEventListener("click", () => historyModal.classList.add("hidden"));
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("busquedasPerros");
  renderHistory();
});

(async function init() {
  await fetchBreeds();
  loadTheme();
})();
