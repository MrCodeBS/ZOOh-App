// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Ticket prices
const TICKET_PRICES = {
    adult: 30,
    child: 15,
    senior: 20,
    family: 75
};

// Format date to readable string
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate unique ticket ID
function generateTicketId() {
    return 'TKT-' + Date.now().toString(36).toUpperCase() + 
           Math.random().toString(36).substring(2, 7).toUpperCase();
}

// Calculate ticket validity (3 months from purchase)
function calculateValidity(purchaseDate) {
    const validityDate = new Date(purchaseDate);
    validityDate.setMonth(validityDate.getMonth() + 3);
    return validityDate;
}

// Show modal
function showModal() {
    document.getElementById('ticketModal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('ticketModal').style.display = 'none';
    // Clear the QR code
    document.getElementById('qrcode').innerHTML = '';
}

// Generate QR code
function generateQRCode(data) {
    const qrcode = new QRCode(document.getElementById('qrcode'), {
        text: JSON.stringify(data),
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Handle form submission
document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const ticketData = {
        ticketId: generateTicketId(),
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        ticketType: document.getElementById('ticketType').value,
        price: TICKET_PRICES[document.getElementById('ticketType').value],
        visitDate: document.getElementById('visitDate').value,
        purchaseDate: new Date().toISOString(),
        validUntil: calculateValidity(new Date()).toISOString()
    };

    // Create ticket details HTML
    const ticketDetails = document.getElementById('ticketDetails');
    ticketDetails.innerHTML = `
        <h3>Ticket ID: ${ticketData.ticketId}</h3>
        <p><strong>Name:</strong> ${ticketData.name}</p>
        <p><strong>Age:</strong> ${ticketData.age}</p>
        <p><strong>Gender:</strong> ${ticketData.gender}</p>
        <p><strong>Ticket Type:</strong> ${ticketData.ticketType.charAt(0).toUpperCase() + ticketData.ticketType.slice(1)}</p>
        <p><strong>Price:</strong> $${ticketData.price}</p>
        <p><strong>Visit Date:</strong> ${formatDate(ticketData.visitDate)}</p>
        <p><strong>Purchase Date:</strong> ${formatDate(ticketData.purchaseDate)}</p>
        <p><strong>Valid Until:</strong> ${formatDate(ticketData.validUntil)}</p>
    `;

    // Generate QR code
    generateQRCode(ticketData);

    // Show modal
    showModal();
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('ticketModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Prevent form submission on enter key
document.getElementById('ticketForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Validate visit date (can't be in the past)
document.getElementById('visitDate').addEventListener('change', function(e) {
    const selectedDate = new Date(this.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert('Please select a future date');
        this.value = '';
    }
});

// Validate age
document.getElementById('age').addEventListener('input', function(e) {
    if (this.value < 0) {
        this.value = 0;
    } else if (this.value > 120) {
        this.value = 120;
    }
});