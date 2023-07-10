const inquirer = require("inquirer");
const db = require("../db");

async function viewAllManagers() {
  try {
    const query = "SELECT * FROM manager";
    const [rows] = await db.query(query);

    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving managers:", error);
  }
}

async function addManager() {
  try {
    const manager = await inquirer.prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter the manager's first name:",
        validate: (input) => {
          if (input.trim() === "") {
            return "Please enter a first name.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter the manager's last name:",
        validate: (input) => {
          if (input.trim() === "") {
            return "Please enter a last name.";
          }
          return true;
        },
      },
    ]);

    const query = "INSERT INTO manager (first_name, last_name) VALUES (?, ?)";
    await db.query(query, [manager.firstName, manager.lastName]);

    console.log("Manager added successfully.");
  } catch (error) {
    console.error("Error adding manager:", error);
  }
}

async function removeManager() {
  try {
    // Fetch the list of managers to display as choices
    const query = "SELECT * FROM manager";
    const [managers] = await db.query(query);

    if (managers.length === 0) {
      console.log("There are no managers to remove.");
      return;
    }

    const managerChoices = managers.map((manager) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));

    const { managerId } = await inquirer.prompt([
      {
        type: "list",
        name: "managerId",
        message: "Select the manager to remove:",
        choices: managerChoices,
      },
    ]);

    const removeQuery = "DELETE FROM manager WHERE id = ?";
    await db.query(removeQuery, managerId);

    console.log("Manager removed successfully.");
  } catch (error) {
    console.error("Error removing manager:", error);
  }
}

module.exports = {
  viewAllManagers,
  addManager,
  removeManager
};
