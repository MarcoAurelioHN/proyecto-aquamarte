const username = document.getElementById("username");
const password = document.getElementById("password");
const button = document.getElementById("button");

button.addEventListener("click", (e) => {
  e.preventDefault();
  const data = {
    username: username.value,
    password: password.value,
  };
  console.log(data);
});

document.getElementById("admin").addEventListener("click", () => {
  window.location.href = "./indexm.html";
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      console.log("Data from server:", data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});