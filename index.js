const inquirer = require("inquirer");

// Department utils
const {
  viewAllDepartments,
  addDepartment,
  removeDepartment,
  viewDepartmentBudget,
} = require("./utils/departmentUtils");

// Role utils
const {
  viewAllRoles,
  addRole,
  removeRole,
} = require("./utils/roleUtils");

// Manager Utils
const {
  viewAllManagers,
  addManager,
  removeManager
} = require("./utils/managerUtils");

// Employee utils
const {
  viewAllEmployees,
  viewEmployeesByManager,
  viewEmployeesByDepartment,
  addEmployee,
  removeEmployee,
  updateEmployeeRole,
  updateEmployeeManager
} = require("./utils/employeeUtils");

// Menu options
const menuOptions = [
  {
    type: "list",
    name: "menuOption",
    message: "Select an option:",
    choices: [
      "----------------------",
      "View All Departments",
      "View All Roles",
      "View All Managers",
      "View All Employees",
      "View All Employees by Manager",
      "View All Employees by Department",
      "----------------------",
      "Add a Department",
      "Add a Role",
      "Add an Manager",
      "Add an Employee",
      "----------------------",
      "Remove a Department",
      "Remove a Role",
      "Remove a Manager",
      "Remove a Employee",
      "----------------------",
      "Update an Employee Role",
      "Update an Employee Manager",
      "View Department Budget",
      "----------------------",
      "CLEAR",
      "EXIT",
    ],
  },
];

// Display menu and handle user selection
async function displayMenu() {
  let repeatMenu = true;
  while (repeatMenu) {
    const { menuOption } = await inquirer.prompt(menuOptions);

    switch (menuOption) {
      case "View All Departments":
        await viewAllDepartments();
        break;
      case "View All Roles":
        await viewAllRoles();
        break;
      case "View All Managers":
        await viewAllManagers();
        break;
      case "View All Employees":
        await viewAllEmployees();
        break;
      case "View All Employees by Manager":
        await viewEmployeesByManager();
        break;
      case "View All Employees by Department":
        await viewEmployeesByDepartment();
        break;
      case "Add a Department":
        await addDepartment();
        break;
      case "Add a Role":
        await addRole();
        break;
      case "Add an Manager":
        await addManager();
        break;
      case "Add an Employee":
        await addEmployee();
        break;
      case "Remove a Department":
        await removeDepartment();
        break;
      case "Remove a Role":
        await removeRole();
        break;
      case "Remove a Manager":
        await removeManager();
        break;
      case "Remove a Employee":
        await removeEmployee();
        break;
      case "Update an Employee Role":
        await updateEmployeeRole();
        break;
      case "Update an Employee Manager":
        await updateEmployeeManager();
        break;
      case "View Department Budget":
        await viewDepartmentBudget();
        break;
      case "CLEAR":
        process.stdout.write("\x1Bc");
        repeatMenu = false;
        console.log("Console cleared...");
        displayMenu();
        return;
      case "Exit":
        console.log("Exiting application...");
        repeatMenu = false;
        return;
    }
  }
}

// Display the menu
displayMenu();