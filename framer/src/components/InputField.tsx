
export default function Form() {
    return (
        <form
            action="https://s2dlab.framer.website/"
            // To learn more about styling see:
            // https://reactjs.org/docs/dom-elements.html#style
            style={{
                padding: 20,
                backgroundColor: "#0c1ea7",
                fontWeight: "bold",
                color: "#f2f2f2",
            }}
        >
            <label htmlFor="name">Email : </label>
            <input type="email" id="email" />
            <br />
            <br />
            <label htmlFor="name">Company : </label>
            <input type="text" id="name" />
            <br />
            <br />
            <label htmlFor="company Size">Company Size : </label>
            <input type="text" id="company Size" />
            <br />
            <br />
            <label htmlFor="role">Role : </label>
            <input type="text" id="role" />
            <br />
            <br />
            <label htmlFor="usage n expectations">
                Usage & Expectations :{" "}
            </label>
            <input type="text" id="usage n expectations" />
            <br />
            <br />
            <label htmlFor="API Key">API Key : </label>
            <input
                type="text"
                id="API Key"
                style={{ backgroundColor: "#c4fa70" }}
            />
            <br />
            <br />
            <input
                type="submit"
                value="Submit"
                style={{ padding: 20, backgroundColor: "#c4fa70" }}
            />
        </form>
    )
}
