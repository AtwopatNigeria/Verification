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

    console.log("API RESPONSE:", data); // DEBUG (important)

    if (!data || data.status === "NOT_FOUND") {
      resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found</p>";
      return;
    }

    /* =========================
       🔥 NORMALIZE API DATA
    ========================= */

    const member = {
      id: data.memberId,
      name: data.fullName,
      state: data.state,
      role: data.role,
      statusRaw: data.memberStatus || data.status,
      photo: data.passport,
      qr: data.qr,
      expiry: data.expiry,
      expired: data.expired
    };

    let status = (member.statusRaw || "").toString().trim().toLowerCase();

    let statusDisplay = "";
    let telegramButton = "";

    /* =========================
       STATUS LOGIC (IMPROVED)
    ========================= */

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

    /* =========================
       FINAL OUTPUT
    ========================= */

    resultDiv.innerHTML = `
      <div class="card">

        <h3>ATWOPAT MEMBER</h3>

        <img src="${member.photo || ''}" width="120"><br><br>

        <b>Name:</b> ${member.name || 'N/A'} <br>
        <b>State:</b> ${member.state || 'N/A'} <br>
        <b>Role:</b> ${member.role || 'N/A'} <br>

        <b>Member ID:</b> ${member.id || 'N/A'} <br>

        <b>Status:</b> ${data.status || 'N/A'} ${statusDisplay} <br><br>

        <b>Expiry Date:</b> ${member.expiry || 'N/A'} <br><br>

        <img src="${member.qr || ''}" width="120"><br><br>

        ${telegramButton}

      </div>
    `;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "<p style='color:red;'>❌ Error fetching member data</p>";
  }
}