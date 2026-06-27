function openRequestModal() {
  const modal = document.getElementById("requestModal");
  if (modal) modal.style.display = "block";
}

function closeRequestModal() {
  const modal = document.getElementById("requestModal");
  if (modal) modal.style.display = "none";
}function saveRequest() {

  const requestNo = document.getElementById("requestNo").value;
  const date = document.getElementById("requestDate").value;
  const department = document.getElementById("requestDepartment").value;
  const item = document.getElementById("requestItem").value;
  const qty = document.getElementById("requestQty").value;

  if (!requestNo || !date || !department || !item || !qty) {
    alert("Please fill all fields");
    return;
  }

  const request = {
    requestNo,
    date,
    department,
    item,
    qty,
    status: "Pending"
  };

  let requests =
    JSON.parse(localStorage.getItem("estock_requests")) || [];

  requests.push(request);

  localStorage.setItem(
    "estock_requests",
    JSON.stringify(requests)
  );

  alert("Request Saved");

  closeRequestModal();
}