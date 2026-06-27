let requestItems = [];

function openRequestModal() {
  document.getElementById("requestModal").style.display = "block";
}

function closeRequestModal() {
  document.getElementById("requestModal").style.display = "none";
}

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
        <td>${index + 1}</td>
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

function saveRequest() {
  const requestNo = document.getElementById("requestNo").value.trim();
  const date = document.getElementById("requestDate").value;
  const department = document.getElementById("requestDepartment").value.trim();

  const fileInput = document.getElementById("requestFile");
  const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : "";

  if (!requestNo || !date || !department) {
    alert("Please fill request number, date and department");
    return;
  }

  if (requestItems.length === 0) {
    alert("Please add at least one item");
    return;
  }

  const request = {
    requestNo,
    date,
    department,
    items: [...requestItems],
    fileName,
    status: "Pending"
  };

  let requests = JSON.parse(localStorage.getItem("estock_requests")) || [];
  requests.push(request);
  localStorage.setItem("estock_requests", JSON.stringify(requests));

  alert("Request saved successfully");
  closeRequestModal();
  location.reload();
}

function loadRequests() {
  const table = document.querySelector("#requestsTable tbody");
  if (!table) return;

  table.innerHTML = "";

  const requests = JSON.parse(localStorage.getItem("estock_requests")) || [];

  requests.forEach(request => {
    let itemsHtml = "";

    if (request.items && Array.isArray(request.items)) {
      itemsHtml = request.items
        .map(item => `${item.item} (${item.qty})`)
        .join("<br>");
    } else {
      itemsHtml = request.item ? `${request.item} (${request.qty})` : "-";
    }

    table.innerHTML += `
      <tr>
        <td>${request.requestNo || "-"}</td>
        <td>${request.date || "-"}</td>
        <td>${request.department || "-"}</td>
        <td>${itemsHtml}</td>
        <td>${request.fileName || "-"}</td>
        <td>${getStatusBadge(request.status || "Pending")}</td>
<td>
  <button class="btn" onclick="approveRequest('${request.requestNo}')">Approve</button>
  <button class="btn" style="background:#dc2626;" onclick="rejectRequest('${request.requestNo}')">Reject</button>
</td>
      </tr>
    `;
  });
}

window.addEventListener("load", function () {
  loadRequests();
  loadItemSuggestions();
});
function getStatusBadge(status) {
  if (status === "Approved") {
    return '<span class="badge badge-success">Approved</span>';
  }

  if (status === "Rejected") {
    return '<span class="badge badge-danger">Rejected</span>';
  }

  return '<span class="badge">Pending</span>';
}

function approveRequest(requestNo) {
  if (!confirm("Approve this request and issue stock?")) return;

  let requests = JSON.parse(localStorage.getItem("estock_requests")) || [];
  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  let stockOut = JSON.parse(localStorage.getItem("estock_stock_out")) || [];

  const request = requests.find(r => r.requestNo === requestNo);

  if (!request) {
    alert("Request not found");
    return;
  }

  for (let reqItem of request.items) {
    const item = items.find(i => i.name === reqItem.item || i.code === reqItem.item);

    if (!item) {
      alert("Item not found: " + reqItem.item);
      return;
    }

    if (Number(item.stock) < Number(reqItem.qty)) {
      alert("Not enough stock for: " + reqItem.item);
      return;
    }
  }

  request.items.forEach(reqItem => {
    const item = items.find(i => i.name === reqItem.item || i.code === reqItem.item);

    item.stock = Number(item.stock) - Number(reqItem.qty);
    item.status = Number(item.stock) <= Number(item.minStock || 5) ? "Low" : "Available";

    stockOut.push({
      issueNo: "ISS-" + new Date().getFullYear() + "-" + String(stockOut.length + 1).padStart(4, "0"),
      date: new Date().toISOString().split("T")[0],
      department: request.department,
      itemCode: item.code,
      itemName: item.name,
      qty: Number(reqItem.qty),
      purpose: "Issued against " + request.requestNo,
      remarks: "Auto issued from approved request"
    });
  });

  request.status = "Approved";

  localStorage.setItem("estock_items", JSON.stringify(items));
  localStorage.setItem("estock_stock_out", JSON.stringify(stockOut));
  localStorage.setItem("estock_requests", JSON.stringify(requests));

  alert("Request approved and stock issued");
  location.reload();
}

function rejectRequest(requestNo) {
  updateRequestStatus(requestNo, "Rejected");
}

function updateRequestStatus(requestNo, status) {
  let requests = JSON.parse(localStorage.getItem("estock_requests")) || [];

  requests = requests.map(request => {
    if (request.requestNo === requestNo) {
      request.status = status;
    }
    return request;
  });

  localStorage.setItem("estock_requests", JSON.stringify(requests));
  location.reload();

}window.addEventListener("load", function () {
  loadRequests();
  loadItemSuggestions();
});

function loadItemSuggestions() {
  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const list = document.getElementById("stockItemsList");

  if (!list) return;

  list.innerHTML = "";

  items.forEach(item => {
    list.innerHTML += `
      <option value="${item.name}">
    `;
  });
}