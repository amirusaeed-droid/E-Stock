function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "admin" && pass === "admin123") {
    window.location.href = "dashboard.html";
  } else {
    alert("Wrong username or password");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
