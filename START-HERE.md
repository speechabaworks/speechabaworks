# Start here

Four commands. If something goes wrong, the answer is almost certainly in
"When it does not work" at the bottom.

## 1. Check your Node version first

```
node --version
```

**This must print v22.12.0 or higher.** Astro 7 does not run on anything older.
If it prints v18, v20, or "command not found", install the current LTS from
<https://nodejs.org> and run `node --version` again in a **new** terminal
window before going on.

If you skip this check, `npm install` will stop with a message about an
unsupported engine. That message is correct — it is not a broken download.

## 2. Open this folder in a terminal

On a Mac: open Terminal, type `cd ` (with a space), then drag the
`speechabaworks` folder onto the Terminal window and press Enter.

On Windows: open the folder, click the address bar, type `powershell` and
press Enter.

## 3. Install and build

```
npm install
npm run build
```

**The word `run` is not optional.** `npm install` is a built-in npm command,
but `build` is a script belonging to this project, and `npm run` is what
reaches it. Typing `npm build` gives you `Unknown command: "build"` — that is
npm not recognising the word, not a problem with the site.

Same for every other script here: `npm run preview`, `npm run sync:hans`.
Only `npm install` goes without it.

`npm install` takes a few minutes the first time and prints a funding notice
at the end — that is normal, not an error. `npm run build` should end with
`33 page(s) built` and `Complete!`.

## 4. Look at the site

```
npm run preview
```

Then open <http://localhost:4321> in your browser. Press `Ctrl+C` in the
terminal to stop it.

---

## When it does not work

**`Unknown command: "build"`.**
You typed `npm build`. It needs to be `npm run build`. Nothing is wrong with
the project — npm just does not have a command called `build`.

**"Unsupported engine" or a wall of red during `npm install`.**
Your Node is too old. Go back to step 1.

**The build finishes, but opening `dist/index.html` by double-clicking shows
an unstyled page with no images.**
That is expected and does not mean the build failed. The pages use absolute
paths (`/images/...`), which a browser cannot resolve from a `file://`
address. Use `npm run preview` instead — that is what step 4 is for.

**`npm run preview` says something is already using port 4321.**
An earlier preview is still running. Run `npx astro preview stop`, or close
the other terminal window.

**`command not found: npm`.**
Node did not install, or the terminal window predates the install. Open a new
terminal and try `node --version` again.

**Anything else.**
Copy the last twenty lines of the terminal output. The error text is what
identifies the problem — "it does not run" cannot be diagnosed without it.

---

Full reference, including the Cloudflare deploy and the optional extras, is in
`SETUP.md` next to this file.
