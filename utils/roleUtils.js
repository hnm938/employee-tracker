const inquirer = require("inquirer");
const db = require("../db");

async function viewAllRoles() {
  try {
    const query = "SELECT * FROM role";
    const [rows] = await db.query(query);

    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving roles:", error);
  }
}

async function addRole() {
  try {
    // Fetch the existing departments to display as choices
    const [departments] = await db.query("SELECT * FROM department");
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    const role = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the role title:",
        validate: (input) => {
          if (input.trim() === "") {
            return "Please enter a title name.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the role salary:",
        validate: (input) => {
          if (
            isNaN(parseFloat(input)) ||
            !isFinite(input) ||
            input.trim() === ""
          ) {
            return "Please enter a valid salary.";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "departmentId",
        message: "Select the department for the role:",
        choices: departmentChoices,
      },
    ]);

    const query =
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [
      role.title,
      role.salary,
      role.departmentId,
    ]);

    console.log(
      `Role '${role.title}' added successfully with ID ${result.insertId}.\n`
    );
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

// Remove department
async function removeRole() {
  try {
    // Fetch the existing departments to display as choices
    const [roles] = await db.query("SELECT * FROM role");
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    if (roles.length === 0) { return console.log("There are no roles to remove. \n"); }

    // Prompt the user to select a department to remove
    const { roleId } = await inquirer.prompt([
      {
        type: "list",
        name: "roleId",
        message: "Select the role to remove:",
        choices: roleChoices,
      },
    ]);

    // Remove the department from the database
    const queryRemove = "DELETE FROM role WHERE id = ?";
    await db.query(queryRemove, roleId);

    // ! Update id's to follow incremental order, disabled.
    // // Check if all departments have been removed
    // if (departments.length >= 1) {
    //   for (let i = 0; i < departments.length; i++) {
    //     const newId = i;
    //     if (departments[i].id !== newId) {
    //       const queryUpdate = "UPDATE department SET id = ? WHERE id = ?";
    //       await db.query(queryUpdate, [newId, departments[i].id]);
    //     }
    //   }
    // }

    console.log(`Department with ID ${roleId} removed successfully.`);
  } catch (error) {
    console.error("Error removing department:", error);
  }
}

module.exports = {
  viewAllRoles,
  addRole,
  removeRole
};
