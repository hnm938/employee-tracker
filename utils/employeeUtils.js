const inquirer = require("inquirer");
const db = require("../db");

async function viewAllEmployees() {
  try {
    const query = `
      SELECT 
        employee.id,
        employee.first_name,
        employee.last_name,
        role.title AS role_title,
        department.name AS department_name,
        employee.manager_id AS manager_id,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
      FROM employee
      INNER JOIN role ON employee.role_id = role.id
      INNER JOIN department ON role.department_id = department.id
      INNER JOIN manager ON employee.manager_id = manager.id
    `;
    const [rows] = await db.query(query);

    console.log("\n");
    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving employees:", error);
  }
}

async function addEmployee() {
  try {
    const [roles] = await db.query("SELECT * FROM role");
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    const [managers] = await db.query("SELECT * FROM manager");
    const managerChoices = managers.map((manager) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));

    const employee = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter the employee's first name:",
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter the employee's last name:",
      },
      {
        type: "list",
        name: "role_id",
        message: "Select the employee's role:",
        choices: roleChoices,
      },
      {
        type: "list",
        name: "manager_id",
        message: "Select the employee's manager:",
        choices: managerChoices,
      },
    ]);

    const query =
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
    const result = await db.query(query, [
      employee.first_name,
      employee.last_name,
      employee.role_id,
      employee.manager_id,
    ]);

    console.log("Employee added successfully.");
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

async function removeEmployee() {
  try {
    // Fetch the existing employees to display as choices
    const [employees] = await db.query("SELECT * FROM employee");
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    if (employees.length === 0) {
      return console.log("There are no employees to remove.");
    }

    const { employeeId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select the employee to remove:",
        choices: employeeChoices,
      },
    ]);

    const queryReset = "ALTER TABLE employee AUTO_INCREMENT = 1";
    await db.query(queryReset);

    // Remove the employee from the database
    const queryRemove = "DELETE FROM employee WHERE id = ?";
    await db.query(queryRemove, employeeId);

    console.log(`Employee with ID ${employeeId} removed successfully.`);
  } catch (error) {
    console.error("Error removing employee:", error);
  }
}

async function updateEmployeeRole() {
  try {
    // Fetch the existing employees to display as choices
    const [employees] = await db.query("SELECT * FROM employee");
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    const { employeeId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select the employee to update:",
        choices: employeeChoices,
      },
    ]);

    // Fetch the existing roles to display as choices
    const [roles] = await db.query("SELECT * FROM role");
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    const { roleId } = await inquirer.prompt([
      {
        type: "list",
        name: "roleId",
        message: "Select the new role for the employee:",
        choices: roleChoices,
      },
    ]);

    const query = "UPDATE employee SET role_id = ? WHERE id = ?";
    await db.query(query, [roleId, employeeId]);

    console.log(
      `Update information for employee with ID ${employeeId}.`
    );
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

async function updateEmployeeManager() {
  try {
    // Fetch the list of employees to display as choices
    const [employees] = await db.query("SELECT * FROM employee");
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    // Fetch the list of managers to display as choices
    const [managers] = await db.query("SELECT * FROM manager");
    const managerChoices = managers.map((manager) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));

    const { employeeId, managerId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select the employee to update:",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "managerId",
        message: "Select the new manager for the employee:",
        choices: managerChoices,
      },
    ]);

    const query = "UPDATE employee SET manager_id = ? WHERE id = ?";
    const [result] = await db.query(query, [managerId, employeeId]);

    if (result.affectedRows === 1) {
      console.log("Employee manager updated successfully.");
    } else {
      console.log("No employee found with the provided ID.");
    }
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

async function viewEmployeesByManager() {
  try {
    // Retrieve the list of managers
    const [managers] = await db.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) AS manager_name FROM manager"
    );
    const managerChoices = managers.map((manager) => ({
      name: manager.manager_name,
      value: manager.id,
    }));

    // Prompt the user to select a manager
    const managerSelection = await inquirer.prompt([
      {
        type: "list",
        name: "managerId",
        message: "Select a manager:",
        choices: managerChoices,
      },
    ]);

    // Retrieve the employees of the selected manager
    const query = `
      SELECT 
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
        e.id,
        e.first_name,
        e.last_name,
        r.title AS role_title,
        d.name AS department_name
      FROM employee AS e
      INNER JOIN role AS r ON e.role_id = r.id
      INNER JOIN department AS d ON r.department_id = d.id
      INNER JOIN manager AS m ON e.manager_id = m.id
      WHERE e.manager_id = ?
      ORDER BY e.id
    `;
    const [rows] = await db.query(query, managerSelection.managerId);

    console.log("\n");
    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving employees by manager:", error);
  }
}

async function viewEmployeesByDepartment() {
  try {
    // Retrieve the list of departments
    const [departments] = await db.query(
      "SELECT id, name AS department_name FROM department"
    );
    const departmentChoices = departments.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));

    // Prompt the user to select a department
    const departmentSelection = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select a department:",
        choices: departmentChoices,
      },
    ]);

    // Retrieve the employees of the selected department
    const query = `
      SELECT 
        d.name AS department_name,
        e.id,
        e.first_name,
        e.last_name,
        r.title AS role_title,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM employee AS e
      INNER JOIN role AS r ON e.role_id = r.id
      INNER JOIN department AS d ON r.department_id = d.id
      LEFT JOIN manager AS m ON e.manager_id = m.id
      WHERE d.id = ?
      ORDER BY e.id
    `;
    const [rows] = await db.query(query, departmentSelection.departmentId);

    console.log("\n");
    console.table(rows);
    console.log("\n");
  } catch (error) {
    console.error("Error retrieving employees by department:", error);
  }
}

module.exports = {
  viewAllEmployees,
  viewEmployeesByManager,
  viewEmployeesByDepartment,
  addEmployee,
  removeEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
};