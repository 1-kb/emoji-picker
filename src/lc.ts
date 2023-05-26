import { appendChild, createElement, createTextNode } from "lib0/dom";
export const shadowRoot = Symbol("shadowRoot");

export function define(factory: Function, name: string = "lc-" + factory.name) {
  if (customElements.get(name)) return;
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        this[shadowRoot] = this.attachShadow({ mode: "closed" });
      }

      _disconnectedCallback?: Function;
      connectedCallback() {
        this._disconnectedCallback = factory.call(this);
      }

      disconnectedCallback() {
        this._disconnectedCallback && this._disconnectedCallback.call(this);
      }
    }
  );
  return name;
}

export const h = (tag, attrs, ...childs: any[]) => {
  const el = createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    // @ts-ignore
    el.setAttribute(k, v);
  });
  (childs || []).map((children) => {
    if (typeof children === "string") {
      appendChild(el, createTextNode(children));
    } else if (children instanceof Array) {
      children.forEach((c) => appendChild(el, c));
    } else {
      appendChild(el, children);
    }
  });

  return el;
};

export const createSheet = (css: string) => {
  const el = new CSSStyleSheet();
  el.replaceSync(css);
  return el;
};