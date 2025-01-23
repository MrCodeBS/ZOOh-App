const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Add this line



// Database setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
});

// Define models
const SchoolOrder = sequelize.define("SchoolOrder", {
  schoolName: DataTypes.STRING,
  contactEmail: DataTypes.STRING,
  totalAmount: DataTypes.FLOAT,
  invoiceNumber: DataTypes.STRING,
});

const Ticket = sequelize.define("Ticket", {
  type: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
  orderId: DataTypes.INTEGER,
});

SchoolOrder.hasMany(Ticket);

// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
});

// School Order Endpoint
app.post("/api/school-orders", async (req, res) => {
  try {
    const { schoolName, contactEmail, tickets } = req.body;

    if (!schoolName || !contactEmail) {
      return res.status(400).json({ error: "Ungültige Eingaben" });
    }

    // Calculate total with 20% discount
    const subtotal = tickets.reduce((sum, t) => sum + t.quantity * t.price, 0);
    const total = subtotal * 0.8;

    const order = await SchoolOrder.create({
      schoolName,
      contactEmail,
      totalAmount: total,
      invoiceNumber: `INV-${Date.now()}`,
    });

    await Ticket.bulkCreate(
      tickets.map((t) => ({
        ...t,
        orderId: order.id,
      }))
    );

    res.json({
      success: true,
      invoiceNumber: order.invoiceNumber,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
