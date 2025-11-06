const apiKey = "633398cd39ac0d9a5db4942368703100";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherBox = document.getElementById("weatherBox");

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},ES&units=metric&lang=ca&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      alert("Ciutat no trobada. Torna-ho a intentar!");
      return;
    }

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temp").textContent = `🌡️ ${data.main.temp.toFixed(1)} °C`;
    document.getElementById("desc").textContent = `☁️ ${data.weather[0].description}`;
    document.getElementById("humidity").textContent = `💧 Humitat: ${data.main.humidity}%`;

    weatherBox.classList.remove("hidden");
  } catch (error) {
    alert("Error en obtenir les dades del temps.");
  }
});
