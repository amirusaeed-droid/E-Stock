function openRequestModal() {
  document.getElementById("requestModal").style.display = "block";
}

function closeRequestModal() {
  document.getElementById("requestModal").style.display = "none";
}

function saveRequest() {
  const requestNo = document.getElementById("requestNo").value.trim();
  const date = document.getElementById("requestDate").value;
  const department = document.getElementById("requestDepartment").value.trim();
  const item = document.getElementById("requestItem").value.trim();
  const qty = document.getElementById("requestQty").value.trim();

  const fileInput = document.getElementById("requestFile");
  const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : "";

  if (!requestNo || !date || !department || !item || !qty) {
    alert("Please fill all required fields");
    return;
  }

  const request = {
    requestNo,
    date,
    department,
    item,
    qty,
    fileName,
    status: "Pending"
  };

  let requests = JSON.parse(localStorage.getItem("estock_requests")) || [];
  requests.push(request);
  localStorage.setItem("estock_requests", JSON.stringify(requests));

  alert("Request saved successfully");
  closeRequestModal();
  location.reload();
}let requestItems = [];

function addRequestItem() {
  const item = document.getElementById("requestItem").value.trim();
  const qty = document.getElementById("requestQty").value.trim();

  if (!item || !qty) {
    alert("Please enter item and quantity");
    return;
  }

  requestItems.push({ item, qty });
  renderRequestItems();

  document.getElementById("requestItem").value = "";
  document.getElementById("requestQty").value = "";
}

function renderRequestItems() {
  const table = document.querySelector("#requestItemsTable tbody");
  table.innerHTML = "";

  requestItems.forEach((row, index) => {
    table.innerHTML += `
      <tr>
        <td>${row.item}</td>
        <td>${row.qty}</td>
        <td>
          <button class="btn" style="background:#dc2626;" onclick="removeRequestItem(${index})">Remove</button>
        </td>
      </tr>
    `;
  });
}

function removeRequestItem(index) {
  requestItems.splice(index, 1);
  renderRequestItems();
}