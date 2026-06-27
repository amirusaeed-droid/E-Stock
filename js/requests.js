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
  if (!table) return;

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

window.addEventListener("load", loadRequests);
setTimeout(loadRequests, 500);
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
  updateRequestStatus(requestNo, "Approved");
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
}