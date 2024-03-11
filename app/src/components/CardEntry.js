import React, {useLayoutEffect, useState} from "react";
import BaseEntry from "./BaseEntry.js";
import CopyableInput, {CardInput, DirtyableInput} from "./CopyableInput.js";
import {authFetch} from "../auth.js";
import {useCookies} from "react-cookie";
import {formatList} from "../util.js";

const CardEntry = ({cardInfo, devMode, onSave, onDelete}) => {
  const [editable, setEditable] = useState(!cardInfo);
  const [unsaved, setUnsaved] = useState(!cardInfo);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCVV] = useState("");
  const [expiration, setExpiration] = useState("");
  const [bank, setBank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [cookies] = useCookies(["token", "userid"]);

  const init = () => {
    setCardNumber(cardInfo?.cardNumber ?? "");
    setCVV(cardInfo?.cvv ?? "");
    setExpiration(cardInfo?.expiration ?? "");
    setBank(cardInfo?.bank ?? "");
    setFirstName(cardInfo?.firstName ?? "");
    setLastName(cardInfo?.lastName ?? "");
    setZip(cardInfo?.zip ?? "");
    setBillingAddress(cardInfo?.billingAddress ?? "");
  }
  
  const [cardNumberDirty, setCardNumberDirty] = useState(false);
  const [cvvDirty, setCVVDirty] = useState(false);
  const [expirationDirty, setExpirationDirty] = useState(false);
  const [bankDirty, setBankDirty] = useState(false);
  const [firstNameDirty, setFirstNameDirty] = useState(false);
  const [lastNameDirty, setLastNameDirty] = useState(false);
  const [zipDirty, setZipDirty] = useState(false);
  const [billingAddressDirty, setBillingAddressDirty] = useState(false);

  const expirationValid = () => expiration.match(/^\d{4}-\d{2}$/);

  const validate = () => {
    setCardNumberDirty(true);
    setCVVDirty(true);
    setExpirationDirty(true);
    setBankDirty(true);
    setFirstNameDirty(true);
    setLastNameDirty(true);
    setZipDirty(true);
    setBillingAddressDirty(true);
    const missing = [
      (!firstName || !lastName) && (firstName ? "last name" : lastName ? "first name" : "name"),
      !bank && "issuer",
      !cardNumber && "card number",
      !cvv && "CVV",
      !expiration ? "expiration" : !expirationValid() && "valid expiration",
    ].filter(i => i);
    return missing.length && "Missing " + formatList(missing);
  }

  // layout effects run before the component's added to DOM
  useLayoutEffect(init, [cardInfo]);

  return (
    <BaseEntry className="card"
      title={(cardNumber.length > 4 ? "*".repeat(cardNumber.length - 4) : "") + cardNumber.slice(-4)}
      subtitle={bank}
      isNew={!cardInfo} isEmpty={!(cardNumber || cvv || expiration || bank || firstName || lastName || zip || billingAddress)}
      editable={editable} setEditable={setEditable} editing={unsaved} onEdit={() => setUnsaved(true)} onSave={async () => {
        const newCard = (await authFetch(cookies, cardInfo?.id ? "/server/card/update" : "/server/card/create", {body: {cardNumber, cvv, expiration, bank, firstName, lastName, zip, billingAddress, _id: cardInfo?.id}},
          devMode, {card: {cardNumber, cvv, expiration, bank, firstName, lastName, zip, billingAddress, _id: cardInfo?.id ?? ""+Math.random()}}, 1000)).card;
        setUnsaved(false);
        onSave(newCard);
      }} validate={validate}
      onCancel={() => {
        setUnsaved(false);
        init();
      }}
      onDelete={async () => {
        setUnsaved(true);
        if (cardInfo) await authFetch(cookies, "/server/card/delete", {body: {_id: cardInfo.id}, method: "DELETE"},
          devMode, {}, 1000);
        onDelete();
      }}
    >
      <label>
        Name: <DirtyableInput type="text" required placeholder="Firstname" value={firstName} onChange={e => setFirstName(e.currentTarget.value)} disabled={!editable} dirty={firstNameDirty} setDirty={setFirstNameDirty} />
        <DirtyableInput type="text" required placeholder="Lastname" value={lastName} onChange={e => setLastName(e.currentTarget.value)} disabled={!editable} dirty={lastNameDirty} setDirty={setLastNameDirty} />
      </label>
      <label>
        Issuer: <DirtyableInput type="text" required value={bank} onChange={e => setBank(e.currentTarget.value)} disabled={!editable} dirty={bankDirty} setDirty={setBankDirty} />
      </label>
      <label>
        Card number: <CardInput text={cardNumber} onChange={setCardNumber} disabled={!editable} />
      </label>
      <label>
        CVV: <CopyableInput inputMode="numeric" maskable minLength={3} maxLength={3} required text={cvv} onChange={setCVV} disabled={!editable} />
      </label>
      <label>
        Expiration: <DirtyableInput type="month" required pattern="\d{4}-\d{2}" invalid={!expirationValid()} placeholder="2029-12" value={expiration} onChange={e => setExpiration(e.currentTarget.value)} disabled={!editable} dirty={expirationDirty} setDirty={setExpirationDirty} />
      </label>
      <label>
        Billing address <span className="secondary-text">(optional)</span>: <input type="text" value={billingAddress} onChange={e => setBillingAddress(e.currentTarget.value)} disabled={!editable} />
      </label>
      <label>
        Zip <span className="secondary-text">(optional)</span>: <input type="text" minLength={5} maxLength={5} inputMode="numeric" value={zip} onChange={e => setZip(e.currentTarget.value)} disabled={!editable} />
      </label>
    </BaseEntry>
  );
}

export default CardEntry;
