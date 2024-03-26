import { useEffect, useState } from "react";

const Function2 = (props) => {
    return(
        <div className={props.name ? props.name : ""}>
            <h1 className="p-[100px] text-lime-200">Function2</h1>
            <p>This is the Function2 page</p>
        </div>
    );
}

const About = (props) => {
    const [employee, setEmployee] = useState(null); //"employees", "setEmployees

    useEffect(() => {
    });
    
    async function findEmployee() {
        await fetch("http://localhost:5000/api/employee/Oz", {
            method: "GET",
            mode: 'cors',
        })
        .then((res) => {
           if(res.ok) {
               return res.json();
           }
        }).then((data) => 
            setEmployee(data.position))
        .catch((err) => {
            console.log(err);
        });
    }

    return(
        <div>
            <h1>About {props.name}</h1>
            <p>This is the about page</p>
            <Function2 />
            <button onClick={findEmployee}>Click me</button>
            <p>{employee}</p>
        </div>
    );
}

export default About; //MUST EXPORT TO ALLOW FOR IMPORT IN OTHER FILES