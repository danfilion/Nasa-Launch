import {html, css, LitElement} from 'https://cdn.skypack.dev/lit'; //'lit';

export class SimpleGreeting extends LitElement {
  static styles = css`p { color: white }`;

  static properties = {
    name: {type: String},
  };

  constructor() {
    super();
    this.name = 'Somebody';
  }

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
customElements.define('simple-greeting', SimpleGreeting);
