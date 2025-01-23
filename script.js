// Ticket prices and configuration
const TICKET_PRICES = {
  adult: 30,
  child: 15,
  senior: 20,
  family: 75,
};

const TICKET_COLORS = {
  adult: "#10B981",
  child: "#8B5CF6",
  senior: "#3B82F6",
  family: "#EC4899",
};

// Helper Functions
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateTicketId() {
  return (
    "TKT-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).substring(2, 7).toUpperCase()
  );
}

function calculateValidity(purchaseDate) {
  const validityDate = new Date(purchaseDate);
  validityDate.setMonth(validityDate.getMonth() + 3);
  return validityDate;
}

// Modal Functions
function showModal() {
  document.getElementById("ticketModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("ticketModal").style.display = "none";
  document.getElementById("qrcode").innerHTML = "";
}

// Generate QR Code
function generateQRCode(data) {
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: JSON.stringify(data),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

// Create and style ticket canvas
function createTicketCanvas(ticketData) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 450;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ticket border
  ctx.strokeStyle = TICKET_COLORS[ticketData.ticketType];
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Decorative pattern
  const pattern = ctx.createLinearGradient(0, 0, canvas.width, 0);
  pattern.addColorStop(0, `${TICKET_COLORS[ticketData.ticketType]}22`);
  pattern.addColorStop(0.5, `${TICKET_COLORS[ticketData.ticketType]}11`);
  pattern.addColorStop(1, `${TICKET_COLORS[ticketData.ticketType]}22`);
  ctx.fillStyle = pattern;
  ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Zoo Logo and Header
  ctx.fillStyle = TICKET_COLORS[ticketData.ticketType];
  ctx.font = "bold 48px Arial";
  ctx.fillText("🦁 WildLife Zoo", 40, 70);

  // Ticket Type Banner
  ctx.fillStyle = TICKET_COLORS[ticketData.ticketType];
  ctx.fillRect(40, 90, 300, 40);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.fillText(ticketData.ticketType.toUpperCase() + " TICKET", 50, 120);

  // Main ticket information
  ctx.fillStyle = "#1F2937";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Ticket ID: " + ticketData.ticketId, 40, 160);

  ctx.font = "20px Arial";
  const infoStartY = 200;
  const lineHeight = 35;

  ctx.fillText(`Name: ${ticketData.name}`, 40, infoStartY);
  ctx.fillText(`Age: ${ticketData.age}`, 40, infoStartY + lineHeight);
  ctx.fillText(`Gender: ${ticketData.gender}`, 40, infoStartY + lineHeight * 2);
  ctx.fillText(
    `Price: CHF${ticketData.price}`,
    40,
    infoStartY + lineHeight * 3
  );

  ctx.fillText(
    `Visit Date: ${formatDate(ticketData.visitDate)}`,
    40,
    infoStartY + lineHeight * 4
  );
  ctx.fillText(
    `Valid Until: ${formatDate(ticketData.validUntil)}`,
    40,
    infoStartY + lineHeight * 5
  );

  // QR Code placeholder (right side)
  ctx.strokeStyle = "#E5E7EB";
  ctx.strokeRect(canvas.width - 260, 40, 220, 220);

  return canvas;
}

// Create downloadable ticket
function createDownloadableTicket(ticketData) {
  const canvas = createTicketCanvas(ticketData);

  // Add QR code to canvas
  const qrImage = document.querySelector("#qrcode img");
  if (qrImage) {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(qrImage, canvas.width - 240, 60, 180, 180);
  }

  // Create download button
  const downloadBtn = document.createElement("a");
  downloadBtn.href = canvas.toDataURL("image/png");
  downloadBtn.download = `zoo-ticket-${ticketData.ticketId}.png`;
  downloadBtn.className = "download-button";
  downloadBtn.innerHTML = "⬇️ Download Ticket";

  // Add button to modal
  const modalContent = document.querySelector(".modal-content");
  const existingBtn = modalContent.querySelector(".download-button");
  if (existingBtn) {
    existingBtn.remove();
  }
  modalContent.insertBefore(
    downloadBtn,
    document.querySelector(".close-modal")
  );

  // Display ticket preview
  const ticketPreview = document.getElementById("ticketPreview");
  ticketPreview.innerHTML = "";
  ticketPreview.appendChild(canvas);
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  canvas.style.borderRadius = "10px";
  canvas.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
}

// Handle form submission
document.getElementById("ticketForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const ticketData = {
    ticketId: generateTicketId(),
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    ticketType: document.querySelector('input[name="ticketType"]:checked')
      .value,
    price:
      TICKET_PRICES[
        document.querySelector('input[name="ticketType"]:checked').value
      ],
    visitDate: document.getElementById("visitDate").value,
    purchaseDate: new Date().toISOString(),
    validUntil: calculateValidity(new Date()).toISOString(),
  };

  // Generate QR code first
  generateQRCode(ticketData);

  // Wait a bit for QR code to generate
  setTimeout(() => {
    createDownloadableTicket(ticketData);
    showModal();
  }, 100);
});

// Modal and form event listeners
window.addEventListener("click", function (e) {
  const modal = document.getElementById("ticketModal");
  if (e.target === modal) {
    closeModal();
  }
});

document
  .getElementById("ticketForm")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });

document.getElementById("visitDate").addEventListener("change", function (e) {
  const selectedDate = new Date(this.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert("Please select a future date");
    this.value = "";
  }
});

document.getElementById("age").addEventListener("input", function (e) {
  if (this.value < 0) {
    this.value = 0;
  } else if (this.value > 120) {
    this.value = 120;
  }
});
