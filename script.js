const apiKey = "633398cd39ac0d9a5db4942368703100";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherBox = document.getElementById("weatherBox");
const previsioSection = document.getElementById("previsioSection");

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  try {
    // --- Temps actual ---
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      alert("Error en obtenir les dades del temps.");
      return;
    }

    // --- Previsió (també usada per estimar pluja diària) ---
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastURL);
    const forecastData = await forecastResponse.json();

    const precipitacioDia = calcularPlujaDiaria(forecastData.list);

    mostrarTemps(data, city, precipitacioDia);
    obtenirPrevisio(city);
  } catch (error) {
    alert("Error en obtenir les dades del temps.");
    console.error(error);
  }
});

function calcularPlujaDiaria(list) {
  // Suma la precipitació (rain.3h) de les últimes 24 hores
  const ara = Date.now();
  const fa24h = ara - 24 * 60 * 60 * 1000;

  const acumulada = list
    .filter(item => {
      const dt = item.dt * 1000;
      return dt > fa24h && dt <= ara;
    })
    .reduce((sum, item) => sum + (item.rain?.["3h"] || 0), 0);

  return acumulada.toFixed(1);
}

function mostrarTemps(data, city, precipitacioDia) {
  const rafega = data.wind?.gust ? `${data.wind.gust.toFixed(1)} km/h` : "—";

  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").innerHTML = `
    🌡️ ${data.main.temp.toFixed(1)} °C<br>
    🔺 Max: ${data.main.temp_max.toFixed(1)} °C | 🔻 Min: ${data.main.temp_min.toFixed(1)} °C
  `;
  document.getElementById("desc").textContent = `☁️ ${data.weather[0].description}`;
  document.getElementById("humidity").innerHTML = `
    💧 Humitat: ${data.main.humidity}%<br>
    🌧️ Precipitació acumulada (24h): ${precipitacioDia} mm<br>
    🌬️ Vent: ${data.wind.speed.toFixed(1)} km/h | Ràfega: ${rafega}
  `;

  weatherBox.classList.remove("hidden");
  localStorage.setItem("ciutat", city);
}

// --- Previsió 3 dies ---
async function obtenirPrevisio(city) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;

  try {
    const response = await fetch(forecastURL);
    const data = await response.json();

    if (!response.ok) {
      console.error("No s'ha pogut obtenir la previsió");
      return;
    }

    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    const tresDies = dailyForecasts.slice(0, 3);

    mostrarPrevisio(tresDies);
  } catch (error) {
    console.error("Error obtenint la previsió:", error);
  }
}

function mostrarPrevisio(dies) {
  previsioSection.innerHTML = `
    <h2>📅 Previsió 3 dies</h2>
    <div id="forecastContainer" style="display: flex; gap: 10px; justify-content: center;"></div>
  `;

  const container = document.getElementById("forecastContainer");

  dies.forEach(dia => {
    const date = new Date(dia.dt_txt);
    const diaSetmana = date.toLocaleDateString("ca-ES", { weekday: "long" });

    const card = document.createElement("div");
    card.style.background = "white";
    card.style.padding = "15px";
    card.style.borderRadius = "12px";
    card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    card.style.width = "140px";

    card.innerHTML = `
      <h4>${diaSetmana}</h4>
      <img src="https://openweathermap.org/img/wn/${dia.weather[0].icon}@2x.png" alt="">
      <p><strong>${dia.main.temp.toFixed(1)} °C</strong></p>
      <p>${dia.weather[0].description}</p>
    `;
    container.appendChild(card);
  });
}

// Carregar automàticament la ciutat guardada
window.addEventListener("load", () => {
  const ciutatGuardada = localStorage.getItem("ciutat");
  if (ciutatGuardada) {
    cityInput.value = ciutatGuardada;
    searchBtn.click();
  }
});


