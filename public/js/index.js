const checkBtns = document.querySelectorAll(".check-btn");
const deleteBtns = document.querySelectorAll(".delete-btn");

checkBtns.forEach((checkBtn) => {
  checkBtn.addEventListener("click", () => {
    // console.log(checkBtn.parentElement.firstChild);
    // currentTask = checkBtn.parentElement.firstChild.innerHTML;
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
      // const json = await response.json();
      // console.log(json);
      const loading = document.createElement("span");
      loading.classList.add("loading");
      loading.innerHTML = "...loading";
      currentTask = deleteBtn.parentElement.appendChild(loading);
      setTimeout(() => {
        window.location.href = "http://localhost:5000/";
      }, 1000);
    }

    deleteTask();
  });
});
