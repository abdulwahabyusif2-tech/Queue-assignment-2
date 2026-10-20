# Call Center Queue Simulator (Web)

A browser app built with plain HTML, CSS and JavaScript that simulates a call center using the **queue** data structure. Calls wait in FIFO queues until an agent is free. VIP callers are dispatched before standard callers.

## Features

- Add incoming calls (name, phone, issue, VIP or standard)
- Separate VIP and standard queues, first come first served in each
- Auto-dispatch (or manual Dispatch button) to free agents
- End calls to free agents and log them
- Live waiting times, agent status and statistics
- Call log table and CSV export
- Light and dark mode, responsive layout

## Structure

```
index.html        Page markup
css/style.css     Styles
js/queue.js       Linked-list Queue class (enqueue, dequeue, isEmpty, toArray)
js/app.js         Call center logic and UI
```

## Run locally

Open `index.html` in a browser. No build step or dependencies.

## Deploy with GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit: call center queue simulator"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/call-center-web.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**. The site appears at `https://YOUR-USERNAME.github.io/call-center-web/` after a minute or two.

## License

MIT
