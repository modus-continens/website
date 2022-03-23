const RELEASES_URL = "https://api.github.com/repos/modus-continens/modus/releases";

let doc_ready = new Promise(resolve => {
  if (document.readyState == "complete") {
    resolve();
  } else {
    document.addEventListener("readystatechange", evt => {
      if (document.readyState === "complete") {
        resolve();
      }
    })
  }
});

async function update_releases(err, res) {
  let placeholder = document.getElementById("release-download-btn-container");
  function present_release(rel) {
    let assets = rel.assets;
    let x86_64 = assets.find(x => x.name.indexOf("x86_64") >= 0 && x.name.indexOf("linux") >= 0);
    let aarch64 = assets.find(x => x.name.indexOf("aarch64") >= 0 && x.name.indexOf("linux") >= 0);
    if (window.navigator.userAgent.indexOf("x86_64") >= 0) {
      aarch64 = null;
    }
    let btns = [];
    if (aarch64) {
      let url = aarch64.browser_download_url;
      btns.push(["ARM64 Linux", url]);
    }
    if (x86_64) {
      let url = x86_64.browser_download_url;
      btns.push(["x86_64 Linux", url]);
    }
    let eft = placeholder.firstChild;
    for (let [name, url] of btns) {
      let node = document.createElement("a");
      node.className = "btn btn-primary mt-0";
      node.innerText = `Download v${rel.name} (${name})`;
      node.href = url;
      placeholder.insertBefore(node, eft);
      placeholder.insertBefore(document.createTextNode(" "), eft);
    }
  }
  function show_error(err) {
    let etext = document.createElement("div");
    etext.className = "alert alert-danger";
    etext.setAttribute("role", "alert");
    etext.innerText = `Unable to get releases: ${err}`;
    placeholder.parentNode.insertBefore(etext, placeholder);
  }

  await doc_ready;
  if (err) {
    show_error(err.message);
  } else {

    let valid_rel = res.filter(x => !x.draft);
    let non_prerel = valid_rel.filter(x => !x.prerelease);
    if (non_prerel.length > 0) {
      present_release(non_prerel[0]);
    } else if (valid_rel.length > 0) {
      present_release(valid_rel[0]);
    } else {
      show_error("No valid releases found");
    }
  }
}

fetch(RELEASES_URL, { method: "GET", credentials: "omit" })
  .then(res => res.json())
  .then(res => {
    update_releases(null, res);
  })
  .catch(err => {
    update_releases(err, null);
  });
