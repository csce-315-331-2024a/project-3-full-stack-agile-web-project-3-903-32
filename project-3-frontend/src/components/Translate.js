import { useEffect, useState } from "react";

const getCacheLanguage = () => {
    return localStorage.getItem("language") || "EN";
}

const setCacheLanguage = (language) => {
    localStorage.setItem("language", language);
}

export const TranslateInput = () => {

    async function submitTranslation() {
        const text = document.getElementById("translate-input").value;
        setCacheLanguage(text);
        window.location.reload();
    }

    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        getLanguages();
    }, []);

    async function getLanguages() {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/translate", {
                method: "GET",
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                setLanguages(data);
            } else {
                console.error('Failed to fetch menu:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    }

    return (
        <div className="absolute top-5 left-5">
            <select id='translate-input'>
                {
                    languages.map((lang) => {
                        return <option key={lang.code} defaultValue={lang.name} value={lang.code}>{lang.name}</option>
                    })
                }
            </select>
            <button onClick={submitTranslation}>Translate</button>
        </div>
    );
}

export const TranslateText = (props) => {
    const [translatedText, setTranslatedText] = useState("");

    async function getTranslation(text) {
        console.log("Getting translation for:", text);
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/translate", {
            method: "POST",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "text" : text,
                "target_language": getCacheLanguage()
            })
        });
    
        if (response.ok) {
            const data = await response.json();
            setTranslatedText(data.translated_text);
        }
    }

    useEffect(() => {
        getTranslation(props.text);
    }, []);

    return (
        <span>
            { translatedText }
        </span>
    );
}

export const TranslateExample = () => {
    return (
        <div>
            <TranslateInput />
            <TranslateText text="Hello, how are you?" />
        </div>
    );
}

export default TranslateInput;