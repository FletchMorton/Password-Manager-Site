import React, {useEffect, useLayoutEffect, useState} from "react";
import {CopyIcon, ShownIcon, HiddenIcon} from "./Icon.js";

export const ValidatingForm = ({onSubmit, validate, children, inputError="", setInputError=undefined}) => {
  const inputErrState = useState("");
  const [inputE, setInputE] = setInputError ? [inputError, setInputError] : inputErrState

  // don't validate until after state has updated
  const [onInputFlipper, setOnInputFlipper] = useState(false);
  useEffect(() => { if (inputE && !validate()) setInputE(""); }, [onInputFlipper]);

  return <form onSubmit={e => {
    e.preventDefault();
    const inputErr = validate();
    if (inputErr) return setInputE(inputErr);
    setInputE("");
    return onSubmit(e);
  }} onInput={() => {if (inputE) setOnInputFlipper(!onInputFlipper)}}>
    {children}
    {inputE && !setInputError && <p className="error-message">{inputE}</p>}
  </form>
}

export const DirtyableInput = ({dirty, setDirty, value, required, invalid=(required && !value), className="", onChange = e=>{}, onBlur = e=>{}, ...attrs}) => (
  <input {...attrs} className={className + (invalid && dirty ? " invalid" : "")} value={value} onChange={e => {onChange(e); setDirty(true)}} onBlur={e => {onBlur(e); setDirty(true)}} />
)

const BaseCopyableInput = ({copyText, children, className=""}) => (
  <span className={"entry-input " + className}>
    {children}
    <button type="button" onClick={() => { navigator.clipboard.writeText(copyText); }} aria-label="Copy" className="icon-button"><CopyIcon /></button>
  </span>
);

export const CardInput = ({text, disabled=false, onChange, dirty=false, setDirty=v=>{}}) => {
  const [masked, setMasked] = useState(text.length > 4);
  const [tempUnmasked, setTempUnmasked] = useState(false);  // necessary to allow input while it's masked

  useLayoutEffect(() => {
    if (disabled && text.length > 4) setMasked(true);
  }, [text, disabled]);

  return (
    <BaseCopyableInput copyText={text}>
      <DirtyableInput type="text" className={masked ? "masked" : ""} disabled={disabled} value={masked && !tempUnmasked && text.length > 4 ? "\u25cf".repeat(text.length - 4) + text.slice(-4) : text} inputMode="numeric" onFocus={e => setTempUnmasked(true)} onChange={e => {onChange(e.currentTarget.value)}} onBlur={e => setTempUnmasked(false)} required dirty={dirty} setDirty={setDirty} />
      <button type="button" onClick={() => setMasked(!masked)} aria-label={masked ? "Show" : "Hide"} className="icon-button">{masked ? <HiddenIcon /> : <ShownIcon />}</button>
    </BaseCopyableInput>
  )
}

const CopyableInput = ({text, inputMode="text", maskable=false, disabled=false, onChange, maxLength=-1, minLength=0, required=false, dirty=false, setDirty=v=>{}}) => {
  const [masked, setMasked] = useState(maskable);

  useLayoutEffect(() => {
    if (disabled && maskable) setMasked(true);
  }, [disabled, maskable]);

  return (
    <BaseCopyableInput copyText={text}>
      <DirtyableInput type={masked ? "password" : "text"} inputMode={inputMode} className={masked ? "masked" : ""} disabled={disabled} value={text} onChange={e => onChange(e.currentTarget.value)} minLength={minLength} maxLength={maxLength} required={required} dirty={dirty} setDirty={setDirty} />
      {maskable && <button type="button" onClick={() => setMasked(!masked)} aria-label={masked ? "Show" : "Hide"} className="icon-button">{masked ? <HiddenIcon /> : <ShownIcon />}</button>}
    </BaseCopyableInput>
  );
}

export default CopyableInput;
