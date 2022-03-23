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
  let linux_placeholder = document.getElementById("release-download-btn-linux-container");

  function set_download_url(id, url) {
    let ele = document.getElementById(id);
    if (ele) {
      ele.innerText = url;
    }
  }

  function present_release(rel) {
    let assets = rel.assets;
    let x86_64_linux = assets.find(x => x.name.indexOf("x86_64") >= 0 && x.name.indexOf("linux") >= 0);
    let aarch64_linux = assets.find(x => x.name.indexOf("aarch64") >= 0 && x.name.indexOf("linux") >= 0);
    let is_x64 = false;
    if (window.navigator.userAgent.indexOf("x86_64") >= 0 || window.navigator.userAgent.indexOf("x64") >= 0) {
      is_x64 = true;
    }
    let linux_btns = [];
    if (x86_64_linux) {
      let url = x86_64_linux.browser_download_url;
      linux_btns.push(["x86_64 Linux", url]);
      set_download_url("x86_64-linux-download-url", url);
    }
    if (aarch64_linux) {
      let url = aarch64_linux.browser_download_url;
      linux_btns.push(["ARM64 Linux", url]);
      set_download_url("aarch64-linux-download-url", url);
    }
    if (!is_x64) {
      linux_btns.reverse();
    }
    if (linux_placeholder) {
      for (let [name, url] of linux_btns) {
        let node = document.createElement("a");
        node.className = "btn btn-primary mt-0";
        node.innerText = `Download v${rel.name} (${name})`;
        node.href = url;
        linux_placeholder.append(node, document.createTextNode(" "));
      }
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
