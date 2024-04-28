import React, { useContext, useEffect, useState } from "react";

const getCacheLanguage = () => {
    return localStorage.getItem("language") || "EN";
}

const setCacheLanguage = (language) => {
    localStorage.setItem("language", language);
}

// export async function getArrayTranslation(text) {
//     console.log("Getting translation for:", text);
//     const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/translate", {
//         method: "POST",
//         mode: 'cors',
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             "text" : text,
//             "target_language": getCacheLanguage()
//         })
//     });

//     if (response.ok) {
//         const data = await response.json();
//         return data.translated_text;
//     }
// }

export const LanguageContext = React.createContext();
const LanguageUpdateContext = React.createContext();

export const TranslateContext = ({ children }) => {
    const [language, setLanguage] = useState(getCacheLanguage());

    function setLanguageContext (language) {
        setCacheLanguage(language);
        setLanguage(language);
    }

    return (
        <LanguageContext.Provider value={language}>
            <LanguageUpdateContext.Provider value={setLanguageContext}>
                <TranslateInput />
                { children }
            </LanguageUpdateContext.Provider>
        </LanguageContext.Provider>
    );
}

export const TranslateInput = () => {
    const [languages, setLanguages] = useState([]);
    const setSelectedLanguage = useContext(LanguageUpdateContext);

    async function submitTranslation() {
        window.location.reload();
        const text = document.getElementById("translate-input").value;
        setSelectedLanguage(text);
    }

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
        <div className="absolute top-2 right-4 flex flex-col">
            <label id="select-language-label">Select Language:</label>
            <select id='translate-input' aria-labelledby="select-language-label" onChange={submitTranslation} className="p-2 rounded hover:cursor-pointer border border-gray-500">
                {
                    languages.map((lang) => {
                        return <option key={lang.code} selected={lang.code === getCacheLanguage()} value={lang.code}>
                            {lang.name}
                        </option>
                    })
                }
            </select>
        </div>
    );
}

export const TranslateText = (props) => {
    const selectedLanguage = useContext(LanguageContext);
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
                "target_language": selectedLanguage
            })
        });
    
        if (response.ok) {
            const data = await response.json();
            setTranslatedText(data.translated_text);
        }
    }

    useEffect(() => {
        if(selectedLanguage !== "EN") {
            getTranslation(props.text);
        } else{
            setTranslatedText(props.text);
        }
    }, [selectedLanguage]);

    return (
        <span>
            { translatedText }
        </span>
    );
}

export default TranslateContext;