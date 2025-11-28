// ===== REGISTRO DE USUARIO =====
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".register-form form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm
      .querySelector('input[type="email"]')
      .value.trim();
    const password = registerForm.querySelector('input[type="password"]').value;
    const country = registerForm.querySelector("select#country").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, country }),
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Tu cuenta ha sido creada correctamente.",
          confirmButtonText: "Continuar",
        }).then(() => {
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          // Guardar el nombre del usuario
          localStorage.setItem("userName", name);
          // Guardar el usuario actual
          localStorage.setItem("currentUser", name);
          registerForm.reset();
          window.location.href = "/PAGES/home.html";
        });
      } else {
        alert(data.message || "Error al registrar el usuario");
        // Si el usuario ya existe, limpiar email y contraseña
        if (
          data.message &&
          data.message.toLowerCase().includes("usuario ya existe")
        ) {
          registerForm.querySelector('input[type="email"]').value = "";
          registerForm.querySelector('input[type="password"]').value = "";
        }
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  });
});
