import React, { useCallback, useEffect, useState, useRef } from 'react';

const Verse = ({ besmele, colors, theme, translationApplication, relationalData, verseClassName, hasAsterisk, suraNumber, verseNumber, verseText, encryptedText, verseRefs, handleVerseClick, pulse, grapFocus, pageGWC, handleClickReference, accumulatedCopiesRef, copyTimerRef, hasTitle, hasNotes }) => {
    const [mode, setMode] = useState("idle");
    const [cn, setCn] = useState(verseClassName);
    const [text, setText] = useState(verseText);
    const currentVerseKey = `${suraNumber}:${verseNumber}`;
    const [relatedVerses, setRelatedVerses] = useState([]);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, keys: [] });
    const tooltipRef = useRef();
    const longPressTimerRef = useRef();
    const hasMovedRef = useRef(false);
    const hasLongPressedRef = useRef(false);

    const [pulseNumber, setPulseNumber] = useState("");

    const lang = localStorage.getItem("lang");

    const handleTouchMove = () => {
        hasMovedRef.current = true;
        clearTimeout(longPressTimerRef.current); // Clear the timer as soon as the user moves
    };


    const copyToClipboard = (key, x, y) => {

        const verseKey = `${key} ${verseText}`;
        let accumulatedText = verseKey;

        if (hasTitle && parseInt(key.split(":")[1]) !== 1) {
            accumulatedText = `${hasTitle}\n${accumulatedText}`;
        }

        if (hasNotes) {
            accumulatedText += `\n\n[${hasNotes}]`;
        }

        accumulatedCopiesRef.current = {
            ...accumulatedCopiesRef.current,
            [key]: accumulatedText
        };

        let textToCopy = "";
        Object.values(accumulatedCopiesRef.current).forEach((txt) => {
            textToCopy += txt + "\n\n";
        });

        navigator.clipboard?.writeText(textToCopy)
            .then(() => {
                let keys = Object.keys(accumulatedCopiesRef.current).join(", ");
                setTooltip({ visible: true, x, y, keys: keys });
                setTimeout(() => setTooltip({ ...tooltip, visible: false }), 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleLongPressStart = (e, key) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        hasLongPressedRef.current = false;
        const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        const clip = "[" + key + "]";
        longPressTimerRef.current = setTimeout(() => {
            // Check the ref to see if the user has moved
            if (!hasMovedRef.current) {
                copyToClipboard(clip, x, y);
                hasLongPressedRef.current = true;
                // Start a 60-second timer
                if (copyTimerRef.current) {

                    clearTimeout(copyTimerRef.current);
                }
                copyTimerRef.current = setTimeout(() => {
                    // Clear accumulatedCopies after 60 seconds
                    accumulatedCopiesRef.current = ({});

                }, 19000); // 19 seconds
            }
        }, 500);
    };

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimerRef.current);
        hasMovedRef.current = false;
    };

    const onRelatedVerseClick = (verseKey) => {
        handleClickReference(verseKey);
    };

    const findRelatedVerses = useCallback(() => {
        const related = new Map();

        const addReferences = (theme, referenceString) => {
            referenceString.split(';').forEach(refGroup => {
                const [sura, verses] = refGroup.trim().split(':');
                if (verses && verses.includes(',')) {
                    verses?.split(',').forEach(verseRange => {
                        if (verseRange) {
                            const individualKey = `${sura}:${verseRange.trim()}`;
                            if (individualKey !== currentVerseKey) {
                                const themeRelated = related.get(theme) || [];
                                themeRelated.push(individualKey);
                                related.set(theme, themeRelated);
                            }
                        }
                    });
                } else if (verses && verses.includes('-')) {
                    const [start, end] = verses.split('-');
                    for (let verse = parseInt(start.trim()); verse <= parseInt(end.trim()); verse++) {
                        const individualKey = `${sura}:${verse}`;
                        if (individualKey !== currentVerseKey) {
                            const themeRelated = related.get(theme) || [];
                            themeRelated.push(individualKey);
                            related.set(theme, themeRelated);
                        }
                    }
                }
            });
        };


        const processTheme = (theme, references) => {
            // Split the references string by ';' to separate different references
            references.split(';').forEach(refGroup => {
                const [sura, versesPart] = refGroup.trim().split(':');

                // Handle different formats within the verses part
                versesPart?.split(',').forEach(vp => {

                    if (vp.includes('-')) {
                        // Handle range of verses
                        const [start, end] = vp.split('-').filter(e => e.trim()).map(Number);

                        for (let verse = start; verse <= end; verse++) {
                            const individualKey = `${sura}:${verse}`;
                            if (individualKey === currentVerseKey) {
                                addReferences(theme, references);
                            }
                        }
                    } else {
                        // Handle single verse
                        const individualKey = `${sura}:${vp}`;
                        if (individualKey === currentVerseKey) {
                            addReferences(theme, references);
                        }
                    }
                });
            });
        };

        // Navigate through the JSON structure to find the current verse's references
        Object.entries(relationalData).forEach(([_, word]) => {
            Object.entries(word).forEach(([theme, themeorref]) => {
                if (themeorref) {
                    if (typeof themeorref === 'object') {
                        Object.entries(themeorref).forEach(([t, ref]) => {
                            if (lang === "en") {
                                processTheme(t + " " + theme, ref)
                            } else {
                                processTheme(theme + " " + t, ref)
                            }
                        });
                    } else {
                        processTheme(theme, themeorref)
                    }


                }
            });
        });

        return related;
    }, [currentVerseKey, relationalData, lang]);



    useEffect(() => {
        if (mode === "reading") {
            const foundRelatedVerses = findRelatedVerses();
            setRelatedVerses(foundRelatedVerses);
        }
    }, [mode, currentVerseKey, findRelatedVerses]);


    const lightGODwords = useCallback((verse) => {
        const gw = translationApplication ? translationApplication.gw : "GOD";
        const regex = new RegExp(`\\b(${gw})\\b`, 'g');

        return verse.split(regex).reduce((prev, current, index) => {
            if (index % 2 === 0) {
                return [...prev, current];
            } else {
                return [...prev, <span key={index} className={`font-bold text-sky-500`}>{gw}</span>];
            }
        }, []);
    }, [translationApplication]);


    const lightAllahwords = (text) => {
        if (pageGWC[currentVerseKey]) {
            const namesofGOD = "(?<![\\u0600-\\u06FF])(الله|لله|والله|بالله)(?![\\u0600-\\u06FF])";
            const regex = new RegExp(namesofGOD, 'g');

            let parts = [];
            let localCount = 0;
            const matches = [...text.matchAll(regex)];

            let cursor = 0; // Keep track of the cursor position in the original text
            matches.forEach((match, index) => {
                // Add the text before the match
                parts.push(
                    <span key={`${currentVerseKey}-text-${cursor}`} dir="rtl">
                        {text.slice(cursor, match.index)}
                    </span>
                );

                localCount++;
                parts.push(
                    <span key={`${currentVerseKey}-match-${index}`} className="text-sky-500" dir="rtl">
                        {match[0]}<sub> {pageGWC[currentVerseKey] - localCount + 1} </sub>
                    </span>
                );

                cursor = match.index + match[0].length;
            });

            // Add any remaining text after the last match
            parts.push(
                <span key={`${currentVerseKey}-remaining-${cursor}`} dir="rtl">
                    {text.slice(cursor)}
                </span>
            );

            return parts;
        } else {
            return text;
        }
    };


    useEffect(() => {
        if (hasAsterisk) {
            setMode("light");
        } else {
            setMode("idle");
        };
    }, [hasAsterisk, verseClassName]);

    useEffect(() => {
        if (pulse) {
            if (!pulseNumber.includes("animate-ping")) {
                setPulseNumber("animate-ping");
            }
        } else {
            setPulseNumber("");
        };
    }, [pulse, pulseNumber]);


    useEffect(() => {
        setText(verseText);
        let highlighted = lightGODwords(verseText);
        if (mode === "reading") {
            setCn(verseClassName + " " + colors[theme]["verse-detail-background"] + " flex-col ring-1 " + colors[theme]["ring"]);
            setText(highlighted);
        } else if (mode === "light") {
            let bcn = colors[theme]["text-background"];
            if (encryptedText.includes(besmele)) {
                bcn = "bg-gradient-to-r from-cyan-300 to-sky-500 text-neutral-800"
            }
            setCn(verseClassName + " " + bcn);
        } else if (mode === "idle") {
            let bcn = colors[theme]["text-background"];
            if (encryptedText.includes(besmele)) {
                bcn = "bg-gradient-to-r from-cyan-300 to-sky-500 text-neutral-800"
            }
            setCn(verseClassName + " " + bcn);
        }
    }, [mode, verseClassName, verseText, lightGODwords, colors, theme, encryptedText, besmele]);



    const handleClick = () => {
        if (hasLongPressedRef.current) {
            hasLongPressedRef.current = false;
            return;
        }
        if (mode === "light") {
            handleVerseClick(hasAsterisk, currentVerseKey)
            setMode("idle");
        } else if (mode === "idle") {
            setMode("reading");
            grapFocus(suraNumber, verseNumber);
        } else if (mode === "reading") {
            if (hasAsterisk) {
                setMode("light");
            } else {
                setMode("idle");
            };
        } else {
            console.log("Unknown state action");
        }
    };

    const totalVerseKeysCount = relatedVerses.size > 0 ? Array.from(relatedVerses.values()).reduce((total, verseKeys) => total + verseKeys.length, 0) : 0;
    const heightClass = totalVerseKeysCount <= 19 ? "h-52" : "h-96";

    return (
        <div
            ref={(el) => verseRefs.current[currentVerseKey] = el}
            lang={lang}
            key={"verse:" + currentVerseKey}
            className={`${cn}`}>
            <div
                onMouseDown={(e) => handleLongPressStart(e, currentVerseKey)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchMove={handleTouchMove}
                onTouchStart={(e) => handleLongPressStart(e, currentVerseKey)}
                onTouchEnd={handleLongPressEnd}
                onClick={() => handleClick()}
                className={`px-1 w-full`}
            >
                <span className={`relative`}>
                    <span className={mode === "light" ? encryptedText.includes(besmele) ? `text-rose-500 font-semibold absolute ${pulseNumber}` : `${colors[theme]["matching-text"]} font-semibold absolute ${pulseNumber}` : `absolute brightness-75 ${pulseNumber}`}>
                        {`${verseNumber}. `}
                    </span>
                    <span className={mode === "light" ? encryptedText.includes(besmele) ? `text-rose-500 font-semibold relative` : `${colors[theme]["matching-text"]} font-semibold relative` : `relative brightness-75`}>
                        {`${verseNumber}. `}
                    </span>
                </span>
                <span className={``}>
                    {text}
                </span>
            </div>

            <div className={`w-full flex flex-col flex-1  ${mode === "reading" ? "p-0.5 mt-2" : "h-0"} `}>
                <div className={`${mode === "reading" ? " select-text ease-in mb-2 duration-200" : "h-0 ease-linear duration-75"} w-full transition-all  rounded ${colors[theme]["encrypted-background"]} `} >
                    <p className={` p-2 text-start `} dir="rtl" >
                        {mode === "reading" && lightAllahwords(encryptedText)}
                    </p>
                </div>
                <div className={`${(mode === "reading" && relatedVerses.size > 0) ? "overflow-auto p-2 delay-500 duration-200 ease-in-out " + heightClass : "duration-75 ease-linear h-0"}  transition-all w-full rounded ${colors[theme]["relation-background"]}`}>
                    {(mode === "reading" && relatedVerses.size > 0) && Array.from(relatedVerses.entries()).map(([themeKey, verseKeys]) => (
                        <div key={themeKey}>
                            <h3 className={`text-lg text-left ${colors[theme]["matching-text"]}`}>{themeKey}</h3>
                            <div>
                                {verseKeys.map(verseKey => (
                                    <button
                                        className={`${colors[theme]["base-background"]} p-2 rounded my-1 mr-2 shadow-lg text-sky-500`}
                                        key={verseKey}
                                        onClick={() => onRelatedVerseClick(verseKey)}
                                    >
                                        {verseKey}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {tooltip.visible && (
                <div
                    ref={tooltipRef}
                    className={`fixed px-4 py-2  rounded ${colors[theme]["base-background"]} ${colors[theme]["app-text"]}`}
                    style={{ left: tooltip.x - 30, top: tooltip.y - 30, transform: 'translate(-50%, -50%)' }}
                >
                    {tooltip.keys}{` `}{translationApplication.copied}
                </div>
            )}
        </div>
    );
};

export default Verse;