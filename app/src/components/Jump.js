import React, { useState, useEffect } from 'react';
import languages from '../assets/languages.json';

const Jump = ({ onChangeLanguage, suraNames, onChangeTheme, colors, theme, translationApplication, currentPage, quran, onClose, onConfirm, onMagnify }) => {
    const [suraNumber, setSuraNumber] = useState("0");
    const [verseNumber, setVerseNumber] = useState("1");
    const [selectedPage, setSelectedPage] = useState(currentPage);
    const [pageTitles, setPageTitles] = useState({});
    const [versesInSuras, setVersesInSuras] = useState({});
    const [pageForSuraVerse, setPageForSuraVerse] = useState({});
    const [showThemes, setShowThemes] = useState(false);

    const [suraNameMap, setSuraNameMap] = useState({});
    const [lightOpen, setLightOpen] = useState(false);


    useEffect(() => {
        let themap = {}
        if (suraNames) {
            Object.entries(suraNames).forEach(([key, value]) => {
                if (key > 0) {
                    const vals = value.split(".").filter(e => e.trim())
                    if (vals.length > 5) {
                        themap[key] = vals[1].trim() + "." + vals[2] + ". (" + vals[3].trim() + ")"
                    } else {
                        themap[key] = vals[1].trim() + " (" + vals[2].trim() + ")"
                    }
                }
            });
        }
        setSuraNameMap(themap);
    }, [suraNames]);


    useEffect(() => {
        const surasInPagesMap = {};
        const versesInSurasMap = {};
        const pageForSuraVerseMap = {};
        const newPageTitles = {};

        Object.entries(quran).forEach(([page, data]) => {
            surasInPagesMap[page] = Object.keys(data.sura);
            data.page.forEach((info) => {
                if (info.includes(":")) {
                    newPageTitles[page] = info.split("&");
                }
            });

            Object.entries(data.sura).forEach(([sura, suraData]) => {
                versesInSurasMap[sura] = versesInSurasMap[sura] || [];
                pageForSuraVerseMap[sura] = pageForSuraVerseMap[sura] || {};

                Object.keys(suraData.verses).forEach(verse => {
                    if (!versesInSurasMap[sura].includes(verse)) {
                        versesInSurasMap[sura].push(verse);
                    }
                    pageForSuraVerseMap[sura][verse] = page;
                });
            });
        });

        setPageTitles(newPageTitles);
        setVersesInSuras(versesInSurasMap);
        setPageForSuraVerse(pageForSuraVerseMap);
        setSelectedPage(currentPage);

        if (surasInPagesMap[currentPage] && pageForSuraVerseMap) {
            setSuraNumber(surasInPagesMap[currentPage][0]);

            for (const [key, value] of Object.entries(pageForSuraVerseMap[surasInPagesMap[currentPage][0]])) {
                if (parseInt(value) === parseInt(currentPage)) {
                    setVerseNumber(key)
                    return;
                }

            }
        }

    }, [currentPage, quran]);

    const handleSuraChange = (e) => {
        const newSuraNumber = e.target.value;
        setSuraNumber(newSuraNumber);

        const firstVerseOfSura = versesInSuras[newSuraNumber][0];
        if (firstVerseOfSura && pageForSuraVerse[newSuraNumber][firstVerseOfSura]) {
            setSelectedPage(pageForSuraVerse[newSuraNumber][firstVerseOfSura]);
        }
    };

    const handleVerseChange = (e) => {
        setLightOpen(true)
        const newVerseNumber = e.target.value;
        setVerseNumber(newVerseNumber);

        if (pageForSuraVerse[suraNumber] && pageForSuraVerse[suraNumber][newVerseNumber]) {
            setSelectedPage(pageForSuraVerse[suraNumber][newVerseNumber]);
        }
    };

    const handleSubmit = () => {
        onConfirm(selectedPage, suraNumber, verseNumber ? verseNumber : "1");
        onClose();
    };

    const goIntro = () => {
        onConfirm("13");
        onClose();
    };

    const goApps = () => {
        onConfirm("396");
        onClose();
    };

    const toggleThemeView = () => {
        setShowThemes(!showThemes);
    };

    const ThemePicker = ({ onChangeTheme }) => {
        const themes = {
            light: "#e5e5e5",
            dark: "#171717",
            indigo: "#4338ca",
            green: "#0f766e",
            sky: "#0284c7",
        };

        return (
            <div className={`flex space-x-7 ${showThemes ? "" : "h-0"}`}>
                {Object.entries(themes).map(([localTheme, color]) => (
                    <label key={localTheme} className="cursor-pointer">
                        <input
                            type="radio"
                            name="theme"
                            value={localTheme}
                            onChange={(e) => onChangeTheme(e.target.value)}
                            className="hidden"
                        />
                        <span
                            className={`flex items-center justify-center rounded border ${localTheme === theme ? `${colors[theme]["matching-border"]}` : "border-gray-500"} ${showThemes ? "h-10 w-10" : "hidden h-0 w-0"}`}
                            style={{ backgroundColor: color }}>
                            {localTheme === theme &&
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${colors[theme]["matching-text"]} w-4 h-4`}>
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                </svg>}
                        </span>
                    </label>
                ))}
            </div>
        );
    };


    return (
        <div className={`w-screen h-screen fixed left-0 top-0 inset-0 z-10 outline-none focus:outline-none `} id="jump-screen">
            <div className={` w-full h-full backdrop-blur-xl flex items-center justify-center `}>
                <div className={` w-full md:w-2/3 lg:w-1/2 2xl:w-1/3 px-2 flex flex-col transition-all duration-200 ease-linear mb-7 `}>

                    <div className={`w-full fixed top-7 right-2 flex justify-between ${colors[theme]["app-text"]} mb-2`}>
                        <div className={`w-full flex justify-end place-self-end`}>
                            <button className={`flex justify-center`} onClick={onClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-14 h-14`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>

                            </button>
                        </div>
                    </div>
                    <div className={`shadow-[rgba(125,211,252,0.4)_0px_7px_15px_15px] transition-colors duration-700 ease-linear flex flex-col items-center justify-center ${colors[theme]["text-background"]} rounded  w-full `}>
                        <div className={`w-full p-2`}>
                            <div
                                onClick={onMagnify}
                                className={`w-full flex justify-center ${colors[theme]["text"]} rounded p-2 ${colors[theme]["app-background"]} cursor-pointer`}>
                                <button className={`flex justify-center`} >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-11 h-11`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </button>
                                <div className={`flex text-left items-center ml-3 ${colors[theme]["matching-text"]} text-xl`}>
                                    {translationApplication.search}<span className={`${colors[theme]["text"]}`}>{"..."}</span>
                                </div>
                            </div>
                        </div>
                        <div className={` w-full flex space-x-1 ${colors[theme]["app-text"]}`}>
                            <div className={`w-full px-4 flex justify-end `}>
                                {translationApplication?.sura} :
                            </div>
                            <div className={`w-full flex items-center justify-start`}>
                                {translationApplication?.verse}
                            </div>
                        </div>
                        <div className={` w-full flex space-x-3 `}>
                            <div className={`relative w-full flex justify-end`}>
                                <select
                                    id="sura"
                                    name="sura"
                                    onChange={handleSuraChange}
                                    value={suraNumber}
                                    className={`text-3xl w-24 h-16 whitespace-pre-line text-justify rounded pb-4 pt-3.5 pl-5 pr-1 ${colors[theme]["text"]} ${colors[theme]["base-background"]} placeholder:text-sky-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 `}>
                                    <option key="0" value="0" disabled></option>
                                    {Object.entries(suraNameMap).map(([sura, sname]) => (
                                        <option key={sura} value={sura}>{sura}{`\t`}{sname}</option>
                                    ))}
                                </select>

                            </div>
                            <div className={`w-full flex justify-start`}>
                                <select
                                    id="verse"
                                    name="verse"
                                    onChange={handleVerseChange}
                                    value={verseNumber}
                                    className={`text-3xl w-24 rounded py-3 pr-5 text-right  ${colors[theme]["text"]} ${colors[theme]["base-background"]} placeholder:text-sky-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 `}>
                                    {suraNumber && versesInSuras[suraNumber] ? versesInSuras[suraNumber].map(verse => (
                                        <option key={verse} value={verse}>{verse}</option>
                                    )) : null}
                                </select>
                            </div>
                        </div>
                        <div className={`w-full p-2 ${colors[theme]["app-text"]} flex-1 mt-1`}>
                            <div className={`w-full ${colors[theme]["app-background"]} p-3  rounded`}>
                                <div className={`flex w-full ${colors[theme]["app-text"]} mb-4 text-sm`}>
                                    {translationApplication?.page} {selectedPage}
                                </div>
                                {pageTitles[selectedPage] && pageTitles[selectedPage].map((title, index) => {
                                    // Use a regex to match the three groups: name, Latin pronunciation, and page info
                                    const titleRegex = /^(.*?)\s+\((.*?)\)\s+(.*)$/;
                                    const match = title.match(titleRegex);

                                    // If the title matches the expected format, render the groups
                                    if (match) {
                                        return (
                                            <div key={index} className="flex justify-between w-full mt-1">
                                                <div className="w-full flex justify-between mr-0.5">
                                                    <span className="text-left font-bold justify-self-center text-sky-500">{match[1]}</span>
                                                    <span className="text-right ">{`(${match[2]})`}</span>
                                                </div>
                                                <span className="w-1/3 text-right">{match[3]}</span>
                                            </div>
                                        );
                                    } else {
                                        // If the title doesn't match the expected format, split and render
                                        const lastSpaceIndex = title.lastIndexOf(" ");
                                        const namePart = title.substring(0, lastSpaceIndex);
                                        const pageInfoPart = title.substring(lastSpaceIndex + 1);

                                        return (
                                            <div key={index} className="flex justify-between w-full">
                                                <span className="text-left flex-1 font-bold text-sky-500">{namePart}</span>
                                                <span className="text-right flex-1">{pageInfoPart}</span>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                        <div className={`flex w-full justify-between items-center ${colors[theme]["text"]} space-x-2 px-2 ${showThemes ? "pb-0" : "pb-2"}`}>
                            <button
                                onClick={handleSubmit}
                                className={`flex flex-col w-full items-center justify-between pt-2 rounded  transition-all delay-150 duration-700 ease-in-out ${lightOpen ? "bg-sky-600" : colors[theme]["app-background"]}`}>
                                <div className={`flex justify-center`} >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-11 h-11`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                                    </svg>
                                </div>
                                <div className={` flex text-sm items-center justify-center pb-2 ${lightOpen ? colors[theme]["text"] : colors[theme]["page-text"]}`}>
                                    {translationApplication?.open}
                                </div>
                            </button>
                            <button
                                onClick={goIntro}
                                className={`flex flex-col w-full items-center justify-between pt-2 rounded  ${colors[theme]["app-background"]}`}>
                                <div className={`flex justify-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-11 h-11`}>
                                        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className={`flex ${colors[theme]["page-text"]} text-sm items-center justify-center pb-2`}>
                                    {translationApplication?.intro}
                                </div>
                            </button>
                            <button
                                onClick={goApps}
                                className={`flex flex-col w-full items-center justify-between pt-2 rounded  ${colors[theme]["app-background"]}`}>
                                <div className={`flex justify-center`} >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-11 h-11`}>
                                        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className={`flex ${colors[theme]["page-text"]} text-sm items-center justify-center pb-2`}>
                                    {translationApplication?.appendices}
                                </div>
                            </button>
                            <button
                                onClick={toggleThemeView}
                                className={`flex flex-col w-full items-center justify-between pt-2 rounded  ${colors[theme]["app-background"]}`}>
                                <div className={`flex justify-center`} >
                                    {showThemes ?
                                        (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-11 h-11`}>
                                            <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 1 1-9 0V4.125Zm4.5 14.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
                                            <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257ZM12.738 17.625l6.474-6.474a1.875 1.875 0 0 0 0-2.651L15.5 4.787a1.875 1.875 0 0 0-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375Z" />
                                        </svg>
                                        ) :
                                        (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-11 h-11`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
                                        </svg>

                                        )}

                                </div>
                                <div className={`flex ${colors[theme]["page-text"]} text-sm items-center justify-center pb-2`}>
                                    {translationApplication?.color}
                                </div>
                            </button>
                        </div>
                        {
                            <div className={`flex flex-col items-center justify-center w-full transition-all duration-200 ease-linear ${showThemes ? "p-2" : "h-0"}`}>
                                <div className={`transition-colors duration-700 ease-linear flex flex-col items-center justify-center ${colors[theme]["app-background"]} rounded  w-full ${showThemes ? "p-3" : "h-0"} mx-2`}>
                                    <div>
                                        <ThemePicker onChangeTheme={onChangeTheme} />
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                </div>
                <div className={`w-full md:w-2/3 lg:w-1/2 2xl:w-1/3 fixed bottom-11 md:bottom-16 flex justify-center`}>
                    <select
                        id="languagepicker"
                        name="langpick"
                        onChange={(e) => onChangeLanguage(e.target.value)}
                        value={localStorage.getItem("lang")}
                        className={`w-full m-2 text-center rounded px-4 py-2 border border-neutral-400/40 text-lg brightness-80 bg-neutral-500/20 ${colors[theme]["page-text"]}`}>
                        {Object.keys(languages).map((key) => {
                            if (key) {
                                const isLanguageDisabled = languages[key].includes("not complete");
                                return (
                                    <option key={key} value={key} disabled={isLanguageDisabled}>{languages[key]}</option>
                                );
                            }
                            return null;
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default Jump;
