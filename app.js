async function verifyMember(idOverride) {
  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Please enter a Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");
  // Show a loading message while fetching
  resultDiv.innerHTML = "<p>Searching database...</p>";

  try {
    // 1. Fetch data from Google Apps Script
    let response = await fetch(API_URL + "?action=verify&id=" + encodeURIComponent(id));
    let data = await response.json();

    console.log("API RESPONSE:", data); // DEBUG

    // 2. Check if member was actually found
    if (!data || data.status === "NOT_FOUND" || data.status === "ERROR") {
      resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found or Invalid ID</p>";
      return;
    }

    /* =========================
       🔥 MAP DATA FROM GOOGLE SCRIPT
    ========================= */
    const member = {
      id: data.memberId,
      name: data.fullName,
      state: data.state,
      role: data.role,
      statusValue: data.memberStatus, // This is "Active", "Pending", etc. from Column F
      photo: data.passport,
      qr: data.qr,
      expiry: data.expiry,
      expired: data.expired // Boolean from script
    };

    // Normalize status for the logic below
    let currentStatus = (member.statusValue || "").toString().trim().toLowerCase();
    
    let statusDisplay = "";
    let telegramButton = "";
    let cardClass = "card";

    /* =========================
       STATUS & EXPIRY LOGIC
    ========================= */

    // First check if the ID is expired
    if (member.expired) {
      statusDisplay = `❌ <span style="color:red;">EXPIRED</span>`;
      telegramButton = `<p style="color:red;">Your membership has expired. Please renew.</p>`;
    } 
    // If not expired, check the status column
    else if (currentStatus === "active") {
      statusDisplay = `<img src="verify.png" class="badge-img" style="width:20px;"> <span style="color:green;">Active</span>`;
      telegramButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0" target="_blank">
          <button style="background-color: #0088cc; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
            Join Official Telegram
          </button>
        </a>
      `;
    } else if (currentStatus === "pending") {
      statusDisplay = `🟡 <span>Pending</span>`;
      telegramButton = `
        <p style="color:orange;">Application under review.</p>
        <a href="mailto:support.atwopat@gmail.com"><button>Contact Support</button></a>
      `;
    } else if (currentStatus === "suspended") {
      statusDisplay = `🟠 <span style="color:orange;">Suspended</span>`;
      telegramButton = `<p style="color:red;">Account suspended. Contact administration.</p>`;
    } else {
      statusDisplay = `⚪ <span>${member.statusValue || 'Unknown'}</span>`;
      telegramButton = `<a href="mailto:support.atwopat@gmail.com"><button>Contact Support</button></a>`;
    }

    /* =========================
       FINAL OUTPUT
    ========================= */
    resultDiv.innerHTML = `
      <div class="${cardClass}" style="border: 1px solid #ccc; padding: 20px; border-radius: 10px; text-align: center; max-width: 350px; margin: auto;">
        <h3 style="margin-top:0;">ATWOPAT MEMBER</h3>
        
        <img src="${member.photo || 'default-avatar.png'}" width="120" style="border-radius: 5px; border: 2px solid #eee;"><br><br>

        <div style="text-align: left; line-height: 1.6;">
          <b>Name:</b> ${member.name} <br>
          <b>State:</b> ${member.state} <br>
          <b>Role:</b> ${member.role} <br>
          <b>Member ID:</b> ${member.id} <br>
          <b>Status:</b> ${statusDisplay} <br>
          <b>Expiry:</b> ${member.expiry || 'N/A'}
        </div>

        <br>
        <img src="${member.qr || ''}" width="100"><br><br>

        ${telegramButton}
      </div>
    `;

  } catch (error) {
    console.error("Fetch Error:", error);
    resultDiv.innerHTML = "<p style='color:red;'>❌ Connection Error. Please try again.</p>";
  }
}
