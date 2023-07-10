const inquirer = require("inquirer");
const db = require("../db");

// View departments
async function viewAllDepartments() {
  try {
    const query = "SELECT * FROM department";
    const [rows] = await db.query(query);

    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving departments:", error);
  }
}

// Add department
async function addDepartment() {
  try {
    const department = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
        validate: (input) => {
          if (input.trim() === "") {
            return "Please enter a department name.";
          }
          return true;
        },
      },
    ]);

    // ! Update id's to follow incremental order, disabled.
    // const queryReset = "ALTER TABLE department AUTO_INCREMENT = 1";
    // await db.query(queryReset);
    
    const query = "INSERT INTO department (name) VALUES (?)";
    const [result] = await db.query(query, department.name);

    console.log(
      `Department '${department.name}' added successfully with ID ${result.insertId}.\n`
    );
  } catch (error) {
    console.error("Error adding department:", error);
  }
}

// Remove department
async function removeDepartment() {
  try {
    // Fetch the existing departments to display as choices
    const [departments] = await db.query("SELECT * FROM department");
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    if (departments.length === 0) { return console.log("There are no departments to remove. \n"); }

    // Prompt the user to select a department to remove
    const { departmentId } = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select the department to remove:",
        choices: departmentChoices,
      },
    ]);

    // Remove the department from the database
    const queryRemove = "DELETE FROM department WHERE id = ?";
    await db.query(queryRemove, departmentId);

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

    console.log(`Department with ID ${departmentId} removed successfully.`);
  } catch (error) {
    console.error("Error removing department:", error);
  }
}

async function viewDepartmentBudget() {
  try {
    // Fetch the existing departments to display as choices
    const [departments] = await db.query("SELECT * FROM department");
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    const { departmentId } = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select the department to view the budget:",
        choices: departmentChoices,
      },
    ]);

    const query = `
      SELECT employee.id AS employeeId, employee.first_name, employee.last_name, role.salary
      FROM employee
      JOIN role ON employee.role_id = role.id
      WHERE role.department_id = ?
    `;
    const [employees] = await db.query(query, departmentId);

    if (employees.length > 0) {
      let totalSalary = 0;
      console.log(`Employee salaries for the selected department:`);
      employees.forEach((employee) => {
        console.log(
          `${employee.first_name} ${employee.last_name}: $${employee.salary}`
        );
        totalSalary += parseFloat(employee.salary);
      });
      console.log(`Total Salary Cost: $${totalSalary.toFixed(2)}`);
    } else {
      console.log("No employees found for the selected department.");
    }
  } catch (error) {
    console.error("Error viewing department budget:", error);
  }
}

module.exports = {
  viewAllDepartments,
  addDepartment,
  removeDepartment,
  viewDepartmentBudget,
};
