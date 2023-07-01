const logoutBtn = document.querySelector(".logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    console.log("loggin out");
    await fetch("/logout", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });
    window.location.href = "/";
  });
}
