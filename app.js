/* =========================================================
   ATWOPAT - MASTER FRONTEND SCRIPT (app.js)
   Updated: April 2026 
   Features: Robust Image Proxy, Frosted UI, & Auto-Verification
   ========================================================= */

async function verifyMember(idOverride) {
  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Please enter a Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");
  // Loading State
  resultDiv.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #0088cc; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: auto;"></div>
      <p style="color:white; font-weight:bold; margin-top:10px;">Please wait...🤸</p>
    </div>
    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  `;

  try {
    let response = await fetch(API_URL + "?action=verify&id=" + encodeURIComponent(id));
    let data = await response.json();

    if (!data || data.status === "NOT_FOUND" || data.status === "ERROR") {
      resultDiv.innerHTML = `
        <div style="background:white; padding:20px; border-radius:15px; text-align:center; color:red; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
          ❌ <b>Member Not Found</b><br>Please check the ID and try again.
        </div>`;
      return;
    }

    /* =============================================
       🚀 ULTIMATE IMAGE LINK TRANSFORMER
       Bypasses Google Drive's strict preview blocks
    ============================================= */
    let rawPhoto = data.passport || '';
    let directPhoto = "default-avatar.png"; // Failsafe local image

    if (rawPhoto) {
        let fileId = "";
        
        // Match ?id= format
        if (rawPhoto.includes("id=")) {
            fileId = rawPhoto.split("id=")[1].split("&")[0];
        } 
        // Match /d/ format
        else if (rawPhoto.match(/\/d\/(.+?)\//)) {
            fileId = rawPhoto.match(/\/d\/(.+?)\//)[1];
        }
        // Match raw ID strings
        else if (rawPhoto.length > 20 && !rawPhoto.includes("http")) {
            fileId = rawPhoto.trim();
        }

        if (fileId) {
            // This URL forces Google to serve the file as a raw image stream
            // Added a cache-buster timestamp (?t=) to ensure fresh loading
            directPhoto = `https://lh3.googleusercontent.com/d/${fileId}?t=${new Date().getTime()}`;
        } else {
            directPhoto = rawPhoto;
        }
    }

    // Prepare Member Data
    const member = {
      id: data.memberId || 'N/A',
      name: data.fullName || 'Unknown',
      state: data.state || 'N/A',
      role: data.role || 'Member',
      statusValue: data.memberStatus || 'Inactive',
      photo: directPhoto,
      qr: data.qr || '',
      expiry: data.expiry || 'N/A',
      expired: data.expired || false
    };

    // UI Logic for Status & Badges
    let currentStatus = (member.statusValue).toString().trim().toLowerCase();
    let nameBadge = ""; 
    let statusDisplay = "";
    let actionButton = "";

    if (currentStatus === "active" && !member.expired) {
      nameBadge = `<img src="verify.png" style="width:22px; height:22px; margin-left:8px;" title="Verified">`;
      statusDisplay = `<span style="color:#008000; font-weight:bold;">Active</span>`;
      actionButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0" target="_blank" style="text-decoration:none;">
          <button style="background:#0088cc; color:white; width:100%; padding:14px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:15px; transition: 0.3s;">
            Join Official Telegram
          </button>
        </a>`;
    } else {
      statusDisplay = `<span style="color:#d9534f; font-weight:bold;">${member.statusValue}</span>`;
    }

    /* =============================================
       FINAL UI OUTPUT (The Frosted Glass Card)
    ============================================= */
    resultDiv.innerHTML = `
      <div class="card" style="
        background: rgba(255, 255, 255, 0.45); 
        backdrop-filter: blur(15px); 
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2); 
        padding: 25px; 
        border-radius: 20px; 
        max-width: 350px; 
        margin: 20px auto; 
        text-align: center;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        font-family: 'Segoe UI', Tahoma, sans-serif;">
        
        <h3 style="margin: 0 0 15px 0; color:#111; letter-spacing:1.5px; font-size: 18px;">ATWOPAT MEMBER</h3>
        
        <div style="width: 150px; height: 150px; margin: 0 auto 20px; border-radius: 15px; overflow: hidden; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <img src="${member.photo}" style="width:100%; height:100%; object-fit: cover;" onerror="this.src='default-avatar.png';">
        </div>

        <div style="text-align: left; color: #111; font-size: 15px; line-height: 1.8;">
          <div style="border-bottom: 1px solid rgba(0,0,0,0.08); padding: 5px 0; display: flex; align-items: center;">
            <b style="width: 90px;">Name:</b> 
            <span style="font-weight: 700; display: flex; align-items: center;">${member.name}${nameBadge}</span>
          </div>
          <div style="border-bottom: 1px solid rgba(0,0,0,0.08); padding: 5px 0;">
            <b style="width: 90px; display: inline-block;">State:</b> <span>${member.state}</span>
          </div>
          <div style="border-bottom: 1px solid rgba(0,0,0,0.08); padding: 5px 0;">
            <b style="width: 90px; display: inline-block;">Role:</b> <span>${member.role}</span>
          </div>
          <div style="border-bottom: 1px solid rgba(0,0,0,0.08); padding: 5px 0;">
            <b style="width: 90px; display: inline-block;">Member ID:</b> <span style="font-family: monospace; font-weight: bold;">${member.id}</span>
          </div>
          <div style="border-bottom: 1px solid rgba(0,0,0,0.08); padding: 5px 0;">
            <b style="width: 90px; display: inline-block;">Status:</b> ${statusDisplay}
          </div>
          <div style="padding: 5px 0;">
            <b style="width: 90px; display: inline-block;">Expiry:</b> <span>${member.expiry}</span>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <img src="${member.qr}" style="width:110px; background:white; padding:8px; border-radius:12px; border: 1px solid #eee;">
        </div>

        ${actionButton}
      </div>
    `;

  } catch (error) {
    console.error("Verification Error:", error);
    resultDiv.innerHTML = `
      <div style="background:white; padding:15px; border-radius:10px; color:red;">
        ❌ <b>Network Error</b><br>Please check your connection and try again.
      </div>`;
  }
}
