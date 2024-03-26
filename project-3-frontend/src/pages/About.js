const Function2 = (props) => {
    return(
        <div className={props.name ? props.name : ""}>
            <h1 className="p-[100px] text-lime-200">Function2</h1>
            <p>This is the Function2 page</p>
        </div>
    );
}

const About = (props) => {
    return(
        <div>
            <h1>About {props.name}</h1>
            <p>This is the about page</p>
            <Function2 />
        </div>
    );
}

export default About; //MUST EXPORT TO ALLOW FOR IMPORT IN OTHER FILES