import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import io from "Socket.IO-client";
import { useRouter } from "next/router";
import QRCode from "react-qr-code";

let socket;

export default function Home() {
  const [pageType, setPageType] = useState("view");
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState(["Yes", "No"]);
  const [max, setMax] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const handleChanges = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const addOption = () => {
    setOptions([...options, ""]);
  };
  const removeOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  useEffect(() => {
    if (question.options) {
      const max = Math.max(...Object.values(question.options));
      setMax(max);
    }
  }, [question.options]);
  const socketInitializer = async () => {
    await fetch("/api/q");
    socket = io();

    socket.on("connect", () => {
      socket.emit("q-id", id);
    });
    socket.on(`a-${id}`, (data) => {
      setPageType("view");
      setQuestion(data);
    });
    socket.on(`no-q`, () => {
      setPageType("create");
    });
    socket.on("q-data", (data) => {
      setPageType("view");
      setShowQR(true);
      setQuestion(data);
    });
  };
  useEffect(() => {
    if (id) {
      socketInitializer();
      setQuestion({ ...question, id });
    }
  }, [id]);

  const handleVote = (optionValue) => {
    socket.emit("vote", optionValue);
    localStorage.setItem(`voted-${question.id}`, true);
  };
  const handleSubmit = () => {
    if (!question.title) return;
    if (options.length < 2) return;
    const optionsMap = {};
    options.forEach((key) => {
      optionsMap[key] = 0;
    });
    const newQuestion = { ...question, options: optionsMap };
    socket.emit("q-post", newQuestion);
  };

  const isVoted =
    typeof localStorage != "undefined" &&
    localStorage.getItem(`voted-${question.id}`);

  if (pageType == "create") {
    return (
      <div>
        <Head>
          <title>Super Poll</title>
          <meta name="description" content="Create polls for free" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="main">
          <h1>Create Poll</h1>
          <div>
            <div className="flex create-box">
              <label>Question :</label>
              <input
                type="text"
                name="title"
                className="input"
                value={question.title}
                onChange={handleChanges}
              />
            </div>
            <div className="flex options">
              <label>options : </label>
              {options.map((option, index) => (
                <div className="flex options-input" key={option}>
                  <input
                    type="text"
                    className="input box"
                    value={option}
                    onChange={(e) => {
                      handleOptionChange(index, e.target.value);
                    }}
                  />
                  <button
                    className="btn-3 remove"
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <br />
              <button className=" btn-3 add-more" onClick={addOption}>
                Add more
              </button>
            </div>
          </div>
          <button className="btn-1" onClick={handleSubmit}>
            Publish
          </button>
        </main>
      </div>
    );
  }
  return (
    <div>
      <Head>
        <title>Super Poll</title>
        <meta name="description" content="Create polls for free" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="qr">
       {showQR && <QRCode
          value={window.location.href}
        />}
      </div>
      <main className="main">
        <h1>{question.title}</h1>
        <ul className="flex options">
          {question?.options &&
            Object.keys(question?.options).map((key) => (
              <li className="flex option-view" key={key}>
                <label for={key}>{key} : </label>
                <progress id={key} max={max} value={question.options[key]}>
                  {question.options[key]}
                </progress>
                <label for={key}>{question.options[key]}</label>
                {!isVoted && (
                  <button onClick={() => handleVote(key)}>Vote</button>
                )}
              </li>
            ))}
        </ul>
      </main>
    </div>
  );
}
