const form = document.querySelector("#editForm")
    form.addEventListener("change", function () {
      const updateBtn = form.querySelector("button")
      updateBtn.removeAttribute("disabled")
    })

const pwForm = document.querySelector("#editPW")
  pwForm.addEventListener("change", function () {
    const updateBtn = pwForm.querySelector("button")
    updateBtn.removeAttribute("disabled")
})