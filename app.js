async function verifyMember(idOverride) {
  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Please enter a Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p style='color:white; font-weight:bold;'>Please wait...</p>";

  try {
    let response = await fetch(API_URL + "?action=verify&id=" + encodeURIComponent(id));
    let data = await response.json();

    if (!data || data.status === "NOT_FOUND" || data.status === "ERROR") {
      resultDiv.innerHTML = "<p style='color:red; background:white; padding:10px; border-radius:5px;'>❌ Member not found</p>";
      return;
    }

    /* =============================================
       🔥 UPGRADED IMAGE LINK TRANSFORMER
       Captures both ?id= format and /d/ format
    ============================================= */
    let rawPhoto = data.passport || '';
    let directPhoto = "default-avatar.png"; // Failsafe image

    if (rawPhoto.includes("drive.google.com")) {
        let fileId = "";
        
        // 1. Check for the ?id= format
        if (rawPhoto.includes("id=")) {
            fileId = rawPhoto.split("id=")[1].split("&")[0];
        } 
        // 2. Check for the /file/d/ format
        else if (rawPhoto.match(/\/d\/(.+?)\//)) {
            fileId = rawPhoto.match(/\/d\/(.+?)\//)[1];
        }

        // 3. Build the highly reliable direct display URL
        if (fileId) {
            directPhoto = `https://drive.google.com/uc?export=view&id=${fileId}`;
        } else {
            directPhoto = rawPhoto;
        }
    } else if (rawPhoto) {
        directPhoto = rawPhoto;
    }

    const member = {
      id: data.memberId,
      name: data.fullName,
      state: data.state,
      role: data.role,
      statusValue: data.memberStatus,
      photo: directPhoto,
      qr: data.qr,
      expiry: data.expiry,
      expired: data.expired
    };

    let currentStatus = (member.statusValue || "").toString().trim().toLowerCase();
    let nameBadge = ""; 
    let statusText = "";
    let telegramButton = "";

    if (currentStatus === "active" && !member.expired) {
      nameBadge = `<img src="verify.png" style="width:24px; height:24px; margin-left: 8px;">`;
      statusText = `<span style="color:#008000; font-weight:bold;">Active</span>`;
      telegramButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0" target="_blank" style="text-decoration:none;">
          <button style="background:#0088cc; color:white; width:100%; padding:14px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:15px;">
            Join Official Telegram
          </button>
        </a>`;
    } else {
      statusText = `<span style="font-weight:bold;">${member.statusValue || 'N/A'}</span>`;
    }

    /* =============================================
       FINAL UI OUTPUT (Frosted Glass Design)
    ============================================= */
    resultDiv.innerHTML = `
      <div class="card" style="
        background: rgba(255, 255, 255, 0.45); 
        backdrop-filter: blur(15px); 
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2); 
        padding: 25px; 
        border-radius: 20px; 
        max-width: 340px; 
        margin: auto; 
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        font-family: sans-serif;">
        
        <h3 style="margin: 0 0 15px 0; color:#111; letter-spacing:1px;">ATWOPAT MEMBER</h3>
        
        <img src="${member.photo}" width="140" height="140" style="border-radius: 15px; border: 3px solid rgba(255,255,255,0.8); object-fit: cover; margin-bottom: 20px;">

        <div style="text-align: left; color: #000; font-size: 16px;">
          
          <div style="display: flex; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;">
            <b style="min-width: 65px;">Name:</b>
            <span style="display: flex; align-items: center; font-weight: 600;">
              ${member.name}${nameBadge}
            </span>
          </div>

          <p style="margin: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;"><b>State:</b> ${member.state}</p>
          <p style="margin: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;"><b>Role:</b> ${member.role}</p>
          <p style="margin: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;"><b>Member ID:</b> ${member.id}</p>
          <p style="margin: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;"><b>Status:</b> ${statusText}</p>
          <p style="margin: 8px 0;"><b>Expiry:</b> ${member.expiry || 'N/A'}</p>
        </div>

        <div style="margin: 20px 0;">
          <img src="${member.qr || ''}" width="110" style="background:white; padding:8px; border-radius:10px; border:1px solid #ddd;">
        </div>

        ${telegramButton}
      </div>
    `;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "<p style='color:red; background:white;'>❌ Connection error.</p>";
  }
}
