const grid = document.getElementById("hijriGrid");
const title = document.getElementById("hijriMonthTitle");

function renderHijri() {

  const formatter = new Intl.DateTimeFormat("id-TN-u-ca-islamic", {
    month: "long",
    year: "numeric"
  });

  title.textContent = formatter.format(new Date());

  grid.innerHTML = "";

  for (let i = 1; i <= 30; i++) {

    const box = document.createElement("div");
    box.className = "hijri-day";
    box.textContent = i;

    grid.appendChild(box);
  }
}

renderHijri();
