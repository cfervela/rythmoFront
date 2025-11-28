// ===== LOGIN + CAPTCHA =====
let captchaId = "";

async function loadCaptcha() {
  let email = "";
  const emailInput = document.getElementById("email");
  if (emailInput) {
    email = emailInput.value.trim();
  }
  const res = await fetch("http://localhost:3000/api/captcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  captchaId = data.id;
  document.getElementById("captchaContainer").innerHTML = data.image;
}

loadCaptcha();

document.getElementById("login-btn").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const answer = document.getElementById("captchaInput").value.trim();

  if (email === "" || password === "") {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Ingresa correo y contraseña",
    });
    return;
  }

  // Petición login+captcha
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      captchaId,
      captchaAnswer: answer,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    Swal.fire({
      icon: "error",
      title: "Login fallido",
      text: data.message || "Verifica tus datos y el captcha",
    });
    loadCaptcha(); // recargar captcha si falla
    // Limpiar campos de contraseña y captcha
    document.getElementById("password").value = "";
    document.getElementById("captchaInput").value = "";
    return;
  }

  // Guardar usuario y token según "Recordarme"
  const remember = document.getElementById("rememberMe").checked;
  if (remember) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentUser", email);
    if (data.name) {
      localStorage.setItem("userName", data.name);
    }
  } else {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("currentUser", email);
    if (data.name) {
      sessionStorage.setItem("userName", data.name);
    }
  }

  Swal.fire({
    icon: "success",
    title: "Login exitoso",
    text: "Sesión iniciada como: " + (data.name || email),
  }).then(() => {
    window.location.href = "/PAGES/home.html";
  });
});

// ===============================
//    ACCESIBILIDAD POR USUARIO
// ===============================
// Usuario actual
const userId = localStorage.getItem("currentUser") || "guest";
const FONT_KEY = `fontSize_${userId}`;
const THEME_KEY = `theme_${userId}`;
// Elementos
const icon = document.getElementById("accessibility-icon");
const panel = document.getElementById("accessibility-panel");
const increaseBtn = document.getElementById("increase-text");
const decreaseBtn = document.getElementById("decrease-text");
const themeBtn = document.getElementById("toggle-theme");
const resetBtn = document.getElementById("reset-accessibility");
// Variables con valores guardados
let fontSize = parseFloat(localStorage.getItem(FONT_KEY)) || 1;
let theme = localStorage.getItem(THEME_KEY) || "light";
function applyPreferences() {
  document.body.style.fontSize = fontSize + "rem";
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}
applyPreferences();
icon.addEventListener("click", () => {
  panel.classList.toggle("hidden");
});
increaseBtn.addEventListener("click", () => {
  fontSize += 0.1;
  document.body.style.fontSize = fontSize + "rem";
  localStorage.setItem(FONT_KEY, fontSize);
});
decreaseBtn.addEventListener("click", () => {
  fontSize -= 0.1;
  if (fontSize < 0.6) fontSize = 0.6;
  document.body.style.fontSize = fontSize + "rem";
  localStorage.setItem(FONT_KEY, fontSize);
});
themeBtn.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, theme);
  applyPreferences();
});
resetBtn.addEventListener("click", () => {
  localStorage.removeItem(FONT_KEY);
  localStorage.removeItem(THEME_KEY);
  fontSize = 1;
  theme = "light";
  applyPreferences();
});
