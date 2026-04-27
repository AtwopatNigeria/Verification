async function verifyMember(idOverride) {

  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Enter Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");

  try {

    let response = await fetch(API_URL + "?id=" + encodeURIComponent(id));
    let data = await response.json();

    if (!data || data.error) {
      resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found</p>";
      return;
    }

    /* NORMALIZE STATUS */
    let status = (data.status || "").toString().trim().toLowerCase();

    let statusDisplay = "";
    let telegramButton = "";

    /* STATUS MAPPING */
    if (status === "active") {

      statusDisplay = `<img src="verify.png" class="badge-img">`;

      telegramButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0">
          <button>Join Official Telegram</button>
        </a>
      `;

    } else if (status === "pending") {

      statusDisplay = `🟡`;

      telegramButton = `
        <p style="color:red;">You can't join group</p>
        <a href="mailto:support.atwopat@gmail.com">
          <button>Contact Support</button>
        </a>
      `;

    } else if (status === "suspended") {

      statusDisplay = `🟠`;

      telegramButton = `
        <p style="color:red;">Account suspended</p>
        <a href="mailto:support.atwopat@gmail.com">
          <button>Contact Support</button>
        </a>
      `;

    } else if (status === "rejected") {

      statusDisplay = `<img src="cancel.png" class="badge-img">`;

      telegramButton = `
        <p style="color:red;">Access denied</p>
      `;

    } else {

      statusDisplay = `⚪ Unknown`;

      telegramButton = `
        <a href="mailto:support.atwopat@gmail.com">
          <button>Contact Support</button>
        </a>
      `;
    }

    /* FINAL UI */
    resultDiv.innerHTML = `
      <div class="card">

        <h3>ATWOPAT MEMBER</h3>

        <img src="${data.photo || ''}" width="120"><br><br>

        <b>Name:</b> ${data.name || 'N/A'} <br>
        <b>Role:</b> ${data.role || 'N/A'} <br>
        <b>Member ID:</b> ${data.id || 'N/A'} <br>

        <b>Status:</b> ${data.status || 'N/A'} ${statusDisplay} <br><br>

        <b>Registration Date:</b> ${data.timestamp || 'N/A'} <br>
        <b>Expiry Date:</b> ${data.expiry || 'N/A'} <br><br>

        <img src="${data.qr || ''}" width="120"><br><br>

        ${telegramButton}

      </div>
    `;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "<p style='color:red;'>❌ Error fetching member data</p>";
  }
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