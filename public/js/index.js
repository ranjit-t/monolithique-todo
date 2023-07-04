const checkBtns = document.querySelectorAll(".check-btn");
const deleteBtns = document.querySelectorAll(".delete-btn");

checkBtns.forEach((checkBtn) => {
  checkBtn.addEventListener("click", () => {
    currentTaskElement = checkBtn.parentElement.firstChild;
    currentTaskElement.classList.toggle("completed");
    checkBtn.innerHTML = checkBtn.innerHTML === "✓" ? "X" : "✓";
  });
});

deleteBtns.forEach((deleteBtn) => {
  deleteBtn.addEventListener("click", () => {
    currentTask = deleteBtn.parentElement.firstChild.innerHTML;

    async function deleteTask() {
      const response = await fetch("/deletetask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: currentTask }),
      });
      const loading = document.createElement("span");
      loading.classList.add("loading");
      loading.innerHTML = "...deleting";
      currentTask = deleteBtn.parentElement.appendChild(loading);
      if (response.ok) {
        window.location.href = "/";
      }
    }

    deleteTask();
  });
});
