export const debugFetch = (url, {body = {}, headers = {}, ...options}, devMode, debugFallback, debugWait = 0) => {
  const isDevelopment = /* window.location.hostname === "localhost" && */ process.env.NODE_ENV === "development";
  if (devMode)
    return debugFallback
      ? new Promise(res => setTimeout(() => res(debugFallback), debugWait))
      : Promise.reject("no debug fallback!");
  return fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    ...options,
    body: JSON.stringify(body),
  }).then(async res => {
    if (res.ok) return res.json();
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // we're probably POSTing to the wrong route, then.
      console.error(text, "when fetching", url);
      
      throw new Error("Unexpected response. Try again later." + (isDevelopment ? `(error "${e.message}" when fetching "${url}"; full error ${text})` : ""),
        {cause: e});
    }
    console.error(json, "when fetching", url);
    throw new Error(json.message + (isDevelopment ? `(error returned from server when fetching "${url}")` : ""), {cause: json});
  }, err => {
    console.error(err, "when fetching", url);
    throw new Error("The server is not responding. Try again later." + (isDevelopment ? `(network error "${err.message}" when fetching "${url}")` : ""),
      {cause: err});
  });
};

export const authFetch = ({token=""}, url, {body, ...options}, devMode, debugFallback, debugWait = 0) =>
  debugFetch(url, {...options, body: {...body, session: token}}, devMode, debugFallback, debugWait);
