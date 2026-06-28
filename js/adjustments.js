function openAdjustmentModal() {
  document.getElementById("adjustmentModal").style.display = "block";

  const adjustments = JSON.parse(localStorage.getItem("estock_adjustments")) || [];
  document.getElementById("adjustmentNo").value =
    "ADJ-" + new Date().getFullYear() + "-" + String(adjustments.length + 1).padStart(4, "0");

  document.getElementById("adjustmentDate").value =
    new Date().toISOString().split("T")[0];

  loadAdjustmentItems();
}

function loadAdjustmentItems() {
  const select = document.getElementById("adjustmentItem");
  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  if (!select) return;

  select.innerHTML = `<option value="">Select Item</option>`;

  items.forEach(item => {
    select.innerHTML += `
      <option value="${item.code}">
        ${item.code} - ${item.name} | Stock: ${item.stock}
      </option>
    `;
  });
}

function showCurrentStock() {
  const itemCode = document.getElementById("adjustmentItem").value;
  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  const item = items.find(i => i.code === itemCode);

  document.getElementById("adjustmentOldStock").value = item ? item.stock : "";
}

function saveAdjustment() {
  const adjustmentNo = document.getElementById("adjustmentNo").value;
  const date = document.getElementById("adjustmentDate").value;
  const itemCode = document.getElementById("adjustmentItem").value;
  const oldStock = Number(document.getElementById("adjustmentOldStock").value);
  const newStock = Number(document.getElementById("adjustmentNewStock").value);
  const reason = document.getElementById("adjustmentReason").value;
  const remarks = document.getElementById("adjustmentRemarks").value;

  if (!adjustmentNo || !date || !itemCode || reason === "" || isNaN(newStock)) {
    alert("Please fill all required fields");
    return;
  }

  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const item = items.find(i => i.code === itemCode);

  if (!item) {
    alert("Item not found");
    return;
  }

  const difference = newStock - oldStock;

  item.stock = newStock;
  item.status = newStock <= Number(item.minStock || 5) ? "Low" : "Available";

  const adjustment = {
    adjustmentNo,
    date,
    itemCode: item.code,
    itemName: item.name,
    oldStock,
    newStock,
    difference,
    reason,
    remarks
  };

  let adjustments = JSON.parse(localStorage.getItem("estock_adjustments")) || [];
  adjustments.push(adjustment);

  localStorage.setItem("estock_items", JSON.stringify(items));
  localStorage.setItem("estock_adjustments", JSON.stringify(adjustments));

  alert("Stock adjustment saved successfully");
  location.reload();
}

function loadAdjustments() {
  const table = document.querySelector("#adjustmentsTable tbody");
  if (!table) return;

  table.innerHTML = "";

  const adjustments = JSON.parse(localStorage.getItem("estock_adjustments")) || [];

  adjustments.forEach(adj => {
    table.innerHTML += `
      <tr>
        <td>${adj.adjustmentNo}</td>
        <td>${adj.date}</td>
        <td>${adj.itemCode} - ${adj.itemName}</td>
        <td>${adj.oldStock}</td>
        <td>${adj.newStock}</td>
        <td>${adj.difference}</td>
        <td>${adj.reason}</td>
      </tr>
    `;
  });
}

window.addEventListener("load", function () {
  loadAdjustments();
});