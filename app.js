async function verifyMember(idOverride) {

  let id = idOverride || document.getElementById("memberId").value;

  let response = await fetch(API_URL + "?id=" + id);
  let data = await response.json();

  let resultDiv = document.getElementById("result");

  if (!data || data.error) {
    resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found</p>";
    return;
  }

  let badge = data.status === "Active"
    ? `<img src="verify.png" class="badge-img">`
    : `<img src="cancel.png" class="badge-img">`;

  let nameIcon = data.status === "Active"
    ? ""
    : `<img src="cancel.png" width="20" style="vertical-align:middle;">`;

  let telegramButton = "";

  if (data.status === "Active") {
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

  resultDiv.innerHTML = `
    <div class="card">

      <h3>ATWOPAT MEMBER</h3>

      ${nameIcon}

      <img src="${data.photo}" width="120"><br><br>

      <b>Name:</b> ${data.name} ${badge} <br>
      <b>Role:</b> ${data.role} <br>
      <b>Member ID:</b> ${data.id} <br><br>

      <b>Registration Date:</b> ${data.timestamp} <br>
      <b>Expiry Date:</b> ${data.expiry} <br><br>

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
