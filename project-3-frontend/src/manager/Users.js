import Navbar from "../components/NavbarManager";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";

const Users = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editEmployeeObject, setEditEmployeeObject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addModal, setAddModal] = useState(false);

  const handleDeleteEmployees = (event) => {
    event.preventDefault();
    if (confirmDelete) {
      setEditModal(false);
      setConfirmDelete(false);
      deleteEmployee(editEmployeeObject.id);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleOpenEditModal = (event, employeeObject) => {
    event.preventDefault();
    setEditEmployeeObject({ ...employeeObject });
    handleCloseAddModal(event);
    setEditModal(true);
  };

  const handleCloseEditModal = (event) => {
    event.preventDefault();
    setEditModal(false);
  };

  const handleOpenAddModal = (event) => {
    event.preventDefault();
    setEditEmployeeObject(null);
    handleCloseEditModal(event);
    setAddModal(true);
  };

  const handleCloseAddModal = (event) => {
    event.preventDefault();
    setAddModal(false);
  };

  const submitEditEmployees = (event) => {
    event.preventDefault();
    // console.log("Edit employees");
    const form = event.target;
    const name = form.elements["employees_name"].value;
    if (name === "") {
      alert("Name cannot be empty");
      return;
    }
    const position = form.elements["employees_position"].value;
    if (position !== "Manager" && position !== "Cashier") {
      alert("Position has to be either Manager or Cashier");
      return;
    }
    const email = form.elements["employees_email"].value;
    if (email.indexOf("@") === -1) {
      alert("Email has include a email address");
      return;
    }

    putEmployees({
      id: editEmployeeObject.id,
      name: name,
      position: position,
      email: email,
    });

    setEditEmployeeObject({
      id: editEmployeeObject.id,
      name: name,
      position: position,
      email: email,
    });
  };

  const submitAddEmployees = (event) => {
    event.preventDefault();
    // console.log("Edit employees");
    const form = event.target;
    const name = form.elements["employees_name"].value;
    if (name === "") {
      alert("Name cannot be empty");
      return;
    }
    const position = form.elements["employees_position"].value;
    if (position !== "Manager" && position !== "Cashier") {
      alert("Position has to be either Manager or Cashier");
      return;
    }
    const email = form.elements["employees_email"].value;
    if (email.indexOf("@") === -1) {
      alert("Email has include a email address");
      return;
    }

    postEmployees({
      name: name,
      position: position,
      email: email,
    });
    handleCloseAddModal(event);
  };

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
    if (confirmDelete) {
      const timeout_id = setTimeout(() => {
        if (confirmDelete) {
          setConfirmDelete(false);
        }
      }, 2500);

      return () => clearTimeout(timeout_id);
    }
  }, [confirmDelete]);

  async function getEmployees() {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/employees",
        {
          method: "GET",
          mode: "cors",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEmployeeList(data);
      } else {
        console.error(
          "Failed to fetch employees:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  async function postEmployees({ name, position, email }) {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/employees",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            position: position,
            email: email,
          }),
        }
      );
      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        alert("New Employee Added");
        getEmployees();
      } else {
        console.error(
          "Failed to post employee:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error posting employee:", error);
    }
  }

  async function putEmployees({ id, name, position, email }) {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/employees/" + id,
        {
          method: "PUT",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            position: position,
            email: email,
          }),
        }
      );
      if (response.ok) {
        alert("Employee data updated");
        getEmployees();
      } else {
        console.error(
          "Failed to post employee:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error posting employee:", error);
    }
  }

  async function deleteEmployee(id) {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/employees/" + id,
        {
          method: "DELETE",
          mode: "cors",
        }
      );
      if (response.ok) {
        alert("DELTED employee");
        getEmployees();
      } else {
        console.error(
          "Failed to delete employees:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error deleting employees:", error);
    }
  }

  const EditEmployeesModal = () => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded">
      <div className="pb-4 px-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-xl">Edit employees Item</h1>
          <button onClick={handleCloseEditModal}>
            <img
              src={`${process.env.PUBLIC_URL}/x-solid.svg`}
              alt="Close"
              className="h-[20px]"
            />
          </button>
        </div>
        <form className="flex flex-col gap-2" onSubmit={submitEditEmployees}>
          <div className="flex justify-between">
            <label htmlFor="employees_name">Employee Name: </label>
            <input
              required
              type="text"
              name="employees_name"
              aria-label="employees_name"
              defaultValue={editEmployeeObject.name}
              className="border-2 border-gray-700 rounded px-2 py-1"
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="employees_position">Employee Position: </label>
            <select
              required
              name="employees_position"
              aria-label="employees_posiiton"
              defaultValue={editEmployeeObject.position}
              className="border-2 border-gray-700 rounded px-2 py-1"
            >
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>
          <div className="flex justify-between">
            <label htmlFor="employees_email">Employee Email: </label>
            <input
              required
              type="text"
              name="employees_email"
              aria-label="employees_email"
              defaultValue={editEmployeeObject.email}
              className="border-2 border-gray-700 rounded px-2 py-1"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <button
              className="rounded border-2 p-2 hover:bg-green-100 border-green-900 text-green-900"
              type="submit"
              id="button_save_employee"
            >
              Save Employee Data
            </button>
            <button
              className="rounded border-2 p-2 hover:bg-red-100 border-red-700 text-red-700"
              onClick={handleDeleteEmployees}
            >
              {confirmDelete ? "Confirm" : "Delete Employee Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddEmployeesModal = () => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded">
      <div className="pb-4 px-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-xl">Add employees Item</h1>
          <button onClick={handleCloseAddModal}>
            <img
              src={`${process.env.PUBLIC_URL}/x-solid.svg`}
              alt="Close"
              className="h-[20px]"
            />
          </button>
        </div>
        <form className="flex flex-col gap-2" onSubmit={submitAddEmployees}>
          <div className="flex justify-between">
            <label htmlFor="employees_name">Employee name: </label>
            <input
              required
              type="text"
              name="employees_name"
              aria-label="employees_name"
              className="border-2 border-gray-700 rounded px-2 py-1"
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="employees_position">Employee position: </label>
            <select
              required
              type="number"
              name="employees_position"
              aria-label="employees_position"
              className="border-2 border-gray-700 rounded px-2 py-1"
            >
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div className="flex justify-between">
            <label htmlFor="employees_email">Employee email: </label>
            <input
              required
              type="text"
              name="employees_email"
              aria-label="employees_email"
              className="border-2 border-gray-700 rounded px-2 py-1"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <button
              className="rounded border-2 p-2 hover:bg-green-100 border-green-900 text-green-900"
              type="submit"
              id="button_save_employee"
            >
              Add New Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-6">
            <div className="flex-1 bg-white border-b border-gray-200 mb-6">
              {" "}
              {/* Employees table container */}
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeeList.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 text-center text-gray-700">
                        {item.name}
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {item.position}
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {item.email}
                      </td>
                      <td className="p-3 text-center text-blue-700">
                        <button
                          onClick={(event) => handleOpenEditModal(event, item)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleOpenAddModal}
                className="w-full p-3 border border-dashed border-black "
              >
                +
              </button>
            </div>
          </div>
        </main>
      </div>
      {editModal && <EditEmployeesModal />}
      {addModal && <AddEmployeesModal />}
    </div>
  );
};

export default Users;
