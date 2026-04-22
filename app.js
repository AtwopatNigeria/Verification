async function verifyMember(idOverride) {

  let id = idOverride || document.getElementById("memberId").value;

  let response = await fetch(API_URL + "?id=" + id);
  let data = await response.json();

  let resultDiv = document.getElementById("result");

  if (!data || data.error) {
    resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found</p>";
    return;
  }

  /* NORMALIZE STATUS */
  let status = (data.status || "").toString().trim().toLowerCase();

  let statusDisplay = "";

  /* STATUS MAPPING */
  if (status === "active") {
    statusDisplay = `<img src="verify.png" class="badge-img">`;

  } else if (status === "pending") {
    statusDisplay = `🟡`;

  } else if (status === "suspended") {
    statusDisplay = `🟠`;

  } else if (status === "rejected") {
    statusDisplay = `<img src="cancel.png" class="badge-img">`;

  } else {
    statusDisplay = `⚪ Unknown`;
  }

  /* TELEGRAM LOGIC */
  let telegramButton = "";

  if (status === "active") {
    telegramButton = `
      <a href="https://t.me/+0qCgEbssFKw3ZmM0">
        <button>Join Official Telegram</button>
      </a>
    `;
  } else {
    telegramButton = `
      <p style="color:red;">You can't join group</p>
      <a href="mailto:support.atwopat@gmail.com">
        <button>Contact Support</button>
      </a>
    `;
  }

  /* FINAL UI */
  resultDiv.innerHTML = `
    <div class="card">

      <h3>ATWOPAT MEMBER</h3>

      <!-- PASSPORT PHOTO -->
      <img src="${data.photo}" width="120"><br><br>

      <!-- NAME + BADGE -->
      <b>Name:</b> ${data.name} ${statusDisplay} <br>

      <!-- ROLE -->
      <b>Role:</b> ${data.role} <br>

      <!-- MEMBER ID -->
      <b>Member ID:</b> ${data.id} <br>

      <!-- STATUS -->
      <b>Status:</b> ${data.status} <br><br>

      <!-- REGISTRATION DATE -->
      <b>Registration Date:</b> ${data.timestamp} <br>

      <!-- EXPIRY DATE -->
      <b>Expiry Date:</b> ${data.expiry} <br><br>

      <!-- QR CODE -->
      <img src="${data.qr}" width="120"><br><br>

      ${telegramButton}

    </div>
  `;
}

/* QR SCANNER */
function startScanner() {
  const scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (text) => {
      try {
        let url = new URL(text);
        let id = url.searchParams.get("id");

        if (id) {
          verifyMember(id);
          scanner.stop();
        }
      } catch (e) {
        alert("Invalid QR");
      }
    }
  );
}