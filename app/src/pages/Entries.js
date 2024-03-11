import React, {useEffect, useLayoutEffect, useState} from "react";
import {Await, Form, Link, useAsyncError, useLoaderData, useSearchParams} from "react-router-dom";
import LoginEntry from "../components/LoginEntry.js";
import SecureNoteEntry from "../components/SecureNoteEntry.js";
import CardEntry from "../components/CardEntry.js";
import {useCookies} from "react-cookie";
import {SearchIcon} from "../components/Icon.js";

const simplifyEntry = (type, {_id, ...item}) => ({id: _id, type, ...item})

const updateEntry = (entries, setEntries, i, type) => newItem => {
  const newEntries = entries.slice();
  newEntries[i] = simplifyEntry(type, newItem);
  setEntries(newEntries);
}
const deleteEntry = (entries, setEntries, i) => () => {
  const newEntries = entries.slice(0, i).concat(entries.slice(i+1));
  setEntries(newEntries);
}
const appendEntry = (entries, setEntries, type) => (newItem) => {
  const newEntries = entries.concat(simplifyEntry(type, newItem));
  setEntries(newEntries);
}

const EntriesList = ({items, devMode, defaultType}) => {
  const [entries, setEntries] = useState(items);

  /** @type {*} */
  const DefaultEntryKind = defaultType === "secureNote" ? SecureNoteEntry : defaultType === "card" ? CardEntry : LoginEntry;

  return <>{entries.map((item, i) => {
    switch (item.type) {
      case "secureNote": return <SecureNoteEntry noteInfo={item} key={item.id} onSave={updateEntry(entries, setEntries, i, item.type)} onDelete={deleteEntry(entries, setEntries, i)} devMode={devMode} />;
      case "card": return <CardEntry cardInfo={item} key={item.id} onSave={updateEntry(entries, setEntries, i, item.type)} onDelete={deleteEntry(entries, setEntries, i)} devMode={devMode} />;
      default: return <LoginEntry passInfo={item} key={item.id} onSave={updateEntry(entries, setEntries, i, item.type)} onDelete={deleteEntry(entries, setEntries, i)} devMode={devMode} />;
    }
  }).concat(<DefaultEntryKind onSave={appendEntry(entries, setEntries, defaultType)} devMode={devMode} />)}</>;
}

export const Searchbar = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  return <Form className="search" relative="path">
    <input type="search" value={query} name="q" onChange={e => setQuery(e.currentTarget.value)} placeholder="Search..." />
    <button type="submit" aria-label="Search" className="icon-button"><SearchIcon /></button>
  </Form>
}

const ErrorMessage = ({onEnterDevMode}) => {
  const error = useAsyncError();

  return <><span className="error-message">{error+""}</span>{onEnterDevMode && <p style={{color: "#400", backgroundColor: "#fdd"}}>Try <button onClick={onEnterDevMode}>dev mode</button>?</p>}</>
}

const Entries = ({defaultType, onEnterDevMode, devMode}) => {
  const [cookies] = useCookies(["token"]);
  const loaderData = /** @type {{items: object[]}} */ (useLoaderData());
  const [params] = useSearchParams();

  if (!cookies.token) return <div className="error-page">
    <p>You need to be logged in to see this page. <Link to="/">Go back home</Link></p>
  </div>

  return (
    <>
      {/* <Searchbar /> */}
      <div className="entry-list">
        <React.Suspense fallback={<div className="loader">Loading...</div>}>
          <Await
            resolve={loaderData.items}
            errorElement={<ErrorMessage onEnterDevMode={onEnterDevMode} />}
            children={(items) => <EntriesList key={params.get("q") ?? ""} defaultType={defaultType} items={items.map(item => simplifyEntry(defaultType, item))} devMode={devMode} />}
          />
        </React.Suspense>
      </div>
    </>
  )
}

export default Entries;
