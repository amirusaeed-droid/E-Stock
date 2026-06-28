let requestItems = [];

function openRequestModal() {
  document.getElementById("requestModal").style.display = "block";

  const requests = JSON.parse(localStorage.getItem("estock_requests")) || [];
  document.getElementById("requestNo").value =
    "REQ-" + new Date().getFullYear() + "-" + String(requests.length + 1).padStart(4, "0");

  document.getElementById("requestDate").value = new Date().toISOString().split("T")[0];

  requestItems = [];
  renderRequestItems();
  loadItemSuggestions();
}

function closeRequestModal() {
  document.getElementById("requestModal").style.display = "none";
}

function loadItemSuggestions() {
  const list = document.getElementById("stockItemsList");
  if (!list) return;

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  list.innerHTML = "";

  items.forEach(item => {
    list.innerHTML += `<option value="${item.name}" label="${item.code} - ${item.name} | Balance: ${item.stock}"></option>`;
  });
}

function addRequestItem() {
  const itemInput = document.getElementById("requestItem");
  const qtyInput = document.getElementById("requestQty");

  const itemName = itemInput.value.trim();
  const qty = qtyInput.value.trim();

  if (!itemName || !qty) {
    alert("Please select item and enter quantity");
    return;
  }

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const foundItem = items.find(i => i.name === itemName || i.code === itemName);

  if (!foundItem) {
    alert("This item is not found in Items list. Please add the item first.");
    return;
  }

  requestItems.push({
    item: foundItem.name,
    code: foundItem.code,
    qty: Number(qty)
  });

  renderRequestItems();

  itemInput.value = "";
  qtyInput.value = "";
}

function renderRequestItems() {
  const table = document.querySelector("#requestItemsTable tbody");
  if (!table) return;

  table.innerHTML = "";

  requestItems.forEach((row, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${row.code}</td>
        <td>${row.item}</td>
        <td>${row.qty}</td>
        <td>
          <button class="btn" type="button" style="background:#dc2626;" onclick="removeRequestItem(${index})">Remove</button>
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
  const department = document.getElementById("requestDepartment").value;

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
        .map(item => `${item.code || ""} ${item.item} (${item.qty})`)
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

        <td>
          ${request.fileName || "-"}<br>
          <input type="file"
                 accept=".pdf,.jpg,.jpeg,.png"
                 onchange="uploadRequestForm('${request.requestNo}', this)"
                 style="width:160px;">
        </td>

        <td>${getStatusBadge(request.status || "Pending")}</td>

<td>
  <button class="btn" type="button" onclick="approveRequest('${request.requestNo}')">Approve</button>

  <button class="btn" type="button"
          style="background:#f59e0b;"
          onclick="issueRequest('${request.requestNo}')">
    Issue
  </button>

  <button class="btn" type="button"
          style="background:#16a34a;"
          onclick="completeRequest('${request.requestNo}')">
    Complete
  </button>

  <button class="btn" type="button"
          style="background:#dc2626;"
          onclick="rejectRequest('${request.requestNo}')">
    Reject
  </button>

  <button class="btn" type="button"
          style="background:#2563eb;"
          onclick="printRequest('${request.requestNo}')">
    Print
  </button>
</td>
    `;
  });
}

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

  if (request.status === "Approved") {
    alert("This request is already approved");
    return;
  }

  for (const reqItem of request.items) {
    const item = items.find(i => i.name === reqItem.item || i.code === reqItem.code);

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
    const item = items.find(i => i.name === reqItem.item || i.code === reqItem.code);

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
function issueRequest(requestNo) {
  updateRequestStatus(requestNo, "Issued");
}

function completeRequest(requestNo) {
  updateRequestStatus(requestNo, "Completed");
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

window.addEventListener("load", function () {
  loadRequests();
  loadItemSuggestions();
});
function addRequestItem() {
  const itemName = document.getElementById("requestItem").value.trim();
  const qty = document.getElementById("requestQty").value.trim();

  if (!itemName || !qty) {
    alert("Please select item and enter quantity");
    return;
  }

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const foundItem = items.find(i => i.name === itemName || i.code === itemName);

  if (!foundItem) {
    alert("Item not found in Items list");
    return;
  }

  requestItems.push({
    code: foundItem.code,
    item: foundItem.name,
    qty: Number(qty)
  });

  renderRequestItems();

  document.getElementById("requestItem").value = "";
  document.getElementById("requestQty").value = "";
}
function uploadRequestForm(requestNo, input) {
  const file = input.files[0];
  if (!file) return;

  let requests = JSON.parse(localStorage.getItem("estock_requests")) || [];

  requests = requests.map(request => {
    if (request.requestNo === requestNo) {
      request.fileName = file.name;
    }
    return request;
  });

  localStorage.setItem("estock_requests", JSON.stringify(requests));

  alert("Request form uploaded");
  location.reload();
}
function printRequest(requestNo) {

  const requests = JSON.parse(localStorage.getItem("estock_requests")) || [];
  const request = requests.find(r => r.requestNo === requestNo);

  if (!request) {
    alert("Request not found");
    return;
  }

  const itemsHtml = request.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${request.date}</td>
      <td>${item.item}</td>
      <td>${item.code || "-"}</td>
      <td></td>
      <td>${item.qty}</td>
    </tr>
  `).join("");

  const win = window.open("", "_blank");

  win.document.write(`
  <html>
  <head>
    <title>Services & Goods Requisition Form</title>

    <style>
      body{
        font-family:Arial,sans-serif;
        margin:20px;
        color:#000;
      }

      h2,h3{
        text-align:center;
        margin:3px;
      }

      .info{
        margin-top:15px;
        margin-bottom:15px;
      }

      .info div{
        margin-bottom:5px;
      }

      table{
        width:100%;
        border-collapse:collapse;
      }

      th,td{
        border:1px solid #000;
        padding:6px;
        font-size:12px;
      }

      th{
        background:#f3f4f6;
      }

      .signatures{
        margin-top:30px;
      }

      .signatures td{
        height:45px;
      }

      .footer{
        text-align:center;
        margin-top:20px;
        font-size:11px;
      }
    </style>

  </head>

  <body>

    <h2>Secretariat of Kondey Council</h2>
    <h3>Services & Goods Requisition Form</h3>

    <div class="info">
      <div><strong>Request No:</strong> ${request.requestNo}</div>
      <div><strong>Date:</strong> ${request.date}</div>
      <div><strong>Department:</strong> ${request.department}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Remarks</th>
          <th>Request Date</th>
          <th>Item Name</th>
          <th>Item Code</th>
          <th>Issued Qty</th>
          <th>Requested Qty</th>
        </tr>
      </thead>

      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table class="signatures">
      <thead>
        <tr>
          <th>Date</th>
          <th>Signature</th>
          <th>Name</th>
          <th>Function</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td>Requested By</td>
        </tr>

        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td>Authorised By</td>
        </tr>

        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td>Issued By</td>
        </tr>

        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td>Goods Received By</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px;">
      <strong>General Remarks:</strong>
      <br><br><br>
    </div>

    <div class="footer">
      Developed by Amir Saeed
    </div>

  </body>
  </html>
  `);

  win.document.close();
  win.print();
}