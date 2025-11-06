const apiKey = "633398cd39ac0d9a5db4942368703100";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherBox = document.getElementById("weatherBox");
const previsioSection = document.getElementById("previsioSection");

// 🔍 Buscar el temps actual
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      alert("Error en obtenir les dades del temps.");
      return;
    }

    mostrarTemps(data, city);
    obtenirPrevisio(city);
  } catch (error) {
    alert("Error en obtenir les dades del temps.");
  }
});

// 🌤️ Mostrar el temps actual
function mostrarTemps(data, city) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").textContent = `🌡️ ${data.main.temp.toFixed(1)} °C`;
  document.getElementById("desc").textContent = `☁️ ${data.weather[0].description}`;
  document.getElementById("humidity").textContent = `💧 Humitat: ${data.main.humidity}%`;
  weatherBox.classList.remove("hidden");

  // 💾 Guardar la ciutat a localStorage
  localStorage.setItem("ciutat", city);
}

// --- 🌦️ Previsió de 3 dies ---
async function obtenirPrevisio(city) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;

  try {
    const response = await fetch(forecastURL);
    const data = await response.json();

    if (!response.ok) {
      console.error("No s'ha pogut obtenir la previsió");
      return;
    }

    // Filtrar només una predicció per dia (al migdia)
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    // Agafar només 3 dies
    const tresDies = dailyForecasts.slice(0, 3);

    // Mostrar-los
    mostrarPrevisio(tresDies);
  } catch (error) {
    console.error("Error obtenint la previsió:", error);
  }
}

// 🗓️ Mostrar previsió
function mostrarPrevisio(dies) {
  previsioSection.innerHTML = `
    <h2>📅 Previsió 3 dies</h2>
    <div id="forecastContainer" style="display: flex; gap: 10px; justify-content: center;"></div>
  `;

  const container = document.getElementById("forecastContainer");

  dies.forEach(dia => {
    const date = new Date(dia.dt_txt);
    const options = { weekday: "long" };
    const diaSetmana = date.toLocaleDateString("ca-ES", options);

    const card = document.createElement("div");
    card.style.background = "white";
    card.style.padding = "15px";
    card.style.borderRadius = "12px";
    card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    card.style.width = "120px";
    card.innerHTML = `
      <h4>${diaSetmana}</h4>
      <p>🌡️ ${dia.main.temp.toFixed(1)} °C</p>
      <p>☁️ ${dia.weather[0].description}</p>
    `;
    container.appendChild(card);
  });
}

// 🔁 Carregar automàticament la ciutat guardada
window.addEventListener("load", () => {
  const ciutatGuardada = localStorage.getItem("ciutat");
  if (ciutatGuardada) {
    cityInput.value = ciutatGuardada;
    searchBtn.click(); // carrega automàticament el temps i previsió
  }
});

