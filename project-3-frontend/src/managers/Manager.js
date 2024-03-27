import { Link } from "react-router-dom";

const Manager = () => {
    return (
        <div>
            <ul>
                <Link to="inventory">Inventory</Link>
                <Link to="manager/employees">Employees</Link>
                <Link to="manager/trends">Trends</Link>
                <Link to="manager/menu">Menu</Link>
            </ul>
        </div>
    );
}

export default Manager;