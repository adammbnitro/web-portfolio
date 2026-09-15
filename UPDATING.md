# Updating the portfolio

## How to add a portfolio project

1. Add an optimised screenshot to `assets/projects/`.
2. Open `js/projects.js`.
3. Copy an existing project object, including its surrounding `{ }` and comma.
4. Change its `name`, `type`, `image`, `url`, and `status` values.
5. Save the file and refresh the website.

For a live project, add the full website address to `url` and leave `status` empty:

```js
url: "https://example.com",
status: ""
```

For a demo or in-progress project, leave `url` empty and describe its state in `status`:

```js
url: "",
status: "Demo build"
```

## Other common changes

- **Change your portrait:** replace `assets/images/adam-mohamed-benkada.webp` with a square WebP image using the same filename.
- **Update WhatsApp:** open `js/script.js` and add your international `https://wa.me/` link to `WHATSAPP_URL` near the top.
- **Edit service wording:** open `index.html`, find the Services section, and edit the relevant heading or paragraph.
