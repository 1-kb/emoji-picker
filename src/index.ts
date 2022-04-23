import { CATEGORIES, fetchEmoji, createSheet } from "./helper";
import styles from './style.css?inline';

const sheet = createSheet(styles);

let EmojiUnicodeTables = [];

setTimeout(async () => {
  EmojiUnicodeTables = Object.entries(await fetchEmoji());
}, 0);

class EmojiPicker extends HTMLElement {
  static tagName: string = "emoji-picker";

  constructor() {
    super();

    this.addEventListener("pointerenter", this.onPointerEnter);
    this.addEventListener("pointerout", this.onPointerOut);
    this.addEventListener("pointerup", this.onPointerUp);
  }

  private onPointerEnter() {
    if (this.shadowRoot) {
      return;
    }

    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = `<span><input id="x" type="checkbox"/><label for="x"><slot></slot><main><ul>${
      Object.entries(CATEGORIES).filter(([k, v]) => !!v).map(([k, v]) =>
        `<li><label title="${k}" for="${k}">${v}</label></li>`
      ).join("")
    }</ul><div>${
      EmojiUnicodeTables.map(([key, values]) => {
        return `<ul title="${CATEGORIES[key]} ${key}"><input id="${key}" />${values.map((v) => `<li>${v}</li>`).join("")}</ul>`;
      }).join("")
    }</div></main></label></span>`;
  }

  private onPointerOut() {
    this.shadowRoot.querySelector("input").checked = false;
  }

  private onPointerUp(e: PointerEvent) {
    const target = e.path[0];
    if (target.tagName === "LI") {
      this.textContent = target.textContent;
    }
  }
}

window.customElements.define(EmojiPicker.tagName, EmojiPicker);
