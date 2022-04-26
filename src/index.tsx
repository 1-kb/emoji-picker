import { CATEGORIES, createSheet, fetchEmoji } from "./helper";
import { define, h, shadowRoot } from "./lc";
import { addEventListener, removeEventListener } from "lib0/dom";
import styles from "./style.css?inline";
import { appendChild } from "lib0/dom";

const sheet = createSheet(styles);

function onEmojiPickerPointerOut(e: Event) {
  this[shadowRoot].querySelector("input").checked = false;
}

function onEmojiPickerPointerUp(e: Event) {
  const target = e.path[0];
  if (target.tagName === "LI") {
    requestAnimationFrame(() => {
      this.textContent = target.textContent;
    });
  }
}

let panelLoader = (async () => {
  const panel = (
    <span>
      <input id="x" type="checkbox"></input>
      <label for="x">
        <slot></slot>
        <main>
          <ul>
            {Object.entries(CATEGORIES).filter(([k, v]) => !!v).map((
              [k, v],
            ) => (
              <li>
                <label title={k} for={k}>{v}</label>
              </li>
            ))}
          </ul>
          <div>
            {Object.entries(await fetchEmoji()).map(([key, values]) => (
              <ul title={`${CATEGORIES[key]} ${key}`}>
                <input id={key} />
                {values.map((v) => <li>{v}</li>)}
              </ul>
            ))}
          </div>
        </main>
      </label>
    </span>
  );

  panelLoader = () => panel.clone(true);
  return panel;
});

define(function emoji() {

  this[shadowRoot].adoptedStyleSheets = [sheet];

  panelLoader().then((el) => {
    const root = el.cloneNode(true)

    addEventListener(this, "pointerout", onEmojiPickerPointerOut);
    addEventListener(root, "pointerup", onEmojiPickerPointerUp.bind(this));

    appendChild(this[shadowRoot], root);
  });
}, 'lc-emoji');
