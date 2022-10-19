import Head from "next/head";
import { useState } from "react";
import { uid } from "uid";
export default function Home() {
  const id = uid();
  const [joinId, setJoinId] = useState("");
  return (
    <div>
      <Head>
        <title>Super Poll</title>
        <meta name="description" content="Create polls for free" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="main">
        <h1 className="title">Super pools</h1>
        <p>Create polls for free</p>
       
        <div className="flex home-content">   
        <a className="btn-1" href={`/poll/${id}`}>
          Create Poll
        </a>
        <div className="join">
          <input
            type="text"
            placeholder="Enter poll id"
            value={joinId}
            className="input"
            onChange={(e) => setJoinId(e.target.value)}
          />
          <a className="btn-2" href={joinId ? `/poll/${joinId}` : '#'}>
            Join Poll
          </a>
        </div>
        </div>
      </main>
    </div>
  );
}
